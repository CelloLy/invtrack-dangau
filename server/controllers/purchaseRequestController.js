const db = require('../config/db');
const { sendNotification } = require('../utils/notificationHelper');

exports.getPurchaseRequests = async (req, res) => {
  try {
    const { warehouse_id, status } = req.query;

    let query = `
      SELECT 
        pr.id, pr.pr_number, pr.status, pr.notes, pr.rejection_reason, pr.created_at,
        pr.warehouse_id, w.warehouse_code, w.warehouse_name,
        pr.user_id, u.name as requester_name, u.phone as requester_phone,
        (
          SELECT json_agg(json_build_object(
            'id', pri.id,
            'item_id', pri.item_id,
            'item_name', i.item_name,
            'sku', i.sku,
            'quantity', pri.quantity,
            'unit_name', un.unit_name,
            'urgency', pri.urgency,
            'status', pri.status
          ))
          FROM purchase_request_items pri
          JOIN items i ON pri.item_id = i.id
          JOIN units un ON i.unit_id = un.id
          WHERE pri.purchase_request_id = pr.id
        ) as items
      FROM purchase_requests pr
      JOIN warehouses w ON pr.warehouse_id = w.id
      JOIN users u ON pr.user_id = u.id
    `;

    const whereClauses = [];
    const params = [];

    if (warehouse_id) {
      params.push(warehouse_id);
      whereClauses.push(`pr.warehouse_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      whereClauses.push(`pr.status = $${params.length}`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }

    query += ` ORDER BY pr.id DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getPurchaseRequests:', err);
    res.status(500).json({ message: 'Gagal mengambil data Permintaan Pembelian.' });
  }
};

exports.createPurchaseRequest = async (req, res) => {
  const client = await db.getClient();
  try {
    const { warehouse_id, notes, items } = req.body;

    if (!warehouse_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Gudang dan minimal 1 item barang wajib diisi.' });
    }

    await client.query('BEGIN');

    const countRes = await client.query(`SELECT COUNT(*) FROM purchase_requests`);
    const nextId = parseInt(countRes.rows[0].count, 10) + 1;
    const pr_number = `PR-2026-${String(nextId).padStart(3, '0')}`;

    const prQuery = `
      INSERT INTO purchase_requests (pr_number, user_id, warehouse_id, notes, status)
      VALUES ($1, $2, $3, $4, 'Menunggu')
      RETURNING *
    `;
    const prRes = await client.query(prQuery, [pr_number, req.user.id, warehouse_id, notes || '']);
    const pr = prRes.rows[0];

    for (const itemObj of items) {
      const { item_id, quantity, urgency } = itemObj;
      const qty = parseFloat(quantity);
      if (!item_id || isNaN(qty) || qty <= 0) {
        throw new Error('Jumlah barang (quantity) harus lebih besar dari 0.');
      }
      await client.query(
        `INSERT INTO purchase_request_items (purchase_request_id, item_id, quantity, urgency, status)
         VALUES ($1, $2, $3, $4, 'Menunggu')`,
        [pr.id, item_id, qty, urgency || 'Normal']
      );
    }

    await client.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, reference_id) VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'PURCHASE_REQUEST', `Membuat Permintaan Pembelian ${pr_number}`, pr_number]
    );

    // Kirim notifikasi ke Admin & Master
    await sendNotification({
      targetRole: 'Admin',
      title: 'PR Baru Membutuhkan Review',
      message: `Permintaan Pembelian ${pr_number} diajukan oleh ${req.user.name || 'Petugas Gudang'} dan menunggu persetujuan.`,
      type: 'PR',
      link: '/permintaan-pembelian'
    });
    await sendNotification({
      targetRole: 'Master',
      title: 'Pengajuan PR Baru',
      message: `Permintaan Pembelian ${pr_number} diajukan untuk gudang dan menunggu review Accounting.`,
      type: 'PR',
      link: '/dashboard'
    });

    await client.query('COMMIT');
    res.status(201).json({ message: 'Permintaan Pembelian berhasil diajukan.', purchase_request: pr });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: err.message || 'Gagal membuat Permintaan Pembelian.' });
  } finally {
    client.release();
  }
};

