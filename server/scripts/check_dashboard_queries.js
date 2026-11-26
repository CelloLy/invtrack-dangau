const { Pool } = require('../node_modules/pg');
require('../node_modules/dotenv').config({ path: __dirname + '/../.env' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:cello@localhost:5432/invtrack_dangau' });

async function checkQueries() {
  const emergencyStockQuery = `
    SELECT 
      inv.id as inventory_id,
      i.id as item_id,
      i.sku,
      i.item_name,
      c.category_name,
      un.unit_name,
      inv.current_stock,
      i.minimum_stock,
      i.critical_stock,
      inv.warehouse_id,
      w.warehouse_code,
      w.warehouse_name,
      'Darurat' as status_darurat,
      ROUND((i.critical_stock - inv.current_stock), 2) as defisit_stok
    FROM inventory inv
    JOIN items i ON inv.item_id = i.id
    JOIN categories c ON i.category_id = c.id
    JOIN units un ON i.unit_id = un.id
    JOIN warehouses w ON inv.warehouse_id = w.id
    WHERE inv.current_stock <= i.critical_stock
    ORDER BY (inv.current_stock / NULLIF(i.critical_stock, 0)) ASC, inv.current_stock ASC
    LIMIT 15
  `;
  const res = await pool.query(emergencyStockQuery);
  console.log('Emergency stock rows count:', res.rows.length);
  res.rows.forEach((r, i) => {
    console.log(i, {
      sku: r.sku,
      item_name: r.item_name,
      category_name: r.category_name,
      unit_name: r.unit_name,
      warehouse_code: r.warehouse_code,
      warehouse_name: r.warehouse_name
    });
  });

  const expiringQuery = `
    SELECT 
      inv.id as inventory_id,
      i.id as item_id,
      i.sku,
      i.item_name,
      c.category_name,
      un.unit_name,
      i.expiry_date,
      (i.expiry_date - CURRENT_DATE) as days_left,
      inv.warehouse_id,
      w.warehouse_code,
      w.warehouse_name,
      inv.current_stock,
      CASE 
        WHEN (i.expiry_date - CURRENT_DATE) < 0 THEN 'Kadaluarsa'
        WHEN (i.expiry_date - CURRENT_DATE) <= 7 THEN 'Kritis EXP'
        WHEN (i.expiry_date - CURRENT_DATE) <= 30 THEN 'Segera EXP'
        ELSE 'Peringatan EXP'
      END as status_exp
    FROM items i
    JOIN inventory inv ON i.id = inv.item_id
    JOIN categories c ON i.category_id = c.id
    JOIN units un ON i.unit_id = un.id
    JOIN warehouses w ON inv.warehouse_id = w.id
    WHERE i.expiry_date IS NOT NULL 
      AND inv.current_stock > 0
      AND (i.expiry_date - CURRENT_DATE) <= 60
    ORDER BY i.expiry_date ASC
    LIMIT 15
  `;
  const resExp = await pool.query(expiringQuery);
  console.log('Expiring rows count:', resExp.rows.length);
  resExp.rows.forEach((r, i) => {
    console.log(i, {
      sku: r.sku,
      item_name: r.item_name,
      expiry_date: r.expiry_date,
      days_left: r.days_left,
      status_exp: r.status_exp
    });
  });

  await pool.end();
}

checkQueries().catch(console.error);

