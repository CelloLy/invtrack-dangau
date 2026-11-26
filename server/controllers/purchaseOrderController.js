const db = require('../config/db');
const { sendNotification } = require('../utils/notificationHelper');

exports.getPurchaseOrders = async (req, res) => {
  try {
    const { warehouse_id, status } = req.query;

    let query = `
      SELECT 
        po.id, po.po_number, po.po_date, po.status, po.total_amount, po.notes, po.created_at,
        po.warehouse_id, w.warehouse_code, w.warehouse_name,
        po.supplier_id, s.supplier_name, s.contact as supplier_contact,
        po.purchase_request_id, pr.pr_number,
        u.name as created_by_name,
        (
          SELECT json_agg(json_build_object(
            'id', poi.id,
            'item_id', poi.item_id,
            'item_name', i.item_name,
            'sku', i.sku,
            'quantity', poi.quantity,
            'unit_name', un.unit_name,
            'unit_price', poi.unit_price,
            'total_price', poi.total_price
          ))
          FROM purchase_order_items poi
          JOIN items i ON poi.item_id = i.id
          JOIN units un ON i.unit_id = un.id
          WHERE poi.purchase_order_id = po.id
        ) as items
      FROM purchase_orders po
      JOIN warehouses w ON po.warehouse_id = w.id
      JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN purchase_requests pr ON po.purchase_request_id = pr.id
      LEFT JOIN users u ON po.created_by = u.id
    `;

    const whereClauses = [];
    const params = [];

    if (warehouse_id) {
      params.push(warehouse_id);
      whereClauses.push(`po.warehouse_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      whereClauses.push(`po.status = $${params.length}`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }

    query += ` ORDER BY po.id DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getPurchaseOrders:', err);
    res.status(500).json({ message: 'Gagal mengambil data Pesanan Pembelian (PO).' });
  }
};

exports.getPurchaseOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const poQuery = `
      SELECT 
        po.id, po.po_number, po.po_date, po.status, po.total_amount, po.notes, po.created_at,
        po.warehouse_id, w.warehouse_code, w.warehouse_name, w.location as warehouse_location,
        po.supplier_id, s.supplier_name, s.contact as supplier_contact, s.address as supplier_address,
        po.purchase_request_id, pr.pr_number,
        u.name as created_by_name
      FROM purchase_orders po
      JOIN warehouses w ON po.warehouse_id = w.id
      JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN purchase_requests pr ON po.purchase_request_id = pr.id
      LEFT JOIN users u ON po.created_by = u.id
      WHERE po.id = $1
    `;
    const poRes = await db.query(poQuery, [id]);
    if (poRes.rows.length === 0) {
      return res.status(404).json({ message: 'Purchase Order tidak ditemukan.' });
    }

    const itemsQuery = `
      SELECT poi.id, poi.item_id, i.sku, i.item_name, poi.quantity, un.unit_name, poi.unit_price, poi.total_price
      FROM purchase_order_items poi
      JOIN items i ON poi.item_id = i.id
      JOIN units un ON i.unit_id = un.id
      WHERE poi.purchase_order_id = $1
    `;
    const itemsRes = await db.query(itemsQuery, [id]);

    res.json({
      ...poRes.rows[0],
      items: itemsRes.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail Purchase Order.' });
  }
};

exports.createPurchaseOrder = async (req, res) => {
  const client = await db.getClient();
  try {
    const { supplier_id, warehouse_id, purchase_request_id, notes, items } = req.body;

    if (!supplier_id || !warehouse_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Supplier, gudang tujuan, dan minimal 1 barang wajib diisi.' });
    }

    await client.query('BEGIN');

    const countRes = await client.query(`SELECT COUNT(*) FROM purchase_orders`);
    const nextId = parseInt(countRes.rows[0].count, 10) + 1;
    const po_number = `PO-2026-${String(nextId).padStart(4, '0')}`;

    let grandTotal = 0;

    // First insert header with initial 0 amount
    const poQuery = `
      INSERT INTO purchase_orders (po_number, purchase_request_id, supplier_id, warehouse_id, total_amount, notes, created_by, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Dipesan')
      RETURNING *
    `;
    const poRes = await client.query(poQuery, [
      po_number,
      purchase_request_id || null,
      supplier_id,
      warehouse_id,
      0,
      notes || 'Pesanan Pembelian',
      req.user.id
    ]);
    const po = poRes.rows[0];

    for (const itemObj of items) {
      const { item_id, quantity, unit_price } = itemObj;
      const qty = parseFloat(quantity);
      const price = parseFloat(unit_price || 0);

      if (!item_id || isNaN(qty) || qty <= 0) {
        throw new Error('Jumlah barang (quantity) harus lebih besar dari 0.');
      }

      const itemTotal = qty * price;
      grandTotal += itemTotal;

      await client.query(
        `INSERT INTO purchase_order_items (purchase_order_id, item_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [po.id, item_id, qty, price, itemTotal]
      );
    }

    // Update grand total
    await client.query(`UPDATE purchase_orders SET total_amount = $1 WHERE id = $2`, [grandTotal, po.id]);

    // If PR linked, update PR status to 'Dipenuhi'
    if (purchase_request_id) {
      await client.query(`UPDATE purchase_requests SET status = 'Dipenuhi' WHERE id = $1`, [purchase_request_id]);
    }

    await client.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, reference_id) VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'PURCHASE_ORDER', `Membuat Purchase Order ${po_number} (Total: Rp ${grandTotal.toLocaleString('id-ID')})`, po_number]
    );

    // Kirim notifikasi ke Petugas Gudang & Master
    await sendNotification({
      targetRole: 'Petugas Gudang',
      title: 'Pesanan Pembelian Diterbitkan',
      message: `Pesanan Pembelian ${po_number} telah diterbitkan dan menunggu kedatangan barang.`,
      type: 'INFO',
      link: '/barang-masuk'
    });
    await sendNotification({
      targetRole: 'Master',
      title: 'PO Baru Diterbitkan',
      message: `Pesanan Pembelian ${po_number} telah diterbitkan dengan total Rp ${grandTotal.toLocaleString('id-ID')}.`,
      type: 'INFO',
      link: '/dashboard'
    });

    await client.query('COMMIT');
    res.status(201).json({ message: 'Purchase Order berhasil dibuat.', purchase_order: { ...po, total_amount: grandTotal } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error createPurchaseOrder:', err);
    res.status(400).json({ message: err.message || 'Gagal membuat Purchase Order.' });
  } finally {
    client.release();
  }
};

exports.updatePurchaseOrder = async (req, res) => {
  const client = await db.getClient();
  try {
    const { id } = req.params;
    const { supplier_id, warehouse_id, purchase_request_id, notes, items } = req.body;

    if (!supplier_id || !warehouse_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Supplier, gudang tujuan, dan minimal 1 barang wajib diisi.' });
    }

    await client.query('BEGIN');

    // Check if PO exists
    const checkRes = await client.query(`SELECT id, po_number FROM purchase_orders WHERE id = $1`, [id]);
    if (checkRes.rows.length === 0) {
      throw new Error('Pesanan Pembelian tidak ditemukan.');
    }
    const poNumber = checkRes.rows[0].po_number;

    let grandTotal = 0;
    // Delete existing line items
    await client.query(`DELETE FROM purchase_order_items WHERE purchase_order_id = $1`, [id]);

    for (const itemObj of items) {
      const { item_id, quantity, unit_price } = itemObj;
      const qty = parseFloat(quantity);
      const price = parseFloat(unit_price || 0);

      if (!item_id || isNaN(qty) || qty <= 0) {
        throw new Error('Jumlah barang (quantity) harus lebih besar dari 0.');
      }

      const itemTotal = qty * price;
      grandTotal += itemTotal;

      await client.query(
        `INSERT INTO purchase_order_items (purchase_order_id, item_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, item_id, qty, price, itemTotal]
      );
    }

    // Update PO header
    await client.query(
      `UPDATE purchase_orders 
       SET supplier_id = $1, warehouse_id = $2, notes = $3, total_amount = $4, status = 'Dipesan'
       WHERE id = $5`,
      [supplier_id, warehouse_id, notes || 'Pesanan Pembelian', grandTotal, id]
    );

    // If PR linked, update PR status to 'Dipenuhi'
    if (purchase_request_id) {
      await client.query(`UPDATE purchase_requests SET status = 'Dipenuhi' WHERE id = $1`, [purchase_request_id]);
    }

    await client.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, reference_id) VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'PURCHASE_ORDER', `Memperbarui & Menerbitkan Purchase Order ${poNumber} (Total: Rp ${grandTotal.toLocaleString('id-ID')})`, poNumber]
    );

    // Send notifications
    await sendNotification({
      targetRole: 'Petugas Gudang',
      title: 'Pesanan Pembelian Diterbitkan',
      message: `Pesanan Pembelian ${poNumber} telah diterbitkan dan menunggu kedatangan barang.`,
      type: 'INFO',
      link: '/barang-masuk'
    });

    await client.query('COMMIT');
    res.json({ message: 'Pesanan Pembelian berhasil disimpan dan diterbitkan.', purchase_order: { id, po_number: poNumber, total_amount: grandTotal } });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updatePurchaseOrder:', err);
    res.status(400).json({ message: err.message || 'Gagal memperbarui Purchase Order.' });
  } finally {
    client.release();
  }
};
