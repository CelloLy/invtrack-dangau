const db = require('../config/db');

async function seedPendingPRs() {
  try {
    console.log('Seeding 2 pending purchase requests into PostgreSQL...');
    
    // Ensure PR 1 and PR 2 exist and are in 'Menunggu' status
    await db.query(`
      INSERT INTO purchase_requests (id, pr_number, user_id, warehouse_id, status, notes, created_at)
      VALUES
        (1, 'PR-2026-001', 3, 1, 'Menunggu', 'Restok darurat bahan pokok harian & perlengkapan', NOW() - INTERVAL '2 days'),
        (2, 'PR-2026-002', 3, 2, 'Menunggu', 'Pengajuan rutin persediaan kabel & pipa bulanan', NOW() - INTERVAL '5 days')
      ON CONFLICT (id) DO UPDATE SET
        status = 'Menunggu',
        notes = EXCLUDED.notes;
    `);

    await db.query(`
      DELETE FROM purchase_request_items WHERE purchase_request_id IN (1, 2);
      
      INSERT INTO purchase_request_items (purchase_request_id, item_id, quantity, urgency, status)
      VALUES
        (1, 7, 20.00, 'Tinggi', 'Menunggu'),
        (1, 8, 50.00, 'Sedang', 'Menunggu'),
        (2, 3, 15.00, 'Tinggi', 'Menunggu'),
        (2, 5, 10.00, 'Sedang', 'Menunggu');
    `);

    console.log('Successfully seeded 2 pending PRs in PostgreSQL!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding pending PRs:', err);
    process.exit(1);
  }
}

seedPendingPRs();
