const db = require('../config/db');

exports.getActivityLogs = async (req, res) => {
  try {
    const { activity_type, limit } = req.query;

    let query = `
      SELECT al.id, al.activity_type, al.description, al.reference_id, al.created_at,
             u.name as user_name, r.role_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
    `;

    const params = [];
    if (activity_type) {
      params.push(activity_type);
      query += ` WHERE al.activity_type = $1`;
    }

    query += ` ORDER BY al.id DESC LIMIT ${parseInt(limit || '100', 10)}`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil log aktivitas.' });
  }
};
