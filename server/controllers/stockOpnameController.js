const db = require('../config/db');
const { sendNotification } = require('../utils/notificationHelper');

exports.getStockOpnames = async (req, res) => {
  try {
    const { warehouse_id } = req.query;

    let query = `
      SELECT 
        so.id, so.opname_number, so.opname_date, so.status, so.notes, so.created_at,
        so.warehouse_id, w.warehouse_code, w.warehouse_name,
        u.name as created_by_name,
        (
          SELECT json_agg(json_build_object(
            'id', soi.id,
            'item_id', soi.item_id,
            'item_name', i.item_name,
            'sku', i.sku,
            'unit_name', un.unit_name,
            'system_stock', soi.system_stock,
            'physical_stock', soi.physical_stock,
            'difference', soi.difference,
            'reason', soi.reason
          ))
          FROM stock_opname_items soi
          JOIN items i ON soi.item_id = i.id
          JOIN units un ON i.unit_id = un.id
          WHERE soi.stock_opname_id = so.id
        ) as items
      FROM stock_opnames so
      JOIN warehouses w ON so.warehouse_id = w.id
      JOIN users u ON so.user_id = u.id
    `;

    const params = [];
    if (warehouse_id) {
      params.push(warehouse_id);
      query += ` WHERE so.warehouse_id = $1`;
    }

    query += ` ORDER BY so.id DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getStockOpnames:', err);
    res.status(500).json({ message: 'Gagal mengambil data Stock Opname.' });
  }
};

exports.getStockOpnameById = async (req, res) => {
  try {
    const { id } = req.params;
    const soQuery = `
      SELECT 
        so.id, so.opname_number, so.opname_date, so.status, so.notes, so.created_at,
        so.warehouse_id, w.warehouse_code, w.warehouse_name,
        u.name as created_by_name
      FROM stock_opnames so
      JOIN warehouses w ON so.warehouse_id = w.id
      JOIN users u ON so.user_id = u.id
      WHERE so.id = $1
    `;
    const soRes = await db.query(soQuery, [id]);
    if (soRes.rows.length === 0) {
      return res.status(404).json({ message: 'Stock Opname tidak ditemukan.' });
    }

    const itemsQuery = `
      SELECT soi.id, soi.item_id, i.sku, i.item_name, un.unit_name, soi.system_stock, soi.physical_stock, soi.difference, soi.reason
      FROM stock_opname_items soi
      JOIN items i ON soi.item_id = i.id
      JOIN units un ON i.unit_id = un.id
      WHERE soi.stock_opname_id = $1
    `;
    const itemsRes = await db.query(itemsQuery, [id]);

    res.json({
      ...soRes.rows[0],
      items: itemsRes.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail Stock Opname.' });
  }
};

exports.createStockOpname = async (req, res) => {
  const client = await db.getClient();
  try {
    const { warehouse_id, notes, items } = req.body;

    if (!warehouse_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Gudang dan minimal 1 hasil fisik barang wajib diisi.' });
    }

    await client.query('BEGIN');

    const countRes = await client.query(`SELECT COUNT(*) FROM stock_opnames`);
    const nextId = parseInt(countRes.rows[0].count, 10) + 1;
    const opname_number = `SO-2026-${String(nextId).padStart(3, '0')}`;

    await client.query(`SELECT setval(pg_get_serial_sequence('stock_opnames', 'id'), COALESCE(MAX(id), 1)) FROM stock_opnames`);
    await client.query(`SELECT setval(pg_get_serial_sequence('stock_opname_items', 'id'), COALESCE(MAX(id), 1)) FROM stock_opname_items`);

    // 1. Insert stock_opnames header
    const soQuery = `
      INSERT INTO stock_opnames (opname_number, warehouse_id, user_id, notes, status)
      VALUES ($1, $2, $3, $4, 'Selesai')
      RETURNING *
    `;
    const soRes = await client.query(soQuery, [opname_number, warehouse_id, req.user.id, notes || 'Audit Stok Fisik']);
    const so = soRes.rows[0];

    const opnameSummary = [];

    for (const itemObj of items) {
      const { item_id, physical_stock, reason } = itemObj;
      const physicalQty = parseFloat(physical_stock);

      if (!item_id || isNaN(physicalQty) || physicalQty < 0) {
        throw new Error('Stok fisik harus bernilai angka non-negatif.');
      }

      // Fetch current system stock
      const invCheck = await client.query(
        `SELECT current_stock FROM inventory WHERE item_id = $1 AND warehouse_id = $2 FOR UPDATE`,
        [item_id, warehouse_id]
      );

      let systemStock = 0;
      if (invCheck.rows.length > 0) {
        systemStock = parseFloat(invCheck.rows[0].current_stock);
      }

      const diff = physicalQty - systemStock;

      // 2. Insert stock_opname_items
      await client.query(
        `INSERT INTO stock_opname_items (stock_opname_id, item_id, system_stock, physical_stock, difference, reason)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [so.id, item_id, systemStock, physicalQty, diff, reason || (diff === 0 ? 'Sesuai dengan fisik' : 'Penyesuaian fisik')]
      );

      // 3. Update inventory current_stock to match physical_stock
      await client.query(
        `UPDATE inventory SET current_stock = $1, updated_at = CURRENT_TIMESTAMP WHERE item_id = $2 AND warehouse_id = $3`,
        [physicalQty, item_id, warehouse_id]
      );

      // 4. Insert inventory_movements if there is a difference or audit record
      await client.query(
        `INSERT INTO inventory_movements (item_id, warehouse_id, transaction_type, reference_id, quantity, stock_before, stock_after, created_by, notes)
         VALUES ($1, $2, 'OPNAME_ADJUST', $3, $4, $5, $6, $7, $8)`,
        [item_id, warehouse_id, opname_number, diff, systemStock, physicalQty, req.user.id, `Stock Opname ${opname_number}: ${reason || 'Hasil Audit'}`]
      );

      // Fetch item name for summary
      const itemInfo = await client.query(`SELECT item_name FROM items WHERE id = $1`, [item_id]);
      const itemName = itemInfo.rows.length > 0 ? itemInfo.rows[0].item_name : `Item #${item_id}`;
      opnameSummary.push(`${itemName} (Sistem: ${systemStock}, Fisik: ${physicalQty}, Selisih: ${diff})`);
    }

    // 5. Insert activity_logs
    await client.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, reference_id) VALUES ($1, $2, $3, $4)`,
      [
        req.user.id,
        'STOCK_OPNAME',
        `${req.user.name} melakukan Stock Opname ${opname_number}: ${opnameSummary.join('; ')}`,
        opname_number
      ]
    );

    // Kirim notifikasi ke Admin & Master
    await sendNotification({
      targetRole: 'Admin',
      title: 'Stock Opname Selesai',
      message: `Stock Opname ${opname_number} selesai diinput oleh ${req.user.name}. Penyesuaian stok telah diterapkan.`,
      type: 'OPNAME',
      link: '/stok-opname'
    });
    await sendNotification({
      targetRole: 'Master',
      title: 'Laporan Stock Opname',
      message: `Audit fisik stok ${opname_number} telah diselesaikan. Laporan audit tersedia untuk ditinjau.`,
      type: 'OPNAME',
      link: '/dashboard'
    });

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Stock Opname berhasil disimpan dan stok disesuaikan.',
      stock_opname: so
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error createStockOpname:', err);
    res.status(400).json({ message: err.message || 'Gagal membuat Stock Opname.' });
  } finally {
    client.release();
  }
};
