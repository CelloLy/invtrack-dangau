const db = require('../config/db');
const { sendNotification } = require('../utils/notificationHelper');

exports.getGoodsIssues = async (req, res) => {
  try {
    const { warehouse_id, outlet_name, search } = req.query;

    let query = `
      SELECT 
        gi.id, gi.gi_number, gi.requester_name, gi.outlet_name, gi.issue_date, gi.status, gi.notes, gi.attachment_url, gi.created_at,
        gi.warehouse_id, w.warehouse_code, w.warehouse_name,
        u.name as created_by_name,
        (
          SELECT json_agg(json_build_object(
            'id', gii.id,
            'item_id', gii.item_id,
            'item_name', i.item_name,
            'sku', i.sku,
            'quantity', gii.quantity,
            'unit_name', gii.unit_name
          ))
          FROM goods_issue_items gii
          JOIN items i ON gii.item_id = i.id
          WHERE gii.goods_issue_id = gi.id
        ) as items
      FROM goods_issues gi
      JOIN warehouses w ON gi.warehouse_id = w.id
      JOIN users u ON gi.created_by = u.id
    `;

    const whereClauses = [];
    const params = [];

    if (warehouse_id) {
      params.push(warehouse_id);
      whereClauses.push(`gi.warehouse_id = $${params.length}`);
    }

    if (outlet_name) {
      params.push(`%${outlet_name}%`);
      whereClauses.push(`gi.outlet_name ILIKE $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`(gi.gi_number ILIKE $${params.length} OR gi.requester_name ILIKE $${params.length})`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }

    query += ` ORDER BY gi.id DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getGoodsIssues:', err);
    res.status(500).json({ message: 'Gagal mengambil data pengeluaran/pengambilan barang.' });
  }
};

exports.getGoodsIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        gi.id, gi.gi_number, gi.requester_name, gi.outlet_name, gi.issue_date, gi.status, gi.notes, gi.attachment_url, gi.created_at,
        gi.warehouse_id, w.warehouse_code, w.warehouse_name,
        u.name as created_by_name
      FROM goods_issues gi
      JOIN warehouses w ON gi.warehouse_id = w.id
      JOIN users u ON gi.created_by = u.id
      WHERE gi.id = $1
    `;
    const giRes = await db.query(query, [id]);
    if (giRes.rows.length === 0) {
      return res.status(404).json({ message: 'Transaksi Pengambilan Barang tidak ditemukan.' });
    }

    const itemsQuery = `
      SELECT gii.id, gii.item_id, i.sku, i.item_name, gii.quantity, gii.unit_name
      FROM goods_issue_items gii
      JOIN items i ON gii.item_id = i.id
      WHERE gii.goods_issue_id = $1
    `;
    const itemsRes = await db.query(itemsQuery, [id]);

    res.json({
      ...giRes.rows[0],
      items: itemsRes.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail pengambilan barang.' });
  }
};

exports.createGoodsIssue = async (req, res) => {
  const client = await db.getClient();
  try {
    const { warehouse_id, requester_name, outlet_name, notes, items, attachment_url } = req.body;

    if (!warehouse_id || !requester_name || !outlet_name || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Gudang asal, pemohon, outlet, dan minimal 1 barang wajib diisi.' });
    }

    const VALID_OUTLETS = ['Warung Dangau', 'Hotel Dangau', 'Randayan', 'Tanggooe Pizzeria'];
    if (!VALID_OUTLETS.includes(outlet_name)) {
      return res.status(400).json({ 
        message: `Outlet tidak valid. Sistem hanya mendukung 4 outlet resmi: ${VALID_OUTLETS.join(', ')}.` 
      });
    }

    await client.query('BEGIN');

    // Generate Transaction Number (OUT-YYYYMMDD-XXXX)
    const countRes = await client.query(`SELECT COUNT(*) FROM goods_issues`);
    const nextId = parseInt(countRes.rows[0].count, 10) + 1;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const gi_number = `OUT-${dateStr}-${String(nextId).padStart(4, '0')}`;

    // 1. Insert goods_issues header
    const giQuery = `
      INSERT INTO goods_issues (gi_number, warehouse_id, requester_name, outlet_name, notes, created_by, attachment_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Selesai')
      RETURNING *
    `;
    const giRes = await client.query(giQuery, [
      gi_number,
      warehouse_id,
      requester_name,
      outlet_name,
      notes || 'Pengambilan Barang Keluar',
      req.user.id,
      attachment_url || null
    ]);
    const gi = giRes.rows[0];

    const insertedItemsSummary = [];

    // Process each item in the goods issue
    for (const itemObj of items) {
      const { item_id, quantity } = itemObj;
      const qty = parseFloat(quantity);
      if (!item_id || isNaN(qty) || qty <= 0) {
        throw new Error('Jumlah barang (quantity) harus lebih besar dari 0.');
      }

      // Fetch item info
      const itemInfo = await client.query(
        `SELECT i.item_name, i.sku, u.unit_name FROM items i JOIN units u ON i.unit_id = u.id WHERE i.id = $1`,
        [item_id]
      );
      if (itemInfo.rows.length === 0) {
        throw new Error(`Barang dengan ID ${item_id} tidak ditemukan.`);
      }
      const { item_name, sku, unit_name } = itemInfo.rows[0];

      // Check current stock & lock row
      const invCheck = await client.query(
        `SELECT current_stock FROM inventory WHERE item_id = $1 AND warehouse_id = $2 FOR UPDATE`,
        [item_id, warehouse_id]
      );

      let currentStock = 0;
      if (invCheck.rows.length > 0) {
        currentStock = parseFloat(invCheck.rows[0].current_stock);
      } else {
        throw new Error(`Barang '${item_name}' belum memiliki data stok di gudang ini.`);
      }

      // STOK VALIDATION: Cannot issue more than available stock!
      if (currentStock < qty) {
        throw new Error(`Stok '${item_name}' tidak mencukupi di gudang ini (Stok tersedia: ${currentStock} ${unit_name}, Diminta: ${qty} ${unit_name}).`);
      }

      const stockBefore = currentStock;
      const stockAfter = stockBefore - qty;

      // 2. Insert goods_issue_items
      await client.query(
        `INSERT INTO goods_issue_items (goods_issue_id, item_id, quantity, unit_name) VALUES ($1, $2, $3, $4)`,
        [gi.id, item_id, qty, unit_name]
      );

      // 3. Update inventory current_stock (-)
      await client.query(
        `UPDATE inventory SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP WHERE item_id = $2 AND warehouse_id = $3`,
        [qty, item_id, warehouse_id]
      );

      // 4. Insert inventory_movements
      await client.query(
        `INSERT INTO inventory_movements (item_id, warehouse_id, transaction_type, reference_id, quantity, stock_before, stock_after, created_by, notes)
         VALUES ($1, $2, 'OUT', $3, $4, $5, $6, $7, $8)`,
        [item_id, warehouse_id, gi_number, qty, stockBefore, stockAfter, req.user.id, `Pengambilan untuk ${outlet_name}`]
      );

      insertedItemsSummary.push(`${item_name} (-${qty} ${unit_name})`);
    }

    // 5. Insert activity_logs
    await client.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, reference_id) VALUES ($1, $2, $3, $4)`,
      [
        req.user.id,
        'GOODS_ISSUE',
        `${req.user.name} mencatat Pengambilan Barang OUT ${gi_number} (${outlet_name}): ${insertedItemsSummary.join(', ')}`,
        gi_number
      ]
    );

    // Kirim notifikasi ke Admin & Master
    await sendNotification({
      targetRole: 'Admin',
      title: 'Pengeluaran Barang (OUT)',
      message: `Pengeluaran ${gi_number} untuk ${outlet_name} telah dicatat oleh ${req.user.name || 'Petugas'}.`,
      type: 'ISSUE',
      link: '/barang-keluar'
    });
    await sendNotification({
      targetRole: 'Master',
      title: 'Pengeluaran Barang Dicatat',
      message: `Distribusi barang ${gi_number} untuk ${outlet_name} selesai diproses.`,
      type: 'ISSUE',
      link: '/dashboard'
    });

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Barang Keluar / Pengambilan berhasil diproses dan stok berkurang.',
      goods_issue: gi
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error createGoodsIssue:', err);
    res.status(400).json({ message: err.message || 'Gagal menyimpan Barang Keluar.' });
  } finally {
    client.release();
  }
};
