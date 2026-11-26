const db = require('../config/db');

exports.getInventory = async (req, res) => {
  try {
    const { warehouse_id } = req.query;

    let query = `
      SELECT 
        inv.id as inventory_id,
        inv.item_id,
        i.sku,
        i.item_name,
        c.category_name,
        u.unit_name,
        i.minimum_stock,
        i.critical_stock,
        i.unit_price,
        inv.warehouse_id,
        w.warehouse_code,
        w.warehouse_name,
        inv.current_stock,
        (inv.current_stock * i.unit_price) as total_value,
        inv.updated_at
      FROM inventory inv
      JOIN items i ON inv.item_id = i.id
      JOIN categories c ON i.category_id = c.id
      JOIN units u ON i.unit_id = u.id
      JOIN warehouses w ON inv.warehouse_id = w.id
    `;

    const params = [];
    if (warehouse_id) {
      params.push(warehouse_id);
      query += ` WHERE inv.warehouse_id = $1`;
    }

    query += ` ORDER BY w.id ASC, i.item_name ASC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getInventory:', err);
    res.status(500).json({ message: 'Gagal mengambil data stok inventori.' });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const { warehouse_id } = req.query;

    let query = `
      SELECT 
        inv.id as inventory_id,
        inv.item_id,
        i.sku,
        i.item_name,
        c.category_name,
        u.unit_name,
        i.minimum_stock,
        i.critical_stock,
        inv.warehouse_id,
        w.warehouse_code,
        w.warehouse_name,
        inv.current_stock,
        CASE 
          WHEN inv.current_stock <= i.critical_stock THEN 'Kritis'
          WHEN inv.current_stock <= i.minimum_stock THEN 'Rendah'
          ELSE 'Normal'
        END as stock_status
      FROM inventory inv
      JOIN items i ON inv.item_id = i.id
      JOIN categories c ON i.category_id = c.id
      JOIN units u ON i.unit_id = u.id
      JOIN warehouses w ON inv.warehouse_id = w.id
      WHERE inv.current_stock <= i.minimum_stock
    `;

    const params = [];
    if (warehouse_id) {
      params.push(warehouse_id);
      query += ` AND inv.warehouse_id = $1`;
    }

    query += ` ORDER BY inv.current_stock ASC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data stok rendah.' });
  }
};

exports.getMovements = async (req, res) => {
  try {
    const { warehouse_id, item_id } = req.query;

    let query = `
      SELECT 
        m.id, m.item_id, i.sku, i.item_name, u.unit_name,
        m.warehouse_id, w.warehouse_code, w.warehouse_name,
        m.transaction_type, m.reference_id, m.quantity,
        m.stock_before, m.stock_after, m.notes, m.created_at,
        usr.name as created_by_name
      FROM inventory_movements m
      JOIN items i ON m.item_id = i.id
      JOIN units u ON i.unit_id = u.id
      JOIN warehouses w ON m.warehouse_id = w.id
      LEFT JOIN users usr ON m.created_by = usr.id
    `;

    const whereClauses = [];
    const params = [];

    if (warehouse_id) {
      params.push(warehouse_id);
      whereClauses.push(`m.warehouse_id = $${params.length}`);
    }

    if (item_id) {
      params.push(item_id);
      whereClauses.push(`m.item_id = $${params.length}`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }

    query += ` ORDER BY m.id DESC LIMIT 100`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil kartu stok / riwayat pergerakan.' });
  }
};
