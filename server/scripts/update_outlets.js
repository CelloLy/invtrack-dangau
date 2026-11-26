const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../config/db');

async function updateOutlets() {
  try {
    console.log('--- Updating Goods Issues Outlets ---');
    // 1. Update ID 1 to Warung Dangau
    await db.query(`
      UPDATE goods_issues 
      SET outlet_name = 'Warung Dangau', notes = 'Bahan masak sarapan resto Warung Dangau'
      WHERE id = 1 OR outlet_name ILIKE '%kitchen%' OR outlet_name ILIKE '%resto%';
    `);

    // 2. Update ID 2 to Hotel Dangau
    await db.query(`
      UPDATE goods_issues 
      SET outlet_name = 'Hotel Dangau', notes = 'Drop sandal dan amenities kamar Hotel Dangau'
      WHERE id = 2 OR outlet_name ILIKE '%housekeeping%';
    `);

    // 3. Update ID 3 to Tanggooe Pizzeria
    await db.query(`
      UPDATE goods_issues 
      SET outlet_name = 'Tanggooe Pizzeria', notes = 'Kebutuhan minuman resto Tanggooe Pizzeria'
      WHERE id = 3 OR outlet_name ILIKE '%vip lounge%';
    `);

    // 4. Check if Randayan exists, if not insert a 4th sample
    const randayanCheck = await db.query(`SELECT id FROM goods_issues WHERE outlet_name = 'Randayan'`);
    if (randayanCheck.rows.length === 0) {
      const itemRes = await db.query(`
        SELECT i.id, u.unit_name 
        FROM items i 
        JOIN units u ON i.unit_id = u.id 
        WHERE i.item_name ILIKE '%BAYCLIN%' OR i.item_name ILIKE '%SABUN%' 
        LIMIT 1
      `);
      const userRes = await db.query(`SELECT id FROM users LIMIT 1`);
      const userId = userRes.rows.length > 0 ? userRes.rows[0].id : 1;

      const newGi = await db.query(`
        INSERT INTO goods_issues (gi_number, warehouse_id, requester_name, outlet_name, issue_date, status, notes, created_by)
        VALUES ('GI-202611-0004', 1, 'Hendra Logistik', 'Randayan', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 'Disetujui', 'Suplai logistik persediaan operasional Randayan', $1)
        RETURNING id
      `, [userId]);
      const newGiId = newGi.rows[0].id;

      if (itemRes.rows.length > 0) {
        await db.query(`
          INSERT INTO goods_issue_items (goods_issue_id, item_id, quantity, unit_name)
          VALUES ($1, $2, 5, $3)
        `, [newGiId, itemRes.rows[0].id, itemRes.rows[0].unit_name]);
      }
    }

    // Any remaining non-matching outlet_name fallback to Warung Dangau:
    await db.query(`
      UPDATE goods_issues
      SET outlet_name = 'Warung Dangau'
      WHERE outlet_name NOT IN ('Warung Dangau', 'Hotel Dangau', 'Randayan', 'Tanggooe Pizzeria');
    `);

    const result = await db.query(`
      SELECT gi.id, gi.gi_number, gi.outlet_name, gi.requester_name, COUNT(gii.id) as item_count
      FROM goods_issues gi
      LEFT JOIN goods_issue_items gii ON gi.id = gii.goods_issue_id
      GROUP BY gi.id, gi.gi_number, gi.outlet_name, gi.requester_name
      ORDER BY gi.id ASC;
    `);
    console.log('Updated goods_issues:', result.rows);
    console.log('--- Successfully updated all goods issues to 4 official outlets! ---');
  } catch (err) {
    console.error('Error updating outlets:', err);
  } finally {
    await db.pool.end();
  }
}

updateOutlets();

