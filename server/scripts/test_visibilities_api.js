async function main() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'master@dangau.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  const res = await fetch('http://localhost:5000/api/auth/visibilities', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log('=== VISIBILITIES API RESPONSE ===');
  data.forEach(d => {
    console.log(`Role ${d.role_id} (${d.role_name}):`);
    console.log(`  - can_barang_masuk: ${d.can_barang_masuk}`);
    console.log(`  - can_barang_keluar: ${d.can_barang_keluar}`);
    console.log(`  - can_permintaan_pembelian: ${d.can_permintaan_pembelian}`);
    console.log(`  - can_pesanan_pembelian: ${d.can_pesanan_pembelian}`);
    console.log(`  - can_stok_opname: ${d.can_stok_opname}`);
  });
}
main().catch(console.error);
