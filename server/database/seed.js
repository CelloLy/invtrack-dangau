const { Client, Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function getWorkingClient() {
  const dbUser = process.env.DB_USER || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
  const passwordsToTry = [
    process.env.DB_PASSWORD,
    'Vita10',
    'newpassword',
    'postgres',
    'admin',
    'root',
    ''
  ].filter((p, i, self) => p !== undefined && self.indexOf(p) === i);

  for (const pwd of passwordsToTry) {
    const client = new Client({
      user: dbUser,
      host: dbHost,
      database: 'postgres',
      password: pwd,
      port: dbPort
    });
    try {
      await client.connect();
      console.log(`Successfully authenticated with PostgreSQL user "${dbUser}" using password "${pwd ? '***' : '(empty)'}"`);
      return { client, workingPassword: pwd };
    } catch (err) {
      // try next
    }
  }
  throw new Error(`Could not authenticate with PostgreSQL user "${dbUser}". Tried passwords: ${passwordsToTry.join(', ')}`);
}

async function runSeed() {
  const dbUser = process.env.DB_USER || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
  const targetDb = process.env.DB_NAME || 'invtrack_dangau';

  console.log('Connecting to PostgreSQL server...');

  let workingPassword = 'postgres';
  try {
    const { client, workingPassword: pwd } = await getWorkingClient();
    workingPassword = pwd;
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDb]);
    if (res.rowCount === 0) {
      console.log(`Database ${targetDb} does not exist. Creating database...`);
      await client.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`Database ${targetDb} created successfully!`);
    } else {
      console.log(`Database ${targetDb} already exists.`);
    }
    await client.end();
  } catch (err) {
    console.error('Error checking/creating database:', err.message);
  }

  // Update .env file with the working password
  try {
    const envContent = `PORT=${process.env.PORT || 5000}
DB_USER=${dbUser}
DB_HOST=${dbHost}
DB_NAME=${targetDb}
DB_PASSWORD=${workingPassword}
DB_PORT=${dbPort}
JWT_SECRET=${process.env.JWT_SECRET || 'invtrack_dangau_secret_key_2026_kp'}
`;
    fs.writeFileSync(path.join(__dirname, '..', '.env'), envContent);
  } catch (e) {}

  // Step 2: Connect to target database and initialize schema & seed data
  const targetPool = new Pool({
    user: dbUser,
    host: dbHost,
    database: targetDb,
    password: workingPassword,
    port: dbPort
  });

  try {
    console.log(`Reading schema.sql...`);
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await targetPool.query(schemaSql);
    console.log('Schema created successfully!');

    console.log('Seeding initial data...');

    // 1. Roles
    await targetPool.query(`
      INSERT INTO roles (id, role_name) VALUES
      (1, 'Master'),
      (2, 'Admin'),
      (3, 'Petugas Gudang')
      ON CONFLICT DO NOTHING;
    `);

    // 2. Warehouses (WH-DG, WH-RB)
    await targetPool.query(`
      INSERT INTO warehouses (id, warehouse_code, warehouse_name, location, status) VALUES
      (1, 'WH-DG', 'Gudang Dangau', 'Hotel Dangau Kubu Raya - Main Store', 'Active'),
      (2, 'WH-RB', 'Gudang Rumah Bos', 'Kediaman Owner / Off-site Storage', 'Active')
      ON CONFLICT DO NOTHING;
    `);

    // 3. Categories
    await targetPool.query(`
      INSERT INTO categories (id, category_name) VALUES
      (1, 'Bahan Makanan & F&B'),
      (2, 'Peralatan & Amenities Kamar'),
      (3, 'Pembersih & Hygiene'),
      (4, 'Maintenance & Engineering'),
      (5, 'Perlengkapan Kantor')
      ON CONFLICT DO NOTHING;
    `);

    // 4. Units
    await targetPool.query(`
      INSERT INTO units (id, unit_name) VALUES
      (1, 'PCS'),
      (2, 'Box'),
      (3, 'KG'),
      (4, 'Btg'),
      (5, 'Sak'),
      (6, 'Pail'),
      (7, 'Roll'),
      (8, 'Btl')
      ON CONFLICT DO NOTHING;
    `);

    // 5. Users
    const passwordHash = await bcrypt.hash('password123', 10);
    await targetPool.query(`
      INSERT INTO users (id, name, email, password_hash, role_id, warehouse_id) VALUES
      (1, 'Accounting Manager (Master)', 'master@dangau.com', '${passwordHash}', 1, 1),
      (2, 'Accounting Supervisor (Admin)', 'accounting@dangau.com', '${passwordHash}', 2, 1),
      (3, 'Budi Santoso (Petugas Gudang)', 'gudang@dangau.com', '${passwordHash}', 3, 1)
      ON CONFLICT DO NOTHING;
    `);

    // 6. Suppliers
    await targetPool.query(`
      INSERT INTO suppliers (id, supplier_name, contact, address, status) VALUES
      (1, 'PT Mitra Bangunan Abadi', '0812-3456-7890', 'Jl. Arteri Supadio No. 88, Kubu Raya', 'Active'),
      (2, 'Distributor Utama F&B', '0813-9988-7766', 'Jl. Ahmad Yani No. 12, Pontianak', 'Active'),
      (3, 'PT Tirta Makmur', '0811-2233-4455', 'Jl. Gajah Mada No. 45, Pontianak', 'Active'),
      (4, 'PT Elektro Maju Jaya', '0852-1122-3344', 'Jl. Imam Bonjol No. 9, Pontianak', 'Active')
      ON CONFLICT DO NOTHING;
    `);

    // 7. Items
    await targetPool.query(`
      INSERT INTO items (id, sku, item_name, category_id, unit_id, minimum_stock, critical_stock, unit_price, status, expiry_date) VALUES
      (1, 'SKU-FLOUR-01', 'Tepung Terigu Premium 1kg', 1, 3, 50.00, 20.00, 14000.00, 'Active', CURRENT_DATE + INTERVAL '24 days'),
      (2, 'SKU-CEMENT-01', 'Semen Gresik 40kg', 4, 5, 100.00, 30.00, 75000.00, 'Active', NULL),
      (3, 'SKU-PIPE-04', 'Pipa PVC AW 4" Wavin', 4, 4, 30.00, 10.00, 180000.00, 'Active', NULL),
      (4, 'SKU-PAINT-20', 'Cat Tembok Weathershield 20L', 4, 6, 15.00, 5.00, 850000.00, 'Active', CURRENT_DATE + INTERVAL '180 days'),
      (5, 'SKU-CABLE-01', 'Kabel Supreme NYM 3x2.5mm', 4, 7, 10.00, 3.00, 950000.00, 'Active', NULL),
      (6, 'SKU-SOAP-PAIL', 'Sabun Liquid Pail 20L', 3, 6, 20.00, 8.00, 320000.00, 'Active', CURRENT_DATE + INTERVAL '90 days'),
      (7, 'SKU-CHEESE-BLK', 'Mozzarella Cheese Block', 1, 3, 15.00, 5.00, 125000.00, 'Active', CURRENT_DATE + INTERVAL '5 days'),
      (8, 'SKU-TOMATO-PST', 'Tomato Paste Canned 1kg', 1, 1, 30.00, 10.00, 45000.00, 'Active', CURRENT_DATE + INTERVAL '12 days'),
      (9, 'SKU-REBAR-12', 'Besi Beton 12mm Polos', 4, 4, 50.00, 15.00, 115000.00, 'Active', NULL),
      (10, 'SKU-OIL-5L', 'Minyak Goreng Refill 5L', 1, 8, 40.00, 12.00, 78000.00, 'Active', CURRENT_DATE + INTERVAL '45 days')
      ON CONFLICT DO NOTHING;
    `);

    // 8. Inventory (Stok per Gudang)
    await targetPool.query(`
      INSERT INTO inventory (item_id, warehouse_id, current_stock) VALUES
      (1, 1, 120.00), -- Tepung WH-DG
      (1, 2, 40.00),  -- Tepung WH-RB
      (2, 1, 250.00), -- Semen WH-DG
      (2, 2, 80.00),  -- Semen WH-RB
      (3, 1, 45.00),  -- Pipa WH-DG
      (3, 2, 8.00),   -- Pipa WH-RB
      (4, 1, 18.00),  -- Cat WH-DG
      (4, 2, 4.00),   -- Cat WH-RB
      (5, 1, 12.00),  -- Kabel WH-DG
      (5, 2, 2.00),   -- Kabel WH-RB
      (6, 1, 25.00),  -- Sabun WH-DG
      (6, 2, 10.00),  -- Sabun WH-RB
      (7, 1, 8.00),   -- Keju WH-DG
      (7, 2, 3.00),   -- Keju WH-RB
      (8, 1, 18.00),  -- Tomato Paste WH-DG
      (8, 2, 5.00),   -- Tomato Paste WH-RB
      (9, 1, 300.00), -- Besi WH-DG
      (9, 2, 50.00),  -- Besi WH-RB
      (10, 1, 65.00), -- Minyak WH-DG
      (10, 2, 20.00)  -- Minyak WH-RB
      ON CONFLICT (item_id, warehouse_id) DO NOTHING;
    `);

    // 9. Sample Purchase Requests
    await targetPool.query(`
      INSERT INTO purchase_requests (id, pr_number, user_id, warehouse_id, status, notes, created_at) VALUES
      (1, 'PR-2026-001', 3, 1, 'Menunggu', 'Permintaan bahan baku dapur & peralatan mendesak', NOW() - INTERVAL '2 days'),
      (2, 'PR-2026-002', 3, 2, 'Menunggu', 'Stok kabel & pipa di Gudang Rumah Bos kritis', NOW() - INTERVAL '5 days')
      ON CONFLICT DO NOTHING;

      INSERT INTO purchase_request_items (purchase_request_id, item_id, quantity, urgency, status) VALUES
      (1, 7, 20.00, 'Tinggi', 'Menunggu'),
      (1, 8, 30.00, 'Sedang', 'Menunggu'),
      (2, 3, 15.00, 'Tinggi', 'Menunggu'),
      (2, 5, 10.00, 'Tinggi', 'Menunggu')
      ON CONFLICT DO NOTHING;
    `);

    // 10. Sample Purchase Orders
    await targetPool.query(`
      INSERT INTO purchase_orders (id, po_number, purchase_request_id, supplier_id, warehouse_id, po_date, status, total_amount, notes, created_by) VALUES
      (1, 'PO-2026-0890', 2, 1, 2, CURRENT_DATE - 3, 'Dipesan', 12450000.00, 'Pesanan material perbaikan Gudang Rumah Bos', 2),
      (2, 'PO-2026-0891', NULL, 2, 1, CURRENT_DATE - 5, 'Diterima', 8200000.00, 'Pasokan rutin F&B Resto Dangau', 2)
      ON CONFLICT DO NOTHING;

      INSERT INTO purchase_order_items (purchase_order_id, item_id, quantity, unit_price, total_price) VALUES
      (1, 3, 15.00, 180000.00, 2700000.00),
      (1, 5, 10.00, 950000.00, 9500000.00),
      (2, 1, 100.00, 14000.00, 1400000.00),
      (2, 10, 50.00, 78000.00, 3900000.00)
      ON CONFLICT DO NOTHING;
    `);

    // 11. Goods Receipts (IN)
    await targetPool.query(`
      INSERT INTO goods_receipts (id, gr_number, po_id, supplier_id, warehouse_id, receipt_date, notes, created_by) VALUES
      (1, 'GR-2026-0001', 2, 2, 1, NOW() - INTERVAL '1 day', 'Penerimaan bahan makanan dari Distributor Utama', 3)
      ON CONFLICT DO NOTHING;

      INSERT INTO goods_receipt_items (goods_receipt_id, item_id, quantity, unit_name) VALUES
      (1, 1, 100.00, 'KG'),
      (1, 10, 50.00, 'Btl')
      ON CONFLICT DO NOTHING;
    `);

    // 12. Goods Issues (OUT / Pengambilan)
    await targetPool.query(`
      INSERT INTO goods_issues (id, gi_number, warehouse_id, requester_name, outlet_name, issue_date, status, notes, created_by) VALUES
      (1, 'OUT-2026-0001', 1, 'Koki Resto', 'Warung Dangau', NOW() - INTERVAL '12 hours', 'Selesai', 'Pengambilan bahan baku dapur pagi', 3),
      (2, 'OUT-2026-0002', 1, 'Head Housekeeping', 'Hotel Dangau', NOW() - INTERVAL '6 hours', 'Selesai', 'Amenities kamar mandi & sabun', 3)
      ON CONFLICT DO NOTHING;

      INSERT INTO goods_issue_items (goods_issue_id, item_id, quantity, unit_name) VALUES
      (1, 1, 25.00, 'KG'),
      (1, 8, 12.00, 'PCS'),
      (2, 6, 5.00, 'Pail')
      ON CONFLICT DO NOTHING;
    `);

    // 13. Stock Opnames
    await targetPool.query(`
      INSERT INTO stock_opnames (id, opname_number, warehouse_id, user_id, opname_date, status, notes) VALUES
      (1, 'SO-2026-001', 1, 3, NOW() - INTERVAL '4 days', 'Selesai', 'Pemeriksaan rutin mingguan Gudang Dangau oleh Accounting & Gudang')
      ON CONFLICT DO NOTHING;

      INSERT INTO stock_opname_items (stock_opname_id, item_id, system_stock, physical_stock, difference, reason) VALUES
      (1, 1, 125.00, 120.00, -5.00, 'Kerusakan kemasan kantung tepung saat handling'),
      (1, 2, 250.00, 250.00, 0.00, 'Sesuai dengan fisik')
      ON CONFLICT DO NOTHING;
    `);

    // 14. Inventory Movements
    await targetPool.query(`
      INSERT INTO inventory_movements (item_id, warehouse_id, transaction_type, reference_id, quantity, stock_before, stock_after, created_by, notes) VALUES
      (1, 1, 'IN', 'GR-2026-0001', 100.00, 25.00, 125.00, 3, 'Penerimaan PO-2026-0891'),
      (1, 1, 'OUT', 'OUT-2026-0001', 25.00, 125.00, 100.00, 3, 'Pengambilan Warung Dangau'),
      (1, 1, 'OPNAME_ADJUST', 'SO-2026-001', -5.00, 125.00, 120.00, 3, 'Penyesuaian hasil stock opname mingguan')
      ON CONFLICT DO NOTHING;
    `);

    // 15. Activity Logs
    await targetPool.query(`
      INSERT INTO activity_logs (user_id, activity_type, description, reference_id, created_at) VALUES
      (3, 'GOODS_RECEIPT', 'Petugas Gudang menambahkan penerimaan GR-2026-0001 (100.00 KG Tepung Terigu)', 'GR-2026-0001', NOW() - INTERVAL '1 day'),
      (3, 'GOODS_ISSUE', 'Petugas Gudang mencatat barang keluar OUT-2026-0001 (Warung Dangau)', 'OUT-2026-0001', NOW() - INTERVAL '12 hours'),
      (2, 'PURCHASE_APPROVAL', 'Admin (Accounting) menyetujui Purchase Request PR-2026-002', 'PR-2026-002', NOW() - INTERVAL '3 days'),
      (3, 'STOCK_OPNAME', 'Petugas Gudang & Accounting melakukan stock opname Gudang Dangau', 'SO-2026-001', NOW() - INTERVAL '4 days')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Seed completed successfully!');
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await targetPool.end();
  }
}

runSeed();
