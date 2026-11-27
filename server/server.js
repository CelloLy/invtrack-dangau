const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', apiRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'InvTrack Pro API Server is running.' });
});

// Serve frontend static build
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

// SPA Fallback for any client routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: 'Terjadi kesalahan sistem internal.' });
});

const syncSequences = async () => {
  const db = require('./config/db');
  const tables = ['purchase_orders', 'purchase_requests', 'goods_receipts', 'goods_issues', 'items', 'users', 'suppliers'];
  for (const t of tables) {
    try {
      await db.query(`SELECT setval(pg_get_serial_sequence('${t}', 'id'), COALESCE((SELECT MAX(id) FROM ${t}), 1))`);
    } catch (e) {}
  }
};

const initRoleVisibilities = async () => {
  const db = require('./config/db');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS role_visibilities (
        id SERIAL PRIMARY KEY,
        role_id INT REFERENCES roles(id) ON DELETE CASCADE,
        can_barang_masuk BOOLEAN DEFAULT TRUE,
        can_barang_keluar BOOLEAN DEFAULT TRUE,
        can_permintaan_pembelian BOOLEAN DEFAULT TRUE,
        can_pesanan_pembelian BOOLEAN DEFAULT TRUE,
        can_stok_opname BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_role_visibility UNIQUE (role_id)
      );

      INSERT INTO role_visibilities (role_id, can_barang_masuk, can_barang_keluar, can_permintaan_pembelian, can_pesanan_pembelian, can_stok_opname)
      VALUES 
        (1, true, true, true, true, true),
        (2, true, true, false, true, true),
        (3, true, true, true, false, true)
      ON CONFLICT (role_id) DO NOTHING;

      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
    `);
  } catch (err) {
    console.warn('initRoleVisibilities notice:', err.message);
  }
};

if (process.env.VERCEL !== '1') {
  app.listen(PORT, async () => {
    await syncSequences();
    await initRoleVisibilities();
    console.log(`====================================================`);
    console.log(` InvTrack Pro Server Running on http://localhost:${PORT}`);
    console.log(` Connected Database: PostgreSQL (${process.env.DB_NAME || 'invtrack_dangau'})`);
    console.log(`====================================================`);
  });
}

module.exports = app;

