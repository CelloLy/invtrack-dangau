const { Pool } = require('../node_modules/pg');
require('../node_modules/dotenv').config({ path: __dirname + '/../.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:cello@localhost:5432/invtrack_dangau' });

async function checkUsers() {
  const cols = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
  console.log('Users columns:', cols.rows);
  const rows = await pool.query("SELECT * FROM users");
  console.log('Users rows:', rows.rows);
  await pool.end();
}
checkUsers().catch(console.error);

