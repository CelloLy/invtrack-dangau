const { Pool } = require('../node_modules/pg');
require('../node_modules/dotenv').config({ path: __dirname + '/../.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:cello@localhost:5432/invtrack_dangau' });

async function checkCols() {
  for (const table of ['purchase_requests', 'purchase_request_items', 'purchase_orders', 'purchase_order_items', 'goods_receipts', 'goods_receipt_items', 'goods_issues', 'goods_issue_items']) {
    const cols = await pool.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1", [table]);
    console.log(`=== ${table} ===`);
    console.log(cols.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
  }
  await pool.end();
}
checkCols().catch(console.error);

