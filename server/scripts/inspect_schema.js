const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:cello@localhost:5432/invtrack_dangau'
});

async function main() {
  const itemsCols = await pool.query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'items' ORDER BY ordinal_position");
  console.log('Items columns:', itemsCols.rows);

  const invCols = await pool.query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'inventory' ORDER BY ordinal_position");
  console.log('Inventory columns:', invCols.rows);

  const fks = await pool.query(`
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND (ccu.table_name = 'items' OR ccu.table_name = 'inventory');
  `);
  console.log('Foreign keys referencing items/inventory:', fks.rows);

  // Check current transactions
  const counts = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM purchase_requests) as pr_count,
      (SELECT COUNT(*) FROM purchase_orders) as po_count,
      (SELECT COUNT(*) FROM goods_receipts) as gr_count,
      (SELECT COUNT(*) FROM goods_issues) as gi_count,
      (SELECT COUNT(*) FROM stock_opnames) as so_count
  `);
  console.log('Transaction counts:', counts.rows[0]);

  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

