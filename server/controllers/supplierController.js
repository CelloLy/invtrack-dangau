const db = require('../config/db');

exports.getSuppliers = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM suppliers ORDER BY id ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data supplier.' });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { supplier_name, contact, address } = req.body;
    if (!supplier_name || !supplier_name.trim()) {
      return res.status(400).json({ message: 'Nama supplier/vendor wajib diisi.' });
    }
    try {
      await db.query(`SELECT setval(pg_get_serial_sequence('suppliers', 'id'), COALESCE(MAX(id), 1)) FROM suppliers`);
    } catch (e) {
      // ignore
    }
    const query = `
      INSERT INTO suppliers (supplier_name, contact, address)
      VALUES ($1, $2, $3) RETURNING *
    `;
    const result = await db.query(query, [supplier_name.trim(), contact || '-', address || '-']);
    res.status(201).json({ message: 'Supplier berhasil ditambahkan', supplier: result.rows[0] });
  } catch (err) {
    console.error('Error createSupplier:', err);
    res.status(500).json({ message: 'Gagal menambahkan supplier.' });
  }
};
