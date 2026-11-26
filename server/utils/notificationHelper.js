const db = require('../config/db');

/**
 * Send a notification to a specific user or role
 * @param {Object} params
 * @param {number|null} params.userId - Specific user ID (optional)
 * @param {string} params.targetRole - 'ALL', 'Master', 'Admin', 'Petugas Gudang'
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {string} params.type - 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER' | 'PR' | 'PO' | 'RECEIPT' | 'ISSUE' | 'OPNAME'
 * @param {string|null} params.link - URL path to navigate to when clicked
 */
async function sendNotification({ userId = null, targetRole = 'ALL', title, message, type = 'INFO', link = null }) {
  try {
    const query = `
      INSERT INTO notifications (user_id, target_role, title, message, type, link, is_read, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, false, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const res = await db.query(query, [userId, targetRole, title, message, type, link]);
    return res.rows[0];
  } catch (err) {
    console.error('Error creating notification:', err.message);
    return null;
  }
}

module.exports = {
  sendNotification
};