exports.approvePurchaseRequest = async (req, res) => {
  const client = await db.getClient();
  try {
    const { id } = req.params;
    await client.query('BEGIN');

    const prRes = await client.query(`SELECT id, pr_number, warehouse_id, notes, status FROM purchase_requests WHERE id = $1`, [id]);
    if (prRes.rows.length === 0) {
      throw new Error('Permintaan Pembelian tidak ditemukan.');
    }
    const pr = prRes.rows[0];
    const prNumber = pr.pr_number;
    const targetWarehouseId = pr.warehouse_id || 1;

    if (pr.status === 'Disetujui') {
      const existingPoRes = await client.query(`SELECT po_number FROM purchase_orders WHERE purchase_request_id = $1 LIMIT 1`, [id]);
      const existingPoNumber = existingPoRes.rows[0]?.po_number || 'PO-2026-0001';
      await client.query('COMMIT');
      return res.json({
        message: `Permintaan Pembelian ${prNumber} sudah disetujui sebelumnya.`,
        po_number: existingPoNumber
      });
    }

    // Update purchase_requests status to 'Disetujui'
    await client.query(`UPDATE purchase_requests SET status = 'Disetujui' WHERE id = $1`, [id]);
    await client.query(`UPDATE purchase_request_items SET status = 'Disetujui' WHERE purchase_request_id = $1`, [id]);

    // Fetch requested items
    const prItemsRes = await client.query(
      `SELECT pri.item_id, pri.quantity, COALESCE(i.unit_price, 50000) as unit_price 
       FROM purchase_request_items pri 
       JOIN items i ON pri.item_id = i.id 
       WHERE pri.purchase_request_id = $1`,
      [id]
    );

    // Auto-generate Purchase Order (Pesanan Pembelian)
    const countRes = await client.query(`SELECT COUNT(*) FROM purchase_orders`);
    const count = parseInt(countRes.rows[0].count, 10) + 1;
    const poNumber = `PO-2026-${String(count).padStart(4, '0')}`;

    const poRes = await client.query(
      `INSERT INTO purchase_orders (po_number, supplier_id, warehouse_id, purchase_request_id, total_amount, status, notes, created_by)
       VALUES ($1, 1, $2, $3, 0, 'Diproses', $4, $5) RETURNING *`,
      [poNumber, targetWarehouseId, id, pr.notes || 'Pesanan dari PR Disetujui', req.user.id]
    );
    const poId = poRes.rows[0].id;

    let totalAmount = 0;
    for (const item of prItemsRes.rows) {
      const itemTotal = parseFloat(item.quantity) * parseFloat(item.unit_price);
      totalAmount += itemTotal;
      await client.query(
        `INSERT INTO purchase_order_items (purchase_order_id, item_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [poId, item.item_id, item.quantity, item.unit_price, itemTotal]
      );
    }

    await client.query(`UPDATE purchase_orders SET total_amount = $1 WHERE id = $2`, [totalAmount, poId]);

    await client.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, reference_id) VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'PURCHASE_APPROVAL', `Admin (Accounting) menyetujui Purchase Request ${prNumber}, stok bertambah, dan menerbitkan ${poNumber}`, poNumber]
    );

    // Kirim notifikasi ke Petugas Gudang & Master
    await sendNotification({
      targetRole: 'Petugas Gudang',
      title: 'Pengajuan PR Disetujui',
      message: `Permintaan Pembelian ${prNumber} telah DISETUJUI oleh Admin Accounting. Diterbitkan sebagai ${poNumber}.`,
      type: 'SUCCESS',
      link: '/permintaan-pembelian'
    });
    await sendNotification({
      targetRole: 'Master',
      title: 'PR Disetujui & PO Diterbitkan',
      message: `Supervisor Accounting telah menyetujui ${prNumber} dan menerbitkan pesanan ${poNumber}.`,
      type: 'SUCCESS',
      link: '/dashboard'
    });

    await client.query('COMMIT');
    res.json({
      message: `Permintaan Pembelian ${prNumber} disetujui dan pesanan ${poNumber} berhasil diterbitkan.`,
      po_number: poNumber
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(400).json({ message: err.message || 'Gagal menyetujui Permintaan Pembelian.' });
  } finally {
    client.release();
  }
};

exports.rejectPurchaseRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body || {};
    const reason = rejection_reason || 'Ditolak oleh Admin Accounting';
    await db.query(`UPDATE purchase_requests SET status = 'Ditolak', rejection_reason = $1 WHERE id = $2`, [reason, id]);
    await db.query(`UPDATE purchase_request_items SET status = 'Ditolak' WHERE purchase_request_id = $1`, [id]);
    
    if (req.user && req.user.id) {
      await db.query(
        `INSERT INTO activity_logs (user_id, activity_type, description, reference_id) VALUES ($1, $2, $3, $4)`,
        [req.user.id, 'PURCHASE_REJECTION', `Admin menolak Purchase Request ID ${id}: ${reason}`, String(id)]
      );
    }

    // Kirim notifikasi ke Petugas Gudang & Master
    await sendNotification({
      targetRole: 'Petugas Gudang',
      title: 'Pengajuan PR Ditolak',
      message: `Permintaan Pembelian #${id} DITOLAK oleh Accounting. Alasan: ${reason}`,
      type: 'DANGER',
      link: '/permintaan-pembelian'
    });
    await sendNotification({
      targetRole: 'Master',
      title: 'Pengajuan PR Ditolak',
      message: `Admin Accounting menolak Permintaan Pembelian #${id}. Alasan: ${reason}`,
      type: 'WARNING',
      link: '/dashboard'
    });

    res.json({ message: 'Permintaan Pembelian berhasil ditolak.', rejection_reason: reason });
  } catch (err) {
    console.error('Error rejectPurchaseRequest:', err);
    res.status(500).json({ message: 'Gagal menolak Permintaan Pembelian.' });
  }
};
