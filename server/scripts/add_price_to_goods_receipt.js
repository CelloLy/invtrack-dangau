const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/db');

async function migrate() {
  try {
    console.log('--- Migrating Goods Receipt Price Columns ---');
    await db.query(`
      ALTER TABLE goods_receipt_items 
      ADD COLUMN IF NOT EXISTS unit_price NUMERIC(15, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_price NUMERIC(15, 2) DEFAULT 0;

      ALTER TABLE goods_receipts
      ADD COLUMN IF NOT EXISTS total_amount NUMERIC(15, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_price_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS price_verified_by INT REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS price_verified_at TIMESTAMP;
    `);

    // Backfill existing goods_receipt_items with master items unit_price if available
    await db.query(`
      UPDATE goods_receipt_items gri
      SET 
        unit_price = i.unit_price,
        total_price = gri.quantity * i.unit_price
      FROM items i
      WHERE gri.item_id = i.id AND (gri.unit_price IS NULL OR gri.unit_price = 0) AND i.unit_price > 0;

      UPDATE goods_receipts gr
      SET 
        total_amount = COALESCE(sub.total, 0),
        is_price_verified = TRUE
      FROM (
        SELECT goods_receipt_id, SUM(total_price) as total 
        FROM goods_receipt_items 
        GROUP BY goods_receipt_id
      ) sub
      WHERE gr.id = sub.goods_receipt_id AND sub.total > 0;
    `);

    // Let's create one unpriced goods receipt so there's an immediate demo record
    // that needs pricing by Accounting!
    const unpricedCheck = await db.query(`
      SELECT COUNT(*) FROM goods_receipts WHERE is_price_verified = FALSE OR total_amount = 0
    `);

    if (parseInt(unpricedCheck.rows[0].count, 10) === 0) {
      const item = await db.query("SELECT id, item_name, unit_id FROM items WHERE item_name ILIKE '%BAYCLIN%' LIMIT 1");
      const wh = await db.query("SELECT id FROM warehouses LIMIT 1");
      const sup = await db.query("SELECT id FROM suppliers LIMIT 1");
      const userGudang = await db.query("SELECT id FROM users WHERE role_id = 3 LIMIT 1");

      const grRes = await db.query(`
        INSERT INTO goods_receipts (gr_number, warehouse_id, supplier_id, receipt_date, notes, created_by, is_price_verified, total_amount)
        VALUES ('GR-202611-0004', $1, $2, CURRENT_TIMESTAMP - INTERVAL '35 minutes', 'Barang baru diterima fisik oleh Petugas Gudang. Wajib input harga oleh Accounting.', $3, FALSE, 0)
        RETURNING id
      `, [wh.rows[0].id, sup.rows[0].id, userGudang.rows[0].id]);

      await db.query(`
        INSERT INTO goods_receipt_items (goods_receipt_id, item_id, quantity, unit_name, unit_price, total_price)
        VALUES ($1, $2, 20, 'Btl', 0, 0)
      `, [grRes.rows[0].id, item.rows[0].id]);
      console.log('Sample unpriced receipt created for Accounting to price!');
    }

    console.log('Unpriced goods receipts count:', unpricedCheck.rows[0].count);

    const result = await db.query(`
      SELECT gri.id, gr.gr_number, gri.item_id, i.item_name, gri.quantity, gri.unit_price, gri.total_price, gr.is_price_verified
      FROM goods_receipt_items gri
      JOIN goods_receipts gr ON gri.goods_receipt_id = gr.id
      JOIN items i ON gri.item_id = i.id
      ORDER BY gr.id DESC;
    `);
    console.table(result.rows);
    console.log('--- Migration Complete Successfully ---');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await db.pool.end();
  }
}

migrate();
