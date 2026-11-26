import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { customSwal as Swal } from '../utils/swal';
import {
  Calendar,
  Search,
  Plus,
  UtensilsCrossed,
  BedDouble,
  Home,
  Pizza,
  Trash2,
  Package,
  Clock,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Pagination from '../components/Pagination';

const BarangKeluar = () => {
  const { isMaster, selectedWarehouse, globalSearch, setGlobalSearch } = useAuth();
  const [viewMode, setViewMode] = useState('list');

  const [issues, setIssues] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [dateFilter, setDateFilter] = useState('');
  const [outletFilter, setOutletFilter] = useState('');
  
  const searchItemName = globalSearch;
  const setSearchItemName = setGlobalSearch;

  // Form State
  const [formWarehouseId, setFormWarehouseId] = useState('1');
  const [selectedOutlet, setSelectedOutlet] = useState('Warung Dangau');
  const [inputItemName, setInputItemName] = useState('');
  const [inputQty, setInputQty] = useState('1');
  const [inputUnit, setInputUnit] = useState('KG');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  // List of added items in form
  const [addedItems, setAddedItems] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const effectiveWh = selectedWarehouse !== 'ALL' ? selectedWarehouse : formWarehouseId;
      const whParam = selectedWarehouse !== 'ALL' ? `?warehouse_id=${selectedWarehouse}` : '';
      const [giRes, itemsRes, whRes] = await Promise.all([
        api.get(`/goods-issues${whParam}`),
        api.get(`/items?warehouse_id=${effectiveWh}`),
        api.get('/warehouses')
      ]);

      setIssues(giRes.data);
      setItemsList(itemsRes.data);
      setWarehouses(whRes.data);
      if (whRes.data.length > 0 && selectedWarehouse !== 'ALL') {
        setFormWarehouseId(selectedWarehouse);
      } else if (whRes.data.length > 0 && !formWarehouseId) {
        setFormWarehouseId(whRes.data[0].id.toString());
      }
    } catch (err) {
      console.error('Error loading goods issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWarehouse, formWarehouseId]);

  const outletsList = [
    { name: 'Warung Dangau', icon: UtensilsCrossed },
    { name: 'Hotel Dangau', icon: BedDouble },
    { name: 'Randayan', icon: Home },
    { name: 'Tanggooe Pizzeria', icon: Pizza },
  ];

  // Helper untuk memastikan hanya 4 outlet resmi yang ditampilkan
  const normalizeOutlet = (rawName) => {
    if (!rawName) return 'Warung Dangau';
    const lower = rawName.toLowerCase();
    if (lower.includes('pizzeria') || lower.includes('tanggooe') || lower.includes('vip lounge')) return 'Tanggooe Pizzeria';
    if (lower.includes('randayan')) return 'Randayan';
    if (lower.includes('hotel') || lower.includes('housekeeping')) return 'Hotel Dangau';
    if (lower.includes('warung') || lower.includes('kitchen') || lower.includes('resto') || lower.includes('f&b')) return 'Warung Dangau';
    return rawName;
  };

  const historyRowsList = issues.flatMap((gi) => {
    const validOutlet = normalizeOutlet(gi.outlet_name);
    if (!gi.items || gi.items.length === 0) {
      return [{
        id: `${gi.id}-0`,
        raw_date: gi.issue_date,
        date: new Date(gi.issue_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        outlet: validOutlet,
        item_name: 'Item Pengeluaran',
        qty: '1.0',
        unit: 'PCS',
        status: 'DONE'
      }];
    }
    return gi.items.map((item, idx) => ({
      id: `${gi.id}-${idx}`,
      raw_date: gi.issue_date,
      date: new Date(gi.issue_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      outlet: validOutlet,
      item_name: item.item_name || 'Item Barang',
      qty: parseFloat(item.quantity).toFixed(1),
      unit: item.unit_name || 'PCS',
      status: 'DONE'
    }));
  });

  const filteredHistory = historyRowsList.filter(row => {
    const matchesSearch = row.item_name.toLowerCase().includes((searchItemName || '').toLowerCase());
    const matchesOutlet = !outletFilter || row.outlet === outletFilter;
    
    let matchesDate = true;
    if (dateFilter) {
      const filterDateStr = new Date(dateFilter).toDateString();
      const rowDateStr = new Date(row.raw_date || row.date).toDateString();
      matchesDate = filterDateStr === rowDateStr;
    }
    
    return matchesSearch && matchesOutlet && matchesDate;
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchItemName, outletFilter, dateFilter]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredHistory.slice(indexOfFirstRow, indexOfLastRow);

  const recentOutboundSideList = issues.slice(0, 4).map(gi => ({
    id: gi.id,
    outlet: normalizeOutlet(gi.outlet_name),
    date: new Date(gi.issue_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    items_desc: `${gi.items?.length || 1} Item diambil`,
    code: gi.gi_number || `OUT-${gi.id}`,
    status: 'COMPLETED'
  }));

  const handleAddItemToForm = (e) => {
    e.preventDefault();
    if (!inputItemName.trim()) return;
    
    const matchedItem = itemsList.find(i => 
      i.item_name.toLowerCase() === inputItemName.trim().toLowerCase() ||
      (i.sku && i.sku.toLowerCase() === inputItemName.trim().toLowerCase())
    );
    if (!matchedItem) {
      Swal.fire({ icon: 'error', title: 'Data Tidak Valid', text: 'Nama barang harus dipilih dari list data stock yang ada! (Perhatikan huruf kapital/spasi)' });
      return;
    }

    const requestedQty = parseFloat(inputQty);
    if (isNaN(requestedQty) || requestedQty <= 0) {
      Swal.fire({ icon: 'error', title: 'Data Tidak Valid', text: 'Jumlah barang (Qty) harus lebih dari 0.' });
      return;
    }

    const currentQtyInForm = addedItems
      .filter(i => (i.item_id && i.item_id === matchedItem.id) || i.item_name.toLowerCase() === matchedItem.item_name.toLowerCase())
      .reduce((sum, i) => sum + parseFloat(i.qty), 0);
      
    const availableStock = matchedItem.warehouse_stock !== undefined 
      ? parseFloat(matchedItem.warehouse_stock) 
      : (parseFloat(matchedItem.total_stock) || 0);
    
    if (currentQtyInForm + requestedQty > availableStock) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Stok Tidak Cukup', 
        text: `Sisa stok '${matchedItem.item_name}' di gudang ini hanya ${availableStock} ${matchedItem.unit_name || inputUnit}.` 
      });
      return;
    }

    const newItem = {
      id: Date.now(),
      item_id: matchedItem.id,
      item_name: matchedItem.item_name,
      qty: parseFloat(inputQty).toFixed(2),
      unit: matchedItem.unit_name || inputUnit
    };
    setAddedItems([...addedItems, newItem]);
    setInputItemName('');
    setInputQty('1');
  };

  const handleRemoveItem = (id) => {
    setAddedItems(addedItems.filter(item => item.id !== id));
  };

  const handleProcessDelivery = async () => {
    if (addedItems.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Form Kosong', text: 'Tambahkan setidaknya 1 item.' });
      return;
    }
    try {
      const payload = {
        warehouse_id: parseInt(formWarehouseId, 10) || 1,
        requester_name: 'Staf Operasional',
        outlet_name: selectedOutlet,
        notes: `Pengeluaran outlet untuk ${selectedOutlet}`,
        attachment_url: attachmentUrl || 'Dokumentasi Pengeluaran Fisik',
        items: addedItems.map(item => ({
          item_id: item.item_id,
          quantity: parseFloat(item.qty)
        }))
      };
      await api.post('/goods-issues', payload);
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data barang keluar telah dicatat.',
        timer: 2000,
        showConfirmButton: false
      });
      
      setViewMode('list');
      setAttachmentUrl('');
      fetchData();
    } catch (err) {
      console.warn('Process delivery warning:', err);
      const errMsg = err.response?.data?.message || 'Gagal mencatat barang keluar.';
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: errMsg
      });
    }
  };

  if (viewMode === 'form') {
    return (
      <div>
        <div className="page-header-block">
          <div>
            <h1 className="page-title">Barang Keluar (OUT)</h1>
            <p className="page-description">Input sesuai outlet yang mengambil</p>
          </div>
          <div style={{ fontSize: '12.5px', color: '#64748b', fontStyle: 'italic' }}>
            Tanggal : {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        <div className="form-2col-layout">
          {/* Left Column: Form & Item Selection */}
          <div className="card">
            {/* Warehouse Selector */}
            <div style={{ marginBottom: '18px', padding: '12px 14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <label className="form-label-custom" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Home size={14} color="#6366f1" />
                <span>GUDANG ASAL PENGELUARAN *</span>
              </label>
              <select
                className="form-input-custom"
                value={formWarehouseId}
                onChange={(e) => setFormWarehouseId(e.target.value)}
                style={{ width: '100%', cursor: 'pointer', fontWeight: 600, marginTop: '4px' }}
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.warehouse_name} ({w.warehouse_code})
                  </option>
                ))}
              </select>
            </div>

            {/* Section 1: Outlet Selector */}
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Home size={18} />
              <span>1. Outlet yang Mengambil</span>
            </h3>

            <div className="outlet-grid">
              {outletsList.map(out => {
                const Icon = out.icon;
                const isSelected = selectedOutlet === out.name;
                return (
                  <div
                    key={out.name}
                    className={`outlet-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedOutlet(out.name)}
                  >
                    {isSelected && (
                      <div className="outlet-card-check">
                        <Check size={10} />
                      </div>
                    )}
                    <Icon size={24} color={isSelected ? '#2563eb' : '#64748b'} />
                    <span className="outlet-card-title">{out.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Section 2: List Barang yang Di Ambil */}
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Package size={18} />
              <span>2. List Barang yang Di Ambil</span>
            </h3>

            {/* Add Item Form Row */}
            <form onSubmit={handleAddItemToForm} style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 1fr auto', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label className="form-label-custom">Nama Item</label>
                <div className="form-input-icon-wrapper" style={{ position: 'relative' }}>
                  <Search className="form-input-icon" size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}/>
                  <input
                    type="text"
                    list="keluar-items-options"
                    className="form-input-custom"
                    style={{ paddingLeft: '32px', width: '100%' }}
                    placeholder="Pilih dari stok..."
                    value={inputItemName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setInputItemName(val);
                      const matchedItem = itemsList.find(i => i.item_name.toLowerCase() === val.toLowerCase());
                      if (matchedItem) {
                        setInputUnit(matchedItem.unit_name);
                      }
                    }}
                  />
                  <datalist id="keluar-items-options">
                    {itemsList.map(item => (
                      <option key={item.id} value={item.item_name}>
                        Stok: {item.total_stock} {item.unit_name}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="form-label-custom">Qty</label>
                <input
                  type="number"
                  className="form-input-custom"
                  value={inputQty}
                  onChange={(e) => setInputQty(e.target.value)}
                  step="any"
                />
              </div>

              <div>
                <label className="form-label-custom">Unit</label>
                <select
                  className="form-input-custom"
                  value={inputUnit}
                  onChange={(e) => setInputUnit(e.target.value)}
                >
                  <option value="KG">KG</option>
                  <option value="PCS">PCS</option>
                  <option value="Btg">Btg</option>
                  <option value="Sak">Sak</option>
                  <option value="Box">Box</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn-dark" style={{ height: '36px' }}>
                  <Plus size={14} />
                  <span>Tambah Item</span>
                </button>
              </div>
            </form>

            {/* Selected Items Table */}
            <table className="outbound-items-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>No.</th>
                  <th>Item Name</th>
                  <th>Qty</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {addedItems.map((item, idx) => (
                  <tr key={item.id}>
                    <td>{idx + 1}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{item.item_name}</td>
                    <td>
                      <span className="qty-blue-badge">
                        {item.qty} {item.unit}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Wajib Dokumentasi */}
            <div style={{ marginBottom: '16px', border: '1px dashed #ef4444', padding: '12px', borderRadius: '8px', backgroundColor: '#fef2f2' }}>
               <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#b91c1c', marginBottom: '8px' }}>
                 DOKUMENTASI WAJIB (*)
               </label>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <input
                   type="file"
                   required
                   accept="image/*,.pdf"
                   onChange={(e) => {
                     const file = e.target.files[0];
                     setAttachmentUrl(file ? file.name : '');
                   }}
                   style={{ fontSize: '13px', flex: 1, padding: '4px', cursor: 'pointer' }}
                 />
                 {attachmentUrl && (
                   <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                     <Check size={14} style={{ marginRight: '4px' }}/>
                     File Tersimpan
                   </span>
                 )}
               </div>
            </div>

            {/* Card Footer: Total & Process Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <div style={{ fontSize: '13px', color: '#475569', fontStyle: 'italic' }}>
                Total Items: <strong>{addedItems.length}</strong>
              </div>
              <button onClick={handleProcessDelivery} className="btn-dark">
                <Package size={16} />
                <span>Process Outbound Delivery</span>
              </button>
            </div>
          </div>

          {/* Right Column: Riwayat Pengambilan Side Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#0f172a" />
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Riwayat Pengambilan</h3>
              </div>
            </div>

            <div>
              {recentOutboundSideList.map(item => (
                <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', marginBottom: '10px', backgroundColor: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{item.outlet}</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{item.date}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>
                    {item.items_desc}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>{item.code}</span>
                    <span className="badge-completed">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setViewMode('list')}
              className="btn-outline-white"
              style={{ width: '100%', marginTop: '12px', textDecoration: 'none', textAlign: 'center', display: 'block', fontStyle: 'italic' }}
            >
              Lihat Semua Histori
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header-block">
        <div>
          <h1 className="page-title">Riwayat Barang Keluar (OUT)</h1>
        </div>
      </div>

      <div className="table-container">
        {/* Top Toolbar Filter Bar */}
        <div className="table-toolbar" style={{ gridTemplateColumns: '1fr 1fr 1fr auto' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', alignItems: 'center' }}>
            {/* Date filter */}
            <div style={{ position: 'relative', width: '200px' }}>
              <input
                type="date"
                className="form-input"
                style={{ width: '100%', paddingLeft: '12px' }}
                value={dateFilter}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            {/* Outlet filter */}
            <select
              className="form-select"
              style={{ width: '180px' }}
              value={outletFilter}
              onChange={(e) => setOutletFilter(e.target.value)}
            >
              <option value="">Semua Outlet</option>
              {outletsList.map(o => (
                <option key={o.name} value={o.name}>{o.name}</option>
              ))}
            </select>

            {/* Item search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Cari Nama Item"
                style={{ width: '100%', paddingLeft: '32px' }}
                value={searchItemName}
                onChange={(e) => setSearchItemName(e.target.value)}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            </div>

            {/* Action button */}
            <button onClick={() => setViewMode('form')} className="btn-dark" style={{ marginLeft: 'auto' }}>
              <Plus size={16} />
              <span>Tambah Pengambilan</span>
            </button>
          </div>
        </div>

        {/* Table Data */}
        <table className="data-table">
          <thead>
            <tr>
              <th>TANGGAL</th>
              <th>OUTLET</th>
              <th>NAMA ITEM</th>
              <th>QTY</th>
              <th>UNIT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row) => (
              <tr key={row.id}>
                <td style={{ color: '#64748b', fontSize: '12.5px' }}>{row.date}</td>
                <td>
                  <span style={{ color: '#2563eb', fontWeight: 500, cursor: 'pointer' }}>{row.outlet}</span>
                </td>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>{row.item_name}</td>
                <td style={{ fontWeight: 600 }}>{row.qty}</td>
                <td style={{ color: '#64748b' }}>{row.unit}</td>
                <td>
                  {row.status === 'DRAFT' ? (
                    <span className="badge-draft">DRAFT</span>
                  ) : (
                    <span className="badge-done">DONE</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <Pagination 
          currentPage={currentPage}
          totalItems={filteredHistory.length}
          itemsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default BarangKeluar;
