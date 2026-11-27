const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/rbac');

const authController = require('../controllers/authController');
const itemController = require('../controllers/itemController');
const warehouseController = require('../controllers/warehouseController');
const supplierController = require('../controllers/supplierController');
const inventoryController = require('../controllers/inventoryController');
const goodsReceiptController = require('../controllers/goodsReceiptController');
const goodsIssueController = require('../controllers/goodsIssueController');
const purchaseRequestController = require('../controllers/purchaseRequestController');
const purchaseOrderController = require('../controllers/purchaseOrderController');
const stockOpnameController = require('../controllers/stockOpnameController');
const dashboardController = require('../controllers/dashboardController');
const activityLogController = require('../controllers/activityLogController');
const notificationController = require('../controllers/notificationController');

// 0. Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// 1. Auth & Visibility Routes
router.post('/auth/login', authController.login);
router.get('/auth/me', verifyToken, authController.getMe);
router.get('/auth/users', verifyToken, authController.getUsers);
router.get('/auth/visibilities', verifyToken, authController.getVisibilities);
router.put('/auth/visibilities', verifyToken, allowRoles('Master'), authController.updateVisibilities);
router.put('/auth/users/:id/status', verifyToken, allowRoles('Master'), authController.toggleUserStatus);

// 2. Master Data Barang (Items)
router.get('/items', verifyToken, itemController.getItems);
router.get('/items/:id', verifyToken, itemController.getItemById);
router.post('/items', verifyToken, allowRoles('Admin', 'Petugas Gudang'), itemController.createItem);
router.post('/items/import-excel', verifyToken, allowRoles('Admin', 'Petugas Gudang'), itemController.importExcelItems);
router.put('/items/:id', verifyToken, allowRoles('Admin', 'Petugas Gudang'), itemController.updateItem);
router.delete('/items/:id', verifyToken, allowRoles('Admin'), itemController.deleteItem);

router.get('/categories', verifyToken, itemController.getCategories);
router.get('/units', verifyToken, itemController.getUnits);

// 3. Warehouses
router.get('/warehouses', verifyToken, warehouseController.getWarehouses);
router.get('/warehouses/:id', verifyToken, warehouseController.getWarehouseById);

// 4. Suppliers
router.get('/suppliers', verifyToken, supplierController.getSuppliers);
router.post('/suppliers', verifyToken, allowRoles('Admin', 'Petugas Gudang'), supplierController.createSupplier);

// 5. Inventory & Movements
router.get('/inventory', verifyToken, inventoryController.getInventory);
router.get('/inventory/low-stock', verifyToken, inventoryController.getLowStock);
router.get('/inventory/movements', verifyToken, inventoryController.getMovements);

// 6. Goods Receipts (Barang Masuk / IN)
router.get('/goods-receipts', verifyToken, goodsReceiptController.getGoodsReceipts);
router.get('/goods-receipts/:id', verifyToken, goodsReceiptController.getGoodsReceiptById);
router.post('/goods-receipts', verifyToken, allowRoles('Admin', 'Petugas Gudang'), goodsReceiptController.createGoodsReceipt);
router.put('/goods-receipts/:id/prices', verifyToken, allowRoles('Admin'), goodsReceiptController.updateReceiptPrices);
router.put('/goods-receipts/:id/items/:itemId/price', verifyToken, allowRoles('Admin'), goodsReceiptController.updateItemPrice);

// 7. Goods Issues (Barang Keluar / Pengambilan OUT)
router.get('/goods-issues', verifyToken, goodsIssueController.getGoodsIssues);
router.get('/goods-issues/:id', verifyToken, goodsIssueController.getGoodsIssueById);
router.post('/goods-issues', verifyToken, allowRoles('Admin', 'Petugas Gudang'), goodsIssueController.createGoodsIssue);

// 8. Purchase Requests (PR)
router.get('/purchase-requests', verifyToken, purchaseRequestController.getPurchaseRequests);
router.post('/purchase-requests', verifyToken, allowRoles('Admin', 'Petugas Gudang'), purchaseRequestController.createPurchaseRequest);
router.put('/purchase-requests/:id/approve', verifyToken, allowRoles('Admin'), purchaseRequestController.approvePurchaseRequest);
router.put('/purchase-requests/:id/reject', verifyToken, allowRoles('Admin'), purchaseRequestController.rejectPurchaseRequest);

// 9. Purchase Orders (PO)
router.get('/purchase-orders', verifyToken, purchaseOrderController.getPurchaseOrders);
router.get('/purchase-orders/:id', verifyToken, purchaseOrderController.getPurchaseOrderById);
router.post('/purchase-orders', verifyToken, allowRoles('Admin'), purchaseOrderController.createPurchaseOrder);
router.put('/purchase-orders/:id', verifyToken, allowRoles('Admin'), purchaseOrderController.updatePurchaseOrder);

// 10. Stock Opname
router.get('/stock-opnames', verifyToken, stockOpnameController.getStockOpnames);
router.get('/stock-opnames/:id', verifyToken, stockOpnameController.getStockOpnameById);
router.post('/stock-opnames', verifyToken, allowRoles('Admin', 'Petugas Gudang'), stockOpnameController.createStockOpname);

// 11. Dashboards
router.get('/dashboard/master', verifyToken, dashboardController.getMasterDashboard);
router.get('/dashboard/admin', verifyToken, dashboardController.getAdminDashboard);
router.get('/dashboard/warehouse', verifyToken, dashboardController.getWarehouseDashboard);

// 12. Activity Logs
router.get('/activity-logs', verifyToken, activityLogController.getActivityLogs);

// 13. Notifications
router.get('/notifications', verifyToken, notificationController.getNotifications);
router.put('/notifications/read-all', verifyToken, notificationController.markAllAsRead);
router.put('/notifications/:id/read', verifyToken, notificationController.markAsRead);
router.delete('/notifications/:id', verifyToken, notificationController.deleteNotification);

module.exports = router;
