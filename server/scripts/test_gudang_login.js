async function testGudang() {
  console.log('Logging in as Petugas Gudang (gudang@dangau.com)...');
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gudang@dangau.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status, loginData.user ? 'User OK' : 'User Failed');
  if (!loginData.token) {
    console.error('Login failed:', loginData);
    return;
  }
  const token = loginData.token;
  console.log('User Role Name:', loginData.user.role_name);

  // Test dashboard/master
  const dashRes = await fetch('http://localhost:5000/api/dashboard/master', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const dashData = await dashRes.json();
  console.log('Dashboard status:', dashRes.status, 'Keys:', Object.keys(dashData));

  // Test inventory
  const invRes = await fetch('http://localhost:5000/api/inventory', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const invData = await invRes.json();
  console.log('Inventory status:', invRes.status, 'Count:', invData.length);

  // Test purchase-requests?status=Menunggu
  const prRes = await fetch('http://localhost:5000/api/purchase-requests?status=Menunggu', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const prData = await prRes.json();
  console.log('PR Menunggu status:', prRes.status, 'Count:', Array.isArray(prData) ? prData.length : prData);
}

testGudang().catch(console.error);

