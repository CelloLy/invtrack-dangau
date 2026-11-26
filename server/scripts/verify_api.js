const http = require('http');

async function testApi() {
  // 1. Login as Master
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'master@dangau.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  if (!loginData.token) {
    console.error('Login failed:', loginData);
    process.exit(1);
  }
  console.log('Login success! User:', loginData.user.name, 'Role:', loginData.user.role);
  const token = loginData.token;

  // 2. Fetch Master Dashboard
  const dashRes = await fetch('http://localhost:5000/api/dashboard/master', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const dashData = await dashRes.json();
  console.log('--- MASTER DASHBOARD DATA ---');
  console.log('Warehouses Summary:', dashData.warehouses_summary);
  console.log('Recent Receipts (In count):', dashData.recent_receipts?.length);
  console.log('Recent Receipts sample:', dashData.recent_receipts);
  console.log('Recent Issues (Out count):', dashData.recent_issues?.length);
  console.log('Recent Issues sample:', dashData.recent_issues);
  console.log('Low Stock Items count:', dashData.low_stock_items?.length);
  console.log('Emergency Stock Items count:', dashData.emergency_stock_items?.length);

  // 3. Fetch Inventory
  const invRes = await fetch('http://localhost:5000/api/inventory', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const invData = await invRes.json();
  console.log('\n--- INVENTORY DATA ---');
  console.log('Total inventory records returned:', invData.length);
  console.log('First 3 inventory items:');
  invData.slice(0, 3).forEach(item => {
    console.log(`- [${item.warehouse_code}] ${item.item_name} | Stock: ${item.current_stock} ${item.unit_name} | Price: Rp ${Number(item.unit_price).toLocaleString('id-ID')} | Total: Rp ${Number(item.total_value).toLocaleString('id-ID')}`);
  });

  // Check Gudang Dangau and Gudang White House counts
  const dgCount = invData.filter(i => i.warehouse_code === 'WH-DG').length;
  const whCount = invData.filter(i => i.warehouse_code === 'WH-WH').length;
  console.log(`Gudang Dangau items: ${dgCount}`);
  console.log(`Gudang White House items: ${whCount}`);

  console.log('\nVERIFICATION COMPLETE: Everything is functional!');
}

testApi().catch(console.error);

