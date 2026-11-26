-- InvTrack Pro Database Schema for Dangau Kubu Raya
-- PostgreSQL 16 Compatible

DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS stock_opname_items CASCADE;
DROP TABLE IF EXISTS stock_opnames CASCADE;
DROP TABLE IF EXISTS goods_issue_items CASCADE;
DROP TABLE IF EXISTS goods_issues CASCADE;
DROP TABLE IF EXISTS goods_receipt_items CASCADE;
DROP TABLE IF EXISTS goods_receipts CASCADE;
DROP TABLE IF EXISTS purchase_order_items CASCADE;
DROP TABLE IF EXISTS purchase_orders CASCADE;
DROP TABLE IF EXISTS purchase_request_items CASCADE;
DROP TABLE IF EXISTS purchase_requests CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- 2. Warehouses
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    warehouse_code VARCHAR(20) NOT NULL UNIQUE,
    warehouse_name VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Active'
);

-- 3. Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE
);

-- 4. Units
CREATE TABLE units (
    id SERIAL PRIMARY KEY,
    unit_name VARCHAR(20) NOT NULL UNIQUE
);

-- 5. Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    warehouse_id INT REFERENCES warehouses(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Suppliers
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(150) NOT NULL,
    contact VARCHAR(50),
    address TEXT,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Items (Master Barang)
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    item_name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL REFERENCES categories(id),
    unit_id INT NOT NULL REFERENCES units(id),
    minimum_stock NUMERIC(10, 2) DEFAULT 10,
    critical_stock NUMERIC(10, 2) DEFAULT 5,
    unit_price NUMERIC(15, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Active',
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Inventory (Stok per Gudang)
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    item_id INT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    warehouse_id INT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_item_warehouse UNIQUE(item_id, warehouse_id)
);

-- 9. Purchase Requests (Permintaan Pembelian)
CREATE TABLE purchase_requests (
    id SERIAL PRIMARY KEY,
    pr_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL REFERENCES users(id),
    warehouse_id INT NOT NULL REFERENCES warehouses(id),
    status VARCHAR(30) DEFAULT 'Menunggu', -- Menunggu, Disetujui, Ditolak, Dipenuhi
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Purchase Request Items
CREATE TABLE purchase_request_items (
    id SERIAL PRIMARY KEY,
    purchase_request_id INT NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES items(id),
    quantity NUMERIC(10, 2) NOT NULL,
    urgency VARCHAR(20) DEFAULT 'Normal', -- Normal, Sedang, Tinggi
    status VARCHAR(30) DEFAULT 'Menunggu'
);

-- 11. Purchase Orders (Pesanan Pembelian)
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    purchase_request_id INT REFERENCES purchase_requests(id) ON DELETE SET NULL,
    supplier_id INT NOT NULL REFERENCES suppliers(id),
    warehouse_id INT NOT NULL REFERENCES warehouses(id),
    po_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(30) DEFAULT 'Dipesan', -- Draft, Dipesan, Sebagian Diterima, Diterima, Dibatalkan
    total_amount NUMERIC(15, 2) DEFAULT 0,
    notes TEXT,
    created_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Purchase Order Items
CREATE TABLE purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES items(id),
    quantity NUMERIC(10, 2) NOT NULL,
    unit_price NUMERIC(15, 2) DEFAULT 0,
    total_price NUMERIC(15, 2) DEFAULT 0
);

-- 13. Goods Receipts (Barang Masuk / IN)
CREATE TABLE goods_receipts (
    id SERIAL PRIMARY KEY,
    gr_number VARCHAR(50) NOT NULL UNIQUE,
    po_id INT REFERENCES purchase_orders(id) ON DELETE SET NULL,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    warehouse_id INT NOT NULL REFERENCES warehouses(id),
    receipt_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    created_by INT NOT NULL REFERENCES users(id),
    attachment_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. Goods Receipt Items
CREATE TABLE goods_receipt_items (
    id SERIAL PRIMARY KEY,
    goods_receipt_id INT NOT NULL REFERENCES goods_receipts(id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES items(id),
    quantity NUMERIC(10, 2) NOT NULL,
    unit_name VARCHAR(20)
);

-- 15. Goods Issues (Barang Keluar / Pengambilan OUT)
CREATE TABLE goods_issues (
    id SERIAL PRIMARY KEY,
    gi_number VARCHAR(50) NOT NULL UNIQUE,
    warehouse_id INT NOT NULL REFERENCES warehouses(id),
    requester_name VARCHAR(100) NOT NULL,
    outlet_name VARCHAR(100) NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'Selesai', -- Disetujui, Selesai
    notes TEXT,
    created_by INT NOT NULL REFERENCES users(id),
    attachment_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Goods Issue Items
CREATE TABLE goods_issue_items (
    id SERIAL PRIMARY KEY,
    goods_issue_id INT NOT NULL REFERENCES goods_issues(id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES items(id),
    quantity NUMERIC(10, 2) NOT NULL,
    unit_name VARCHAR(20)
);

-- 17. Stock Opnames
CREATE TABLE stock_opnames (
    id SERIAL PRIMARY KEY,
    opname_number VARCHAR(50) NOT NULL UNIQUE,
    warehouse_id INT NOT NULL REFERENCES warehouses(id),
    user_id INT NOT NULL REFERENCES users(id),
    opname_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) DEFAULT 'Selesai',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. Stock Opname Items
CREATE TABLE stock_opname_items (
    id SERIAL PRIMARY KEY,
    stock_opname_id INT NOT NULL REFERENCES stock_opnames(id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES items(id),
    system_stock NUMERIC(10, 2) NOT NULL,
    physical_stock NUMERIC(10, 2) NOT NULL,
    difference NUMERIC(10, 2) NOT NULL,
    reason TEXT
);

-- 19. Inventory Movements (Kartu Stok / Mutasi)
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    item_id INT NOT NULL REFERENCES items(id),
    warehouse_id INT NOT NULL REFERENCES warehouses(id),
    transaction_type VARCHAR(20) NOT NULL, -- IN, OUT, OPNAME_ADJUST
    reference_id VARCHAR(50) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    stock_before NUMERIC(10, 2) NOT NULL,
    stock_after NUMERIC(10, 2) NOT NULL,
    created_by INT REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. Activity Logs
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    reference_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    target_role VARCHAR(50), -- 'ALL', 'Master', 'Admin', 'Petugas Gudang'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO', -- 'INFO', 'SUCCESS', 'WARNING', 'DANGER', 'PR', 'PO', 'RECEIPT', 'ISSUE', 'OPNAME'
    link VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
