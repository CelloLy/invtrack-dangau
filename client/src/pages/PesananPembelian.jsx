import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { customSwal as Swal } from '../utils/swal';
import { Printer, Save, Plus, Trash2, Search, Calendar, RefreshCw, ArrowLeft } from 'lucide-react';

const PesananPembelian = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMaster, isGudang, selectedWarehouse } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  // List Mode State
  const [viewMode, setViewMode] = useState('list');
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Form State
  const [editingPoId, setEditingPoId] = useState(null);
  const [linkedPrId, setLinkedPrId] = useState(null);
  const [linkedPrNumber, setLinkedPrNumber] = useState(null);
  const [poNumber, setPoNumber] = useState('PO-2026-001');
  const [poDate, setPoDate] = useState(new Date().toISOString().slice(0, 10));
  const [arriveDate, setArriveDate] = useState('');
  
  const [selectedVendor, setSelectedVendor] = useState('');
  const [selectedShipTo, setSelectedShipTo] = useState('');
  const [noteText, setNoteText] = useState('Diharapkan pengantaran dilakukan segera dan tolong pastikan TTD penerimanya ada di bon/surat jalan');
  
  const [ppnPercent, setPpnPercent] = useState(0);

  // Line items
  const [lineItems, setLineItems] = useState([
    { id: 1, item_id: '', name: '', qty: 0, unit: '', price: 0 },
    { id: 2, item_id: '', name: '', qty: 0, unit: '', price: 0 },
    { id: 3, item_id: '', name: '', qty: 0, unit: '', price: 0 },
  ]);

  const fetchData = async () => {
    try {
      const [supRes, itemsRes, whRes, poRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/items'),
        api.get('/warehouses'),
        api.get('/purchase-orders')
      ]);
      setSuppliers(supRes.data);
      setItemsList(itemsRes.data);
      setWarehouses(whRes.data);
      setPurchaseOrders(poRes.data);

      if (supRes.data.length > 0 && !selectedVendor) {
        setSelectedVendor(supRes.data[0].supplier_name);
      }
      if (whRes.data.length > 0 && !selectedShipTo) {
        setSelectedShipTo(whRes.data[0].warehouse_name);
      }
    } catch (err) {
      console.error('Error loading PO data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWarehouse]);

  // Otomatis memuat data dari PR saat Accounting melakukan ACC
  useEffect(() => {
    if (location.state?.fromPR) {
      const { pr_id, pr_number, warehouse_name, notes, items, po_number, po_id } = location.state;
      if (po_number) setPoNumber(po_number);
      if (po_id) setEditingPoId(po_id);
      if (pr_id) setLinkedPrId(pr_id);
      if (pr_number) setLinkedPrNumber(pr_number);
      if (warehouse_name) setSelectedShipTo(warehouse_name);
      if (notes) setNoteText(`Berdasarkan PR: ${pr_number}. Catatan: ${notes}`);
      else setNoteText(`Berdasarkan PR: ${pr_number}`);

      if (items && Array.isArray(items) && items.length > 0) {
        setLineItems(items.map((it, idx) => {
          const matchedMaster = itemsList.find(m => m.id === it.item_id || m.item_name?.toLowerCase() === (it.item_name || '').toLowerCase());
          return {
            id: Date.now() + idx + Math.random(),
            item_id: it.item_id || matchedMaster?.id || '',
            name: it.item_name || matchedMaster?.item_name || '',
            qty: parseFloat(it.quantity) || 1,
            unit: it.unit_name || matchedMaster?.unit_name || 'PCS',
            price: parseFloat(it.unit_price || matchedMaster?.unit_price || 0)
          };
        }));
      }
      setViewMode('form');
    }
  }, [location.state, itemsList]);

  const handleAddLineItem = () => {
    const newItem = { id: Date.now() + Math.random(), item_id: '', name: '', qty: 1, unit: 'PCS', price: 0 };
    setLineItems(prev => [...prev, newItem]);
  };

  const handleRemoveLineItem = (id) => {
    if (lineItems.length <= 1) {
      setLineItems([{ id: Date.now(), item_id: '', name: '', qty: 0, unit: 'PCS', price: 0 }]);
      return;
    }
    setLineItems(prev => prev.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setLineItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'name') {
          const matched = itemsList.find(i => 
            i.item_name.toLowerCase() === value.trim().toLowerCase() ||
            (i.sku && i.sku.toLowerCase() === value.trim().toLowerCase())
          );
          if (matched) {
            updated.item_id = matched.id;
            updated.name = matched.item_name;
            updated.unit = matched.unit_name || updated.unit || 'PCS';
            if (matched.unit_price && parseFloat(matched.unit_price) > 0) {
              updated.price = parseFloat(matched.unit_price);
            }
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleOpenPoDetail = (po) => {
    setEditingPoId(po.id);
    setPoNumber(po.po_number);
    setPoDate(po.po_date ? po.po_date.substring(0, 10) : new Date().toISOString().substring(0, 10));
    setSelectedVendor(po.supplier_name || (suppliers[0]?.supplier_name || 'Vendor'));
    setSelectedShipTo(po.warehouse_name || (warehouses[0]?.warehouse_name || 'Gudang'));
    setNoteText(po.notes || '');
    if (po.purchase_request_id) {
      setLinkedPrId(po.purchase_request_id);
      setLinkedPrNumber(po.pr_number || `PR-${po.purchase_request_id}`);
    } else {
      setLinkedPrId(null);
      setLinkedPrNumber(null);
    }
    if (po.items && po.items.length > 0) {
      setLineItems(po.items.map(i => ({
        id: i.id || Date.now() + Math.random(),
        item_id: i.item_id,
        name: i.item_name,
        qty: parseFloat(i.quantity) || 1,
        unit: i.unit_name || 'PCS',
        price: parseFloat(i.unit_price) || 0
      })));
    }
    setViewMode('form');
  };

  const handleCreateNewPo = () => {
    setEditingPoId(null);
    setLinkedPrId(null);
    setLinkedPrNumber(null);
    const nextPoNum = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(purchaseOrders.length + 1).padStart(3, '0')}`;
    setPoNumber(nextPoNum);
    setPoDate(new Date().toISOString().slice(0, 10));
    setArriveDate('');
    setSelectedVendor(suppliers[0]?.supplier_name || 'Shopee');
    setSelectedShipTo(warehouses[0]?.warehouse_name || 'Gudang Dangau');
    setNoteText('Diharapkan pengantaran dilakukan segera dan tolong pastikan TTD penerimanya ada di bon/surat jalan');
    setPpnPercent(0);
    setLineItems([
      { id: 1, item_id: '', name: '', qty: 0, unit: '', price: 0 },
      { id: 2, item_id: '', name: '', qty: 0, unit: '', price: 0 },
      { id: 3, item_id: '', name: '', qty: 0, unit: '', price: 0 }
    ]);
    setViewMode('form');
  };

  const handleAddNewVendor = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Tambah Vendor / Supplier Baru',
      html: `
        <div style="text-align: left; font-size: 13.5px;">
          <div style="margin-bottom: 12px;">
            <label style="font-weight: 700; display: block; margin-bottom: 4px; color: #1e293b;">Nama Vendor / Perusahaan *</label>
            <input id="swal-vendor-name" class="swal2-input" placeholder="contoh: PT Mitra Bangunan Abadi" style="width: 100%; margin: 0; font-size: 14px; box-sizing: border-box;" value="${selectedVendor && !suppliers.some(s => s.supplier_name.toLowerCase() === selectedVendor.trim().toLowerCase()) ? selectedVendor : ''}" />
          </div>
          <div style="margin-bottom: 12px;">
            <label style="font-weight: 700; display: block; margin-bottom: 4px; color: #1e293b;">Kontak / No. Telepon</label>
            <input id="swal-vendor-contact" class="swal2-input" placeholder="contoh: 0812-3456-7890" style="width: 100%; margin: 0; font-size: 14px; box-sizing: border-box;" />
          </div>
          <div>
            <label style="font-weight: 700; display: block; margin-bottom: 4px; color: #1e293b;">Alamat Vendor</label>
            <input id="swal-vendor-address" class="swal2-input" placeholder="contoh: Jl. Arteri Supadio, Kubu Raya" style="width: 100%; margin: 0; font-size: 14px; box-sizing: border-box;" />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan Vendor',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#1e3a8a',
      preConfirm: () => {
        const name = document.getElementById('swal-vendor-name').value.trim();
        const contact = document.getElementById('swal-vendor-contact').value.trim();
        const address = document.getElementById('swal-vendor-address').value.trim();
        if (!name) {
          Swal.showValidationMessage('Nama vendor / perusahaan wajib diisi!');
          return false;
        }
        return { name, contact, address };
      }
    });

    if (formValues) {
      try {
        const res = await api.post('/suppliers', {
          supplier_name: formValues.name,
          contact: formValues.contact || '-',
          address: formValues.address || '-'
        });
        const newSup = res.data?.supplier || res.data;
        setSuppliers(prev => [...prev, newSup]);
        setSelectedVendor(newSup.supplier_name);
        Swal.fire({
          icon: 'success',
          title: 'Vendor Ditambahkan!',
          text: `Vendor '${newSup.supplier_name}' berhasil disimpan dan dipilih.`,
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        console.error('Error adding vendor:', err);
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menambah Vendor',
          text: err.response?.data?.message || 'Terjadi kesalahan sistem saat menyimpan vendor.'
        });
      }
    }
  };

  const subtotal = lineItems.reduce((acc, item) => acc + (parseFloat(item.qty || 0) * parseFloat(item.price || 0)), 0);
  const vatAmount = subtotal * (parseFloat(ppnPercent || 0) / 100);
  const grandTotal = subtotal + vatAmount;

  const handleSavePO = async () => {
    try {
      const validItems = lineItems.filter(i => i.name && i.name.trim() !== '' && parseFloat(i.qty) > 0);
      if (validItems.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Data Kosong', text: 'Masukkan setidaknya 1 item pesanan dengan nama dan jumlah valid.'});
        return;
      }
      
      // Dynamic supplier matching & auto-creation if new
      let targetSupplier = suppliers.find(s => s.supplier_name.toLowerCase() === selectedVendor.trim().toLowerCase());
      let supplierId;
      if (targetSupplier) {
        supplierId = targetSupplier.id;
      } else if (selectedVendor.trim()) {
        try {
          const supRes = await api.post('/suppliers', {
            supplier_name: selectedVendor.trim(),
            contact: '-',
            address: '-'
          });
          const createdSupplier = supRes.data?.supplier || supRes.data;
          supplierId = createdSupplier.id;
          setSuppliers(prev => [...prev, createdSupplier]);
        } catch (supErr) {
          console.warn('Auto create supplier fallback:', supErr);
          supplierId = suppliers[0]?.id || 1;
        }
      } else {
        supplierId = suppliers[0]?.id || 1;
      }

      // Dynamic warehouse matching
      let targetWh = warehouses.find(w => 
        w.warehouse_name.toLowerCase() === selectedShipTo.trim().toLowerCase() || 
        w.warehouse_code.toLowerCase() === selectedShipTo.trim().toLowerCase()
      );
      let warehouseId = targetWh ? targetWh.id : (selectedWarehouse !== 'ALL' ? parseInt(selectedWarehouse, 10) : (warehouses[0]?.id || 1));

      // Resolve each item to a valid item_id
      const itemsPayload = [];
      for (const item of validItems) {
        let matchedItem = itemsList.find(i => 
          i.item_name.toLowerCase() === item.name.trim().toLowerCase() || 
          (item.item_id && i.id === item.item_id)
        );

        if (!matchedItem) {
          // Auto register item if new
          const generatedSku = 'SKU-' + item.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) + '-' + Math.floor(100 + Math.random() * 900);
          const createRes = await api.post('/items', {
            sku: generatedSku,
            item_name: item.name.trim(),
            category_id: 1,
            unit_id: 1,
            minimum_stock: 10,
            critical_stock: 5,
            unit_price: parseFloat(item.price || 0)
          });
          matchedItem = createRes.data?.item || createRes.data;
        }

        itemsPayload.push({
          item_id: matchedItem.id,
          quantity: parseFloat(item.qty),
          unit_price: parseFloat(item.price || 0)
        });
      }

      const payload = {
        supplier_id: supplierId,
        warehouse_id: warehouseId,
        purchase_request_id: linkedPrId,
        notes: noteText,
        items: itemsPayload
      };

      if (editingPoId) {
        await api.put(`/purchase-orders/${editingPoId}`, payload);
        Swal.fire({ 
          icon: 'success', 
          title: 'Pesanan Pembelian Diterbitkan!', 
          text: `Pesanan Pembelian ${poNumber} berhasil diperbarui dan diterbitkan.`
        });
      } else {
        await api.post('/purchase-orders', payload);
        Swal.fire({ icon: 'success', title: 'Tersimpan', text: 'Pesanan Pembelian berhasil dibuat.'});
      }

      setEditingPoId(null);
      setLinkedPrId(null);
      setLinkedPrNumber(null);
      navigate('/pesanan-pembelian', { replace: true, state: {} });
      await fetchData();
      setViewMode('list');
    } catch (err) {
      console.error('Save PO error:', err);
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.response?.data?.message || 'Gagal menyimpan PO'});
    }
  };

  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          po.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? po.po_date?.startsWith(dateFilter) : true;
    return matchesSearch && matchesDate;
  });

  // Styles
  const primaryBlue = '#7686b2';
  const darkBlue = '#2f3b6c';
  const tealHeader = '#367298';

  return (
    <div>
      {viewMode === 'list' ? (
        <>
          <div className="page-header-block">
            <div>
              <h1 className="page-title">Pesanan Pembelian (PO)</h1>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={fetchData} className="btn-outline-white" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={16} />
                <span>Refresh</span>
              </button>
              {!isGudang && (
                <button onClick={handleCreateNewPo} className="btn-dark" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={16} />
                  <span>Buat PO Baru</span>
                </button>
              )}
            </div>
          </div>

          <div className="card">
            <div className="table-toolbar">
              <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Cari No. PO atau Vendor..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-group">
                <div className="date-filter">
                  <Calendar size={18} className="date-icon" />
                  <input
                    type="date"
                    className="date-input"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No. PO</th>
                    <th>Tanggal</th>
                    <th>Vendor</th>
                    <th>Status</th>
                    <th>Total Item</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPOs.length > 0 ? (
                    filteredPOs.map(po => (
                      <tr key={po.id}>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{po.po_number}</td>
                        <td>{new Date(po.po_date).toLocaleDateString('id-ID')}</td>
                        <td>{po.supplier_name}</td>
                        <td>
                          <span className={`status-badge status-${po.status?.toLowerCase() || 'pending'}`}>
                            {po.status || 'Pending'}
                          </span>
                        </td>
                        <td>{po.items?.length || 0} items</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => handleOpenPoDetail(po)}
                            className="btn-outline-white"
                            style={{ padding: '4px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '5px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Buka / Cetak PO"
                          >
                            <Printer size={13} />
                            <span>Lihat / Cetak</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Tidak ada data Pesanan Pembelian</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="page-header-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="button"
                onClick={() => {
                  setEditingPoId(null);
                  setLinkedPrId(null);
                  setLinkedPrNumber(null);
                  navigate('/pesanan-pembelian', { replace: true, state: {} });
                  setViewMode('list');
                }}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                title="Kembali ke Daftar PO"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="page-title">
                {editingPoId ? `Edit / Terbitkan Pesanan Pembelian (${poNumber})` : 'Buat Pesanan Barang'}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => window.print()} className="btn-outline-white" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={16} />
                <span>Cetak PO</span>
              </button>
              <button onClick={handleAddLineItem} className="btn-outline-white" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} />
                <span>Tambah Baris</span>
              </button>
              <button onClick={handleSavePO} className="btn-dark" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={16} />
                <span>Simpan PO</span>
              </button>
            </div>
          </div>

          {/* Banner Informasi jika Form dibuka otomatis dari ACC Permintaan Pembelian (PR) */}
          {linkedPrNumber && (
            <div style={{
              maxWidth: '900px',
              margin: '0 auto 16px auto',
              padding: '14px 20px',
              backgroundColor: '#fffdf5',
              border: '2px solid #b8860b',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              boxShadow: '0 3px 10px rgba(184, 134, 11, 0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: '#fef3c7',
                  border: '1.5px solid #b8860b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b8860b',
                  flexShrink: 0
                }}>
                  <Save size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#78350f', letterSpacing: '0.01em', textTransform: 'uppercase' }}>
                    FORM PESANAN PEMBELIAN DARI PR: {linkedPrNumber}
                  </div>
                  <div style={{ fontSize: '12px', color: '#92400e', marginTop: '2px', fontWeight: 500 }}>
                    Permintaan restock dari Petugas Gudang telah di-ACC. Rincian barang & gudang tujuan otomatis dimuat ke form ini. Silakan pilih <strong>Vendor / Supplier</strong>, sesuaikan harga, lalu klik <strong>"Simpan PO"</strong>.
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: '1.5px solid #d4af37',
                padding: '4px 10px',
                borderRadius: '6px',
                whiteSpace: 'nowrap'
              }}>
                Siap Diterbitkan
              </span>
            </div>
          )}

          <div className="card po-invoice-card" style={{ padding: '40px', backgroundColor: '#ffffff', border: '2px solid #0f172a', borderRadius: '12px', maxWidth: '900px', margin: '0 auto', color: '#000', fontFamily: 'Arial, sans-serif', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
        
        {/* Header Section */}
        <div className="po-header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
          
          {/* Logo & Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ fontFamily: '"Playfair Display", Georgia, serif', color: '#a07c57', fontSize: '42px', fontWeight: 'bold', letterSpacing: '1px' }}>
                DANGAU
              </div>
              <div style={{ fontSize: '11px', color: '#a07c57', letterSpacing: '1px', fontWeight: 'bold', alignSelf: 'flex-end', paddingBottom: '12px', marginLeft: '-6px' }}>
                HOTELS & RESORTS
              </div>
            </div>
            
            <div style={{ fontSize: '13px', lineHeight: '1.4', color: '#000' }}>
              Jl. Arteri Supadio K 12 Sungai Raya<br />
              Kubu Raya - Kalimantan Barat<br />
              Purchasing Order Admin :<br />
              +62 822-5046-3315 (Lidya)<br />
              +62 858-2251-8420 (Cello)
            </div>
          </div>

          {/* Right Header: PURCHASE ORDER */}
          <div style={{ width: '320px' }}>
            <h1 style={{ color: primaryBlue, fontSize: '32px', fontWeight: 800, textAlign: 'right', marginBottom: '16px', letterSpacing: '1px', marginTop: '10px' }}>
              PURCHASE ORDER
            </h1>
            
            <table style={{ width: '100%', fontSize: '13px', fontWeight: 'bold', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '4px', textAlign: 'right', width: '120px' }}>DATE</td>
                  <td style={{ padding: '2px 4px' }}>
                    <input type="date" value={poDate} onChange={e => setPoDate(e.target.value)} style={{ width: '100%', padding: '4px', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', textAlign: 'center', outline: 'none' }} />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '4px', textAlign: 'right' }}>P.O. #</td>
                  <td style={{ padding: '2px 4px' }}>
                    <input type="text" value={poNumber} onChange={e => setPoNumber(e.target.value)} style={{ width: '100%', padding: '4px', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', textAlign: 'center', outline: 'none' }} />
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '4px', textAlign: 'right' }}>ARRIVE DATE</td>
                  <td style={{ padding: '2px 4px' }}>
                    <input type="date" value={arriveDate} onChange={e => setArriveDate(e.target.value)} style={{ width: '100%', padding: '4px', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', textAlign: 'center', outline: 'none' }} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor & Ship To */}
        <div className="po-vendor-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '20px' }}>
          <div>
            <div style={{ backgroundColor: darkBlue, color: '#fff', padding: '4px 8px', fontWeight: 'bold', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>VENDOR</span>
              <button
                type="button"
                onClick={handleAddNewVendor}
                style={{
                  background: 'rgba(255,255,255,0.25)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.4)',
                  borderRadius: '4px',
                  padding: '2px 8px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={12} /> Tambah Vendor Baru
              </button>
            </div>
            <div style={{ padding: '4px 0' }}>
              <input
                type="text"
                list="supplier-list"
                value={selectedVendor}
                onChange={e => setSelectedVendor(e.target.value)}
                style={{ width: '100%', border: 'none', fontSize: '14px', padding: '6px 4px', borderBottom: '1.5px solid #cbd5e1', outline: 'none', fontWeight: 600 }}
                placeholder="Pilih atau ketik vendor baru..."
              />
              <datalist id="supplier-list">
                {suppliers.map(s => <option key={s.id} value={s.supplier_name} />)}
              </datalist>
            </div>
          </div>
          <div>
            <div style={{ backgroundColor: darkBlue, color: '#fff', padding: '4px 8px', fontWeight: 'bold', fontSize: '14px' }}>
              SHIP TO
            </div>
            <div style={{ padding: '4px 0' }}>
              <input type="text" list="warehouse-list" value={selectedShipTo} onChange={e => setSelectedShipTo(e.target.value)} style={{ width: '100%', border: 'none', fontSize: '14px', padding: '4px', borderBottom: '1px solid #cbd5e1', outline: 'none' }} placeholder="Pilih Tujuan..." />
              <datalist id="warehouse-list">
                {warehouses.map(w => <option key={w.id} value={w.warehouse_name} />)}
              </datalist>
            </div>
          </div>
        </div>

        <datalist id="item-list">
          {itemsList.map(i => (
            <option key={i.id} value={i.item_name}>
              {i.item_name} ({i.unit_name || 'PCS'})
            </option>
          ))}
        </datalist>

        {/* Line Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
          <thead>
            <tr style={{ backgroundColor: darkBlue, color: '#fff', fontSize: '13px' }}>
              <th style={{ padding: '6px', width: '45px', textAlign: 'center', borderRight: '1px solid #fff' }}>No</th>
              <th style={{ padding: '6px', textAlign: 'left', borderRight: '1px solid #fff' }}>DESCRIPTION</th>
              <th style={{ padding: '6px', width: '65px', textAlign: 'center', borderRight: '1px solid #fff' }}>QTY</th>
              <th style={{ padding: '6px', width: '65px', textAlign: 'center', borderRight: '1px solid #fff' }}>UNIT</th>
              <th style={{ padding: '6px', width: '120px', textAlign: 'center', borderRight: '1px solid #fff' }}>UNIT PRICE</th>
              <th style={{ padding: '6px', width: '120px', textAlign: 'center', borderRight: '1px solid #fff' }}>TOTAL</th>
              <th className="no-print" style={{ padding: '6px', width: '45px', textAlign: 'center' }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => {
              const itemTotal = parseFloat(item.qty || 0) * parseFloat(item.price || 0);
              return (
                <tr key={item.id} style={{ borderBottom: '1px solid #cbd5e1', fontSize: '13px' }}>
                  <td style={{ borderRight: '1px solid #cbd5e1', borderLeft: '1px solid #cbd5e1', textAlign: 'center', padding: '4px' }}>
                    {idx + 1}
                  </td>
                  <td style={{ borderRight: '1px solid #cbd5e1', padding: '4px' }}>
                    <input
                      type="text"
                      list="item-list"
                      placeholder="Pilih atau ketik barang..."
                      value={item.name}
                      onChange={e => handleItemChange(item.id, 'name', e.target.value)}
                      style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontSize: '13px' }}
                    />
                  </td>
                  <td style={{ borderRight: '1px solid #cbd5e1', padding: '4px' }}>
                    <input
                      type="number"
                      min="1"
                      placeholder="0"
                      value={item.qty || ''}
                      onChange={e => handleItemChange(item.id, 'qty', e.target.value)}
                      style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', outline: 'none', fontSize: '13px' }}
                    />
                  </td>
                  <td style={{ borderRight: '1px solid #cbd5e1', padding: '4px' }}>
                    <input
                      type="text"
                      placeholder="Unit"
                      value={item.unit}
                      onChange={e => handleItemChange(item.id, 'unit', e.target.value)}
                      style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'center', outline: 'none', fontSize: '13px' }}
                    />
                  </td>
                  <td style={{ borderRight: '1px solid #cbd5e1', padding: '4px' }}>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={item.price || ''}
                      onChange={e => handleItemChange(item.id, 'price', e.target.value)}
                      style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'right', outline: 'none', fontSize: '13px' }}
                    />
                  </td>
                  <td style={{ borderRight: '1px solid #cbd5e1', padding: '6px 4px', textAlign: 'right', backgroundColor: '#e2e8f0', fontWeight: 600 }}>
                    Rp{itemTotal.toLocaleString('id-ID')}
                  </td>
                  <td className="no-print" style={{ borderRight: '1px solid #cbd5e1', textAlign: 'center', padding: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(item.id)}
                      disabled={lineItems.length <= 1}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: lineItems.length <= 1 ? '#cbd5e1' : '#dc2626',
                        cursor: lineItems.length <= 1 ? 'not-allowed' : 'pointer',
                        padding: '2px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={lineItems.length <= 1 ? 'Minimal 1 baris' : 'Hapus baris'}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Tombol Tambah Baris di Bawah Tabel */}
        <div className="no-print" style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={handleAddLineItem}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              backgroundColor: '#f8fafc',
              color: '#1e293b',
              border: '1.5px dashed #94a3b8',
              borderRadius: '6px',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#475569'; }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
          >
            <Plus size={15} color="#2563eb" />
            <span>+ Tambah Baris Barang</span>
          </button>
        </div>

        {/* Footer Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          
          {/* Notes Left */}
          <div style={{ width: '50%' }}>
            <div style={{ backgroundColor: tealHeader, color: '#fff', padding: '4px 8px', fontWeight: 'bold', fontSize: '13px' }}>
              Note:
            </div>
            <textarea
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              style={{ width: '100%', border: '1px solid #cbd5e1', padding: '6px', fontSize: '12px', color: '#dc2626', minHeight: '80px', fontFamily: 'Arial, sans-serif', outline: 'none', resize: 'vertical' }}
            />
          </div>

          {/* Totals Right */}
          <div style={{ width: '35%' }}>
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '6px 4px', textAlign: 'right', paddingRight: '16px' }}>SUBTOTAL</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', backgroundColor: '#e2e8f0', width: '120px' }}>Rp{subtotal.toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 4px', textAlign: 'right', paddingRight: '16px' }}>PPN%</td>
                  <td style={{ padding: '4px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px' }}>
                      <input type="number" value={ppnPercent} onChange={e => setPpnPercent(e.target.value)} style={{ width: '50px', textAlign: 'right', border: 'none', background: 'transparent', outline: 'none' }} />
                      <span style={{ marginLeft: '4px' }}>%</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '6px 4px', textAlign: 'right', paddingRight: '16px' }}>TOTAL PPN</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', backgroundColor: '#e2e8f0' }}>Rp{vatAmount.toLocaleString('id-ID')}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 4px', textAlign: 'right', paddingRight: '16px', fontWeight: 'bold' }}>TOTAL</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right', backgroundColor: '#e2e8f0', fontWeight: 'bold' }}>Rp{grandTotal.toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Contact */}
        <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '12px', color: '#000' }}>
          If you have any questions about this purchase order, please contact<br />
          +62 822-5046-3315 (Lidya) / +62 858-2251-8420 (Cello)
        </div>
        </div>
        </>
      )}
    </div>
  );
};

export default PesananPembelian;
