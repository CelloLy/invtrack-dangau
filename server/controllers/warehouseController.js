const db = require('../config/db');

exports.getWarehouses = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM warehouses ORDER BY id ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data gudang.' });
  }
};

exports.getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`SELECT * FROM warehouses WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gudang tidak ditemukan.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail gudang.' });
  }
};
