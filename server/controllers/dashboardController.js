const db = require('../config/db');

exports.getMasterDashboard = async (req, res) => {
  try {
    const { warehouse_id, date_from, date_to } = req.query;

    // 1. Total Stock & Valuation per warehouse
    const whStockQuery = `
      SELECT 
        w.id as warehouse_id,
        w.warehouse_code,
        w.warehouse_name,
        COALESCE(SUM(inv.current_stock), 0) as total_units,
        COALESCE(SUM(inv.current_stock * i.unit_price), 0) as total_value
      FROM warehouses w
      LEFT JOIN inventory inv ON w.id = inv.warehouse_id
      LEFT JOIN items i ON inv.item_id = i.id
      GROUP BY w.id, w.warehouse_code, w.warehouse_name
      ORDER BY w.id ASC
    `;
    const whStockRes = await db.query(whStockQuery);

    // 2. Pending Purchase Requests
    const prPendingQuery = `
      SELECT pr.id, pr.pr_number, pr.status, pr.notes, pr.rejection_reason, pr.created_at, w.warehouse_name, u.name as requester_name, u.phone as requester_phone,
        (
          SELECT json_agg(json_build_object(
            'id', pri.id,
            'item_id', pri.item_id,
            'item_name', i.item_name,
            'sku', i.sku,
            'quantity', pri.quantity,
            'unit_name', un.unit_name,
            'urgency', pri.urgency
          ))
          FROM purchase_request_items pri
          JOIN items i ON pri.item_id = i.id
          JOIN units un ON i.unit_id = un.id
          WHERE pri.purchase_request_id = pr.id
        ) as items,
        (SELECT COUNT(*) FROM purchase_request_items pri WHERE pri.purchase_request_id = pr.id) as item_count
      FROM purchase_requests pr
      JOIN warehouses w ON pr.warehouse_id = w.id
      JOIN users u ON pr.user_id = u.id
      WHERE pr.status = 'Menunggu'
      ORDER BY pr.id DESC
    `;
    const prPendingRes = await db.query(prPendingQuery);

    // 2b. All Recent Purchase Requests (for PR history on Admin & Master dashboard)
    const prAllQuery = `
      SELECT pr.id, pr.pr_number, pr.status, pr.notes, pr.rejection_reason, pr.created_at, w.warehouse_name, u.name as requester_name, u.phone as requester_phone,
        (
          SELECT json_agg(json_build_object(
            'id', pri.id,
            'item_id', pri.item_id,
            'item_name', i.item_name,
            'sku', i.sku,
            'quantity', pri.quantity,
            'unit_name', un.unit_name,
            'urgency', pri.urgency
          ))
          FROM purchase_request_items pri
          JOIN items i ON pri.item_id = i.id
          JOIN units un ON i.unit_id = un.id
          WHERE pri.purchase_request_id = pr.id
        ) as items,
        (SELECT COUNT(*) FROM purchase_request_items pri WHERE pri.purchase_request_id = pr.id) as item_count
      FROM purchase_requests pr
      JOIN warehouses w ON pr.warehouse_id = w.id
      JOIN users u ON pr.user_id = u.id
      ORDER BY pr.id DESC
      LIMIT 10
    `;
    const prAllRes = await db.query(prAllQuery);

    // 3. Low Stock Items
    let whFilterInv = '';
    if (warehouse_id && warehouse_id !== 'ALL') {
      whFilterInv = ` AND inv.warehouse_id = ${parseInt(warehouse_id, 10)}`;
    }

    const lowStockQuery = `
      SELECT inv.id, i.sku, i.item_name, c.category_name, un.unit_name, inv.current_stock, i.minimum_stock, i.critical_stock, w.warehouse_code, w.warehouse_name,
        CASE WHEN inv.current_stock <= i.critical_stock THEN 'Kritis' ELSE 'Rendah' END as status_stok
      FROM inventory inv
      JOIN items i ON inv.item_id = i.id
      JOIN categories c ON i.category_id = c.id
      JOIN units un ON i.unit_id = un.id
      JOIN warehouses w ON inv.warehouse_id = w.id
      WHERE inv.current_stock <= i.minimum_stock ${whFilterInv}
      ORDER BY inv.current_stock ASC
      LIMIT 10
    `;
    const lowStockRes = await db.query(lowStockQuery);

    // 3b. Emergency Stock Items (Barang Stok Darurat: current_stock <= critical_stock)
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
      WHERE inv.current_stock <= i.critical_stock ${whFilterInv}
      ORDER BY (inv.current_stock / NULLIF(i.critical_stock, 0)) ASC, inv.current_stock ASC
      LIMIT 15
    `;
    const emergencyStockRes = await db.query(emergencyStockQuery);

    // 3c. Expiring Soon Items (Barang Akan Segera EXP / Kadaluarsa)
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
        AND (i.expiry_date - CURRENT_DATE) <= 60 ${whFilterInv}
      ORDER BY i.expiry_date ASC
      LIMIT 15
    `;
    const expiringRes = await db.query(expiringQuery);

    // 4. Recent Purchase Orders
    const poQuery = `
      SELECT po.id, po.po_number, po.po_date, po.status, po.total_amount, s.supplier_name, w.warehouse_code
      FROM purchase_orders po
      JOIN suppliers s ON po.supplier_id = s.id
      JOIN warehouses w ON po.warehouse_id = w.id
      ORDER BY po.id DESC LIMIT 5
    `;
    const poRes = await db.query(poQuery);

    // 5. Recent Activity Logs
    const logsQuery = `
      SELECT al.id, al.activity_type, al.description, al.reference_id, al.created_at, u.name as user_name
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.id DESC LIMIT 10
    `;
    const logsRes = await db.query(logsQuery);

    // 6. Recent Goods Receipts (IN) & Goods Issues (OUT)
    const grRecentQuery = `
      SELECT gr.id, gr.gr_number, gr.receipt_date, w.warehouse_code, s.supplier_name, u.name as created_by_name
      FROM goods_receipts gr
      JOIN warehouses w ON gr.warehouse_id = w.id
      LEFT JOIN suppliers s ON gr.supplier_id = s.id
      JOIN users u ON gr.created_by = u.id
      ORDER BY gr.id DESC LIMIT 5
    `;
    const grRecentRes = await db.query(grRecentQuery);

    const giRecentQuery = `
      SELECT gi.id, gi.gi_number, gi.issue_date, gi.outlet_name, gi.requester_name, w.warehouse_code
      FROM goods_issues gi
      JOIN warehouses w ON gi.warehouse_id = w.id
      ORDER BY gi.id DESC LIMIT 5
    `;
    const giRecentRes = await db.query(giRecentQuery);

    res.json({
      warehouses_summary: whStockRes.rows,
      pending_requests: prPendingRes.rows,
      all_requests: prAllRes.rows,
      low_stock_items: lowStockRes.rows,
      emergency_stock_items: emergencyStockRes.rows,
      expiring_items: expiringRes.rows,
      recent_orders: poRes.rows,
      recent_activities: logsRes.rows,
      recent_receipts: grRecentRes.rows,
      recent_issues: giRecentRes.rows
    });
  } catch (err) {
    console.error('Error getMasterDashboard:', err);
    res.status(500).json({ message: 'Gagal mengambil data Dashboard Master.' });
  }
};

exports.getAdminDashboard = async (req, res) => {
  return exports.getMasterDashboard(req, res);
};

exports.getWarehouseDashboard = async (req, res) => {
  return exports.getMasterDashboard(req, res);
};
