const db = require('../config/db');

async function seedPendingPRs() {
  try {
    const check = await db.query("SELECT COUNT(*) FROM purchase_requests WHERE status = 'Menunggu'");
    if (parseInt(check.rows[0].count, 10) === 0) {
      const pr1 = await db.query(
        "INSERT INTO purchase_requests (pr_number, user_id, warehouse_id, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        ['PR-2026-003', 3, 1, 'Menunggu', 'Restok darurat bahan dapur Hotel Dangau']
      );
      await db.query(
        "INSERT INTO purchase_request_items (purchase_request_id, item_id, quantity, urgency, status) VALUES ($1, $2, $3, $4, $5), ($1, $6, $7, $8, $9)",
        [pr1.rows[0].id, 1, 50, 'Tinggi', 'Menunggu', 10, 20, 'Sedang', 'Menunggu']
      );

      const pr2 = await db.query(
        "INSERT INTO purchase_requests (pr_number, user_id, warehouse_id, status, notes) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        ['PR-2026-004', 3, 2, 'Menunggu', 'Pengajuan suku cadang dan pemeliharaan Gudang Rumah Bos']
      );
      await db.query(
        "INSERT INTO purchase_request_items (purchase_request_id, item_id, quantity, urgency, status) VALUES ($1, $2, $3, $4, $5), ($1, $6, $7, $8, $9)",
        [pr2.rows[0].id, 5, 10, 'Tinggi', 'Menunggu', 2, 25, 'Sedang', 'Menunggu']
      );
      console.log('Seeded 2 pending PRs successfully!');
    } else {
      console.log('Pending PR count already:', check.rows[0].count);
    }
  } catch (err) {
    console.error('Seed PR error:', err);
  } finally {
    process.exit(0);
  }
}

seedPendingPRs();
