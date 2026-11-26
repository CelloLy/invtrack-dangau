const db = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role_name;

    // Check low stock and insert dynamic low stock warning if not yet alerted today
    try {
      const lowStockRes = await db.query(`
        SELECT i.item_name, i.sku, i.minimum_stock, inv.current_stock, w.warehouse_name
        FROM inventory inv
        JOIN items i ON inv.item_id = i.id
        JOIN warehouses w ON inv.warehouse_id = w.id
        WHERE inv.current_stock <= i.minimum_stock
        LIMIT 2
      `);

      for (const item of lowStockRes.rows) {
        const notifTitle = `Peringatan Stok Menipis: ${item.item_name}`;
        // Check if an unread notification with this title exists in the last 6 hours
        const existingNotif = await db.query(`
          SELECT id FROM notifications 
          WHERE title = $1 AND created_at >= CURRENT_TIMESTAMP - INTERVAL '6 hours'
          LIMIT 1
        `, [notifTitle]);

        if (existingNotif.rows.length === 0) {
          await db.query(`
            INSERT INTO notifications (target_role, title, message, type, link, is_read, created_at)
            VALUES ('ALL', $1, $2, 'WARNING', '/dashboard', false, CURRENT_TIMESTAMP)
          `, [
            notifTitle,
            `Sisa stok ${item.item_name} di ${item.warehouse_name} tersisa ${parseFloat(item.current_stock)} unit (Batas minimum: ${parseFloat(item.minimum_stock)} unit).`
          ]);
        }
      }
    } catch (checkErr) {
      console.warn('Low stock auto-check warning:', checkErr.message);
    }

    const query = `
      SELECT id, user_id, target_role, title, message, type, link, is_read, created_at
      FROM notifications
      WHERE user_id = $1 OR target_role = $2 OR target_role = 'ALL'
      ORDER BY is_read ASC, created_at DESC, id DESC
      LIMIT 40
    `;

    const result = await db.query(query, [userId, userRole]);
    const notifications = result.rows;
    const unreadCount = notifications.filter(n => !n.is_read).length;

    res.json({
      notifications,
      unreadCount
    });
  } catch (err) {
    console.error('Error getNotifications:', err);
    res.status(500).json({ message: 'Gagal mengambil notifikasi pengguna.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE notifications SET is_read = true WHERE id = $1`, [id]);
    res.json({ message: 'Notifikasi ditandai telah dibaca.' });
  } catch (err) {
    console.error('Error markAsRead:', err);
    res.status(500).json({ message: 'Gagal memperbarui status notifikasi.' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role_name;

    await db.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = $1 OR target_role = $2 OR target_role = 'ALL'
    `, [userId, userRole]);

    res.json({ message: 'Semua notifikasi ditandai telah dibaca.' });
  } catch (err) {
    console.error('Error markAllAsRead:', err);
    res.status(500).json({ message: 'Gagal memperbarui semua notifikasi.' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM notifications WHERE id = $1`, [id]);
    res.json({ message: 'Notifikasi berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleteNotification:', err);
    res.status(500).json({ message: 'Gagal menghapus notifikasi.' });
  }
};

