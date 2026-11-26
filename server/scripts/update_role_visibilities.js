const { Pool } = require('../node_modules/pg');
require('../node_modules/dotenv').config({ path: __dirname + '/../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:cello@localhost:5432/invtrack_dangau'
});

async function updateDb() {
  // Role 2 = Accounting / Admin: Permintaan Pembelian TIDAK DITAMPILKAN
  await pool.query(`
    UPDATE role_visibilities
    SET can_permintaan_pembelian = false, updated_at = CURRENT_TIMESTAMP
    WHERE role_id = 2;
  `);

  // Role 3 = Petugas Gudang: Pesanan Pembelian TIDAK DITAMPILKAN
  await pool.query(`
    UPDATE role_visibilities
    SET can_pesanan_pembelian = false, updated_at = CURRENT_TIMESTAMP
    WHERE role_id = 3;
  `);

  const res = await pool.query(`
    SELECT rv.*, r.role_name 
    FROM role_visibilities rv
    JOIN roles r ON rv.role_id = r.id
    ORDER BY rv.role_id ASC
  `);
  console.log('Updated role visibilities in PostgreSQL:');
  console.log(JSON.stringify(res.rows, null, 2));

  await pool.end();
}

updateDb().catch(err => {
  console.error(err);
  process.exit(1);
});

