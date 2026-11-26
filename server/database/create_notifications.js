const db = require('../config/db');

async function createNotificationsTable() {
  try {
    console.log('Creating notifications table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        target_role VARCHAR(50),
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'INFO',
        link VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check count
    const res = await db.query('SELECT COUNT(*) FROM notifications');
    if (parseInt(res.rows[0].count, 10) === 0) {
      console.log('Seeding initial notifications for Master, Admin, and Petugas Gudang...');
      
      const seedNotifications = [
        // 1. Petugas Gudang Notifications
        {
          target_role: 'Petugas Gudang',
          title: 'Pengajuan PR Disetujui',
          message: 'Permintaan Pembelian PR-2026-001 telah disetujui oleh Supervisor Accounting. PO diterbitkan.',
          type: 'SUCCESS',
          link: '/permintaan-pembelian'
        },
        {
          target_role: 'Petugas Gudang',
          title: 'Peringatan Stok Gudang',
          message: 'Stok Mozzarella Cheese Block di Gudang Dangau tersisa 5 KG (Mendekati batas minimum).',
          type: 'WARNING',
          link: '/dashboard'
        },
        {
          target_role: 'Petugas Gudang',
          title: 'Jadwal Stock Opname',
          message: 'Stock Opname triwulan gudang utama telah dijadwalkan. Silakan periksa daftar fisik barang.',
          type: 'INFO',
          link: '/stok-opname'
        },

        // 2. Admin (Accounting Supervisor) Notifications
        {
          target_role: 'Admin',
          title: 'PR Baru Membutuhkan Review',
          message: 'Petugas Gudang mengajukan restock bahan makanan & maintenance untuk Gudang Dangau.',
          type: 'PR',
          link: '/permintaan-pembelian'
        },
        {
          target_role: 'Admin',
          title: 'Peringatan Stok Kritis',
          message: 'Item Semen Gresik 40kg tersisa 25 Sak (di bawah stok minimum 100 Sak). Disarankan order restock.',
          type: 'WARNING',
          link: '/pesanan-pembelian'
        },
        {
          target_role: 'Admin',
          title: 'Laporan Barang Keluar',
          message: 'Pengeluaran barang GI-2026-002 untuk Outlet Resto telah berhasil diproses.',
          type: 'INFO',
          link: '/barang-keluar'
        },

        // 3. Master (Executive Owner) Notifications
        {
          target_role: 'Master',
          title: 'Ringkasan Aktivitas Gudang',
          message: 'Laporan pergerakan stok harian untuk seluruh gudang Dangau Hotel telah diperbarui.',
          type: 'INFO',
          link: '/dashboard'
        },
        {
          target_role: 'Master',
          title: 'Persetujuan Pengadaan Terkini',
          message: 'Supervisor Accounting menyetujui PO pengadaan logistik berkala.',
          type: 'SUCCESS',
          link: '/pesanan-pembelian'
        },
        {
          target_role: 'Master',
          title: 'Audit Stok & Selisih Opname',
          message: 'Hasil Stock Opname berkala tersedia untuk ditinjau pada laporan audit master.',
          type: 'INFO',
          link: '/stok-opname'
        }
      ];

      for (const n of seedNotifications) {
        await db.query(`
          INSERT INTO notifications (target_role, title, message, type, link, is_read, created_at)
          VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP - (INTERVAL '1 minute' * floor(random() * 120)))
        `, [n.target_role, n.title, n.message, n.type, n.link]);
      }
    }

    console.log('Notifications setup completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error setting up notifications:', err);
    process.exit(1);
  }
}

createNotificationsTable();

