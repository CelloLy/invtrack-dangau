const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/db');

async function seedUnpriced() {
  try {
    const item = await db.query("SELECT id, item_name, unit_id FROM items WHERE id = 3 LIMIT 1");
    const wh = await db.query("SELECT id FROM warehouses LIMIT 1");
    const sup = await db.query("SELECT id FROM suppliers LIMIT 1");
    const userGudang = await db.query("SELECT id FROM users WHERE role_id = 3 LIMIT 1");

    // Remove any existing GR-202611-0005
    await db.query("DELETE FROM goods_receipts WHERE gr_number = 'GR-202611-0005'");

    const grRes = await db.query(`
      INSERT INTO goods_receipts (gr_number, warehouse_id, supplier_id, receipt_date, notes, created_by, is_price_verified, total_amount)
      VALUES ('GR-202611-0005', $1, $2, CURRENT_TIMESTAMP, 'Barang fisik baru diantar supplier & dicek Gudang. Menunggu faktur & input harga oleh Accounting.', $3, FALSE, 0)
      RETURNING id
    `, [wh.rows[0].id, sup.rows[0].id, userGudang.rows[0].id]);

    await db.query(`
      INSERT INTO goods_receipt_items (goods_receipt_id, item_id, quantity, unit_name, unit_price, total_price)
      VALUES ($1, $2, 5, 'Roll', 0, 0)
    `, [grRes.rows[0].id, item.rows[0].id]);

    console.log('--- Successfully seeded fresh unpriced receipt GR-202611-0005 for Accounting! ---');
  } catch (err) {
    console.error('Error seeding unpriced receipt:', err);
  } finally {
    await db.pool.end();
  }
}

seedUnpriced();
