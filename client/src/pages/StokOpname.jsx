import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { customSwal as Swal } from '../utils/swal';
import {
  Calendar,
  Search,
  Plus,
  Package,
  Clock,
  Trash2,
  Save,
  Check,
  ChevronLeft,
  SlidersHorizontal,
  Layers,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowRight,
  Eye,
  X,
  FileSpreadsheet,
  RotateCcw,
  Sparkles
} from 'lucide-react';

const StokOpname = () => {
  const { isGudang, isAdmin, isMaster, selectedWarehouse, setSelectedWarehouse, globalSearch, setGlobalSearch } = useAuth();

  const [viewMode, setViewMode] = useState('list'); // 'list' or 'form'
  const [loading, setLoading] = useState(true);

  // --- LIST VIEW STATE ---
  const [historyList, setHistoryList] = useState([]);
  const [selectedDetailSO, setSelectedDetailSO] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // --- BATCH MULTI-ITEM FORM VIEW STATE ---
  const [formWarehouseId, setFormWarehouseId] = useState(selectedWarehouse !== 'ALL' ? selectedWarehouse : '1');
  const [opnameNotes, setOpnameNotes] = useState('Audit Fisik Reguler Persediaan');
  const [sheetItems, setSheetItems] = useState([]);
  const [sheetSearch, setSheetSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const whParam = selectedWarehouse !== 'ALL' ? `?warehouse_id=${selectedWarehouse}` : '';
      const histRes = await api.get(`/stock-opnames${whParam}`);
      setHistoryList(histRes.data);
    } catch (err) {
      console.error('Error fetching stock opname history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWarehouse]);

  // Load Inventory Sheet for selected warehouse
  const loadWarehouseSheet = async (whId) => {
    try {
      setLoading(true);
      const res = await api.get(`/inventory?warehouse_id=${whId}`);
      if (Array.isArray(res.data)) {
        const mapped = res.data.map(inv => ({
          item_id: inv.item_id,
          sku: inv.sku,
          item_name: inv.item_name,
          category_name: inv.category_name || 'Umum',
          unit_name: inv.unit_name || 'PCS',
          system_stock: parseFloat(inv.current_stock || 0),
          physical_stock: '', // blank initially for audit entry
          reason: '',
          is_checked: true
        }));
        setSheetItems(mapped);
      }
    } catch (err) {
      console.error('Error loading inventory sheet:', err);
      Swal.fire({ icon: 'error', title: 'Gagal Memuat Barang', text: 'Tidak dapat memuat daftar persediaan gudang.' });
    } finally {
      setLoading(false);
    }
  };

  // Switch to Form Mode & Load Sheet
  const handleOpenForm = (whId = null) => {
    const targetWh = whId || (selectedWarehouse !== 'ALL' ? selectedWarehouse : '1');
    setFormWarehouseId(targetWh);
    setSheetSearch('');
    setCategoryFilter('ALL');
    setViewMode('form');
    loadWarehouseSheet(targetWh);
  };

  // Warehouse change inside form
  const handleFormWarehouseChange = (whId) => {
    setFormWarehouseId(whId);
    loadWarehouseSheet(whId);
  };

  // Batch Tool: Fill all physical stock = system stock
  const handleSetAllToSystem = () => {
    setSheetItems(prev => prev.map(item => ({
      ...item,
      physical_stock: String(item.system_stock),
      is_checked: true
    })));
  };

  // Batch Tool: Clear all physical stock inputs
  const handleClearAllPhysical = () => {
    setSheetItems(prev => prev.map(item => ({
      ...item,
      physical_stock: '',
      reason: ''
    })));
  };

  // Batch Tool: Check only items that have differences
  const handleCheckOnlyVariances = () => {
    setSheetItems(prev => prev.map(item => {
      const hasPhys = item.physical_stock !== '' && !isNaN(parseFloat(item.physical_stock));
      const hasDiff = hasPhys && parseFloat(item.physical_stock) !== item.system_stock;
      return {
        ...item,
        is_checked: hasDiff
      };
    }));
  };

  // Toggle single item check
  const handleToggleCheck = (itemId) => {
    setSheetItems(prev => prev.map(item => 
      item.item_id === itemId ? { ...item, is_checked: !item.is_checked } : item
    ));
  };

  // Toggle select all
  const handleToggleSelectAll = () => {
    const allChecked = sheetItems.every(i => i.is_checked);
    setSheetItems(prev => prev.map(item => ({ ...item, is_checked: !allChecked })));
  };

  // Update physical qty on row
  const handleRowPhysicalChange = (itemId, val) => {
    setSheetItems(prev => prev.map(item => 
      item.item_id === itemId ? { ...item, physical_stock: val, is_checked: true } : item
    ));
  };

  // Update row reason
  const handleRowReasonChange = (itemId, val) => {
    setSheetItems(prev => prev.map(item => 
      item.item_id === itemId ? { ...item, reason: val } : item
    ));
  };

  // Set single row physical = system
  const handleSetSingleToSystem = (itemId) => {
    setSheetItems(prev => prev.map(item => 
      item.item_id === itemId ? { ...item, physical_stock: String(item.system_stock), is_checked: true } : item
    ));
  };

  // Submit Batch Opname
  const handleSubmitBatchOpname = async () => {
    if (!formWarehouseId || formWarehouseId === 'ALL') {
      Swal.fire({ icon: 'warning', title: 'Pilih Gudang', text: 'Pilih gudang yang valid untuk stock opname.' });
      return;
    }

    // Filter items that are checked and have physical stock filled
    const readyItems = sheetItems.filter(i => i.is_checked && i.physical_stock !== '' && !isNaN(parseFloat(i.physical_stock)));

    if (readyItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Tidak Ada Barang Dipilih',
        text: 'Isi angka stok fisik minimal pada 1 barang dan pastikan kotak centangnya terpilih.'
      });
      return;
    }

    // Validate no negative quantities
    const hasNegative = readyItems.some(i => parseFloat(i.physical_stock) < 0);
    if (hasNegative) {
      Swal.fire({ icon: 'error', title: 'Jumlah Tidak Valid', text: 'Stok fisik tidak boleh bernilai negatif.' });
      return;
    }

    // Count differences
    const varianceItems = readyItems.filter(i => parseFloat(i.physical_stock) !== i.system_stock);

    const result = await Swal.fire({
      title: 'Konfirmasi Hasil Stock Opname',
      html: `
        <div style="text-align: left; font-size: 13.5px; line-height: 1.6;">
          <p>Anda akan memproses <b>${readyItems.length} barang</b> sekaligus:</p>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Barang Sesuai: <b>${readyItems.length - varianceItems.length} item</b></li>
            <li>Barang Ada Selisih: <b style="color: ${varianceItems.length > 0 ? '#b91c1c' : '#15803d'}">${varianceItems.length} item</b></li>
          </ul>
          <p style="margin-top: 10px; color: #78716c;">Stok fisik di sistem akan otomatis diperbarui sesuai angka audit yang Anda masukkan.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Simpan Stock Opname',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#b8860b'
    });

    if (!result.isConfirmed) return;

    try {
      setIsSubmitting(true);
      const payload = {
        warehouse_id: parseInt(formWarehouseId, 10),
        notes: opnameNotes || 'Audit Fisik Reguler Persediaan',
        items: readyItems.map(i => ({
          item_id: i.item_id,
          physical_stock: parseFloat(i.physical_stock),
          reason: i.reason || (parseFloat(i.physical_stock) === i.system_stock ? 'Sesuai fisik' : 'Penyesuaian hasil opname')
        }))
      };

      const res = await api.post('/stock-opnames', payload);

      Swal.fire({
        icon: 'success',
        title: 'Stock Opname Berhasil!',
        text: `Berhasil menyesuaikan ${readyItems.length} barang pada ${res.data?.stock_opname?.opname_number || 'dokumen SO'}.`,
        timer: 2500,
        showConfirmButton: false
      });

      setViewMode('list');
      fetchData();
    } catch (err) {
      console.error('Error submit batch opname:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.response?.data?.message || err.message || 'Terjadi kesalahan sistem saat menyimpan.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Detail Modal for History Row
  const handleOpenDetailModal = async (soId) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/stock-opnames/${soId}`);
      setSelectedDetailSO(res.data);
    } catch (err) {
      console.error('Error fetching SO detail:', err);
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Tidak dapat memuat rincian transaksi opname.' });
    } finally {
      setDetailLoading(false);
    }
  };

  // Filtered Sheet Items based on search and category
  const categoriesList = Array.from(new Set(sheetItems.map(i => i.category_name).filter(Boolean)));
  
  const filteredSheet = sheetItems.filter(item => {
    const matchSearch = sheetSearch === '' || 
      item.item_name.toLowerCase().includes(sheetSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(sheetSearch.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || item.category_name === categoryFilter;
    return matchSearch && matchCat;
  });

  // Calculate audit statistics
  const totalItemsCount = sheetItems.length;
  const countedItems = sheetItems.filter(i => i.physical_stock !== '' && !isNaN(parseFloat(i.physical_stock)));
  const checkedItems = sheetItems.filter(i => i.is_checked && i.physical_stock !== '' && !isNaN(parseFloat(i.physical_stock)));
  const matchedCount = countedItems.filter(i => parseFloat(i.physical_stock) === i.system_stock).length;
  const varianceCount = countedItems.filter(i => parseFloat(i.physical_stock) !== i.system_stock).length;

  // =========================================================================
  // VIEW MODE: STOCK OPNAME FORM (AUDIT FISIK PERSEDIAAN)
  // =========================================================================
  if (viewMode === 'form') {
    return (
      <div>
        {/* Header Block: Tegas, Kontras Tinggi & Profesional */}
        <div style={{
          background: '#ffffff',
          border: '2px solid #0f172a',
          borderRadius: '14px',
          padding: '20px 24px',
          marginBottom: '22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)'
              }}>
                <FileSpreadsheet size={20} />
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Lembar Audit Stock Opname Fisik
              </h1>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: '1.5px solid #0f172a',
                padding: '4px 12px',
                borderRadius: '6px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Audit Fisik Persediaan
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', margin: 0, fontWeight: 500 }}>
              Periksa dan catat hasil perhitungan fisik barang gudang secara terstruktur dan terverifikasi langsung ke sistem.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 700,
                padding: '10px 18px',
                borderRadius: '8px',
                border: '2px solid #0f172a',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              <ChevronLeft size={16} />
              <span>Kembali ke Riwayat</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitBatchOpname}
              disabled={isSubmitting}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 800,
                padding: '10px 22px',
                borderRadius: '8px',
                border: '2px solid #0f172a',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
              }}
            >
              <Save size={16} />
              <span>{isSubmitting ? 'Memproses...' : `Simpan ${checkedItems.length} Barang Terpilih`}</span>
            </button>
          </div>
        </div>

        {/* Audit Meta Setting Bar: Tegas & Terdefinisi Jelas */}
        <div className="opname-grid" style={{
          background: '#ffffff',
          marginBottom: '20px',
          padding: '18px 22px',
          border: '2px solid #0f172a',
          borderRadius: '12px',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: '18px',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
              LOKASI GUDANG AUDIT *
            </label>
            <select
              value={formWarehouseId}
              onChange={(e) => handleFormWarehouseChange(e.target.value)}
              style={{ width: '100%', border: '2px solid #0f172a', borderRadius: '8px', fontWeight: 700, color: '#0f172a', padding: '9px 12px', fontSize: '13px', backgroundColor: '#ffffff', outline: 'none' }}
            >
              <option value="1">Gudang Dangau (WH-DG) &mdash; Gudang Utama Hotel</option>
              <option value="2">Gudang White House (WH-WH) &mdash; Kediaman Owner</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.05em' }}>
              KETERANGAN / DOKUMEN AUDIT
            </label>
            <input
              type="text"
              value={opnameNotes}
              onChange={(e) => setOpnameNotes(e.target.value)}
              placeholder="Contoh: Audit Fisik Reguler Akhir Bulan Gudang Utama..."
              style={{ width: '100%', border: '2px solid #cbd5e1', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', color: '#0f172a', fontWeight: 600, outline: 'none' }}
              onFocus={(e) => e.target.style.borderColor = '#0f172a'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
          </div>
        </div>

        {/* 4 Stat Summary Cards: Desain Tegas & Berbobot */}
        <div className="opname-metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div style={{ padding: '16px 20px', border: '2px solid #0f172a', borderRadius: '12px', background: '#ffffff', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.05)' }}>
            <div style={{ fontSize: '11.5px', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL BARANG GUDANG</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
              {totalItemsCount} <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>item</span>
            </div>
          </div>

          <div style={{ padding: '16px 20px', border: '2px solid #0284c7', borderRadius: '12px', background: '#f0f9ff', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.08)' }}>
            <div style={{ fontSize: '11.5px', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>SUDAH DIHITUNG FISIK</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0284c7', marginTop: '6px' }}>
              {countedItems.length} <span style={{ fontSize: '13px', fontWeight: 600, color: '#0369a1' }}>item</span>
            </div>
          </div>

          <div style={{ padding: '16px 20px', border: '2px solid #16a34a', borderRadius: '12px', background: '#f0fdf4', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.08)' }}>
            <div style={{ fontSize: '11.5px', color: '#166534', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>FISIK SESUAI (0 SELISIH)</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#15803d', marginTop: '6px' }}>
              {matchedCount} <span style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>item</span>
            </div>
          </div>

          <div style={{
            padding: '16px 20px',
            border: varianceCount > 0 ? '2px solid #dc2626' : '2px solid #cbd5e1',
            borderRadius: '12px',
            background: varianceCount > 0 ? '#fef2f2' : '#ffffff',
            boxShadow: varianceCount > 0 ? '0 2px 8px rgba(220, 38, 38, 0.12)' : '0 2px 6px rgba(15, 23, 42, 0.05)'
          }}>
            <div style={{ fontSize: '11.5px', color: varianceCount > 0 ? '#991b1b' : '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>ADA SELISIH (VARIANCE)</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: varianceCount > 0 ? '#dc2626' : '#64748b', marginTop: '6px' }}>
              {varianceCount} <span style={{ fontSize: '13px', fontWeight: 600, color: varianceCount > 0 ? '#991b1b' : '#64748b' }}>item</span>
            </div>
          </div>
        </div>

        {/* Batch Tools Toolbar & Filters: Bergaris Tegas */}
        <div style={{
          padding: '14px 20px',
          border: '2px solid #0f172a',
          borderRadius: '12px 12px 0 0',
          marginBottom: '0',
          borderBottom: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: '#f8fafc'
        }}>
          {/* Quick Automation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleSetAllToSystem}
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1.5px solid #0f172a',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
              title="Isi kolom fisik semua barang sama persis dengan angka stok sistem"
            >
              <Sparkles size={14} color="#0f172a" />
              <span>Samakan Semua Fisik = Sistem</span>
            </button>

            <button
              type="button"
              onClick={handleCheckOnlyVariances}
              style={{
                backgroundColor: '#ffffff',
                color: '#b91c1c',
                border: '1.5px solid #dc2626',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
              title="Centang hanya barang yang memiliki selisih antara stok fisik dan sistem"
            >
              <AlertTriangle size={14} color="#dc2626" />
              <span>Pilih Hanya yang Berselisih</span>
            </button>

            <button
              type="button"
              onClick={handleClearAllPhysical}
              style={{
                backgroundColor: '#ffffff',
                color: '#475569',
                border: '1.5px solid #94a3b8',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <RotateCcw size={14} />
              <span>Kosongkan Isian Fisik</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ fontSize: '12.5px', padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #0f172a', fontWeight: 600, color: '#0f172a', backgroundColor: '#ffffff', outline: 'none' }}
            >
              <option value="ALL">Semua Kategori</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Keyword Search */}
            <div style={{ position: 'relative', width: '230px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#0f172a' }} />
              <input
                type="text"
                placeholder="Cari nama barang..."
                value={sheetSearch}
                onChange={(e) => setSheetSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '7px', paddingBottom: '7px', fontSize: '12.5px', borderRadius: '8px', border: '1.5px solid #0f172a', outline: 'none', fontWeight: 600 }}
              />
            </div>
          </div>
        </div>

        {/* Batch Items Sheet Table: Garis Tegas & Thead Gelap Berwibawa */}
        <div style={{ borderRadius: '0 0 12px 12px', border: '2px solid #0f172a', overflow: 'hidden', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
          <table className="data-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '2px solid #020617' }}>
                <th style={{ width: '45px', textAlign: 'center', padding: '12px 8px' }}>
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}
                    title="Pilih / Batalkan Semua"
                  >
                    {sheetItems.length > 0 && sheetItems.every(i => i.is_checked) ? (
                      <CheckSquare size={18} color="#38bdf8" />
                    ) : (
                      <Square size={18} color="#94a3b8" />
                    )}
                  </button>
                </th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '12px 14px' }}>NAMA BARANG</th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '12px 14px' }}>KATEGORI</th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center', padding: '12px 14px' }}>SATUAN</th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center', padding: '12px 14px' }}>STOK SISTEM</th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', width: '160px', textAlign: 'center', padding: '12px 14px' }}>
                  STOK FISIK AKTUAL *
                </th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center', width: '140px', padding: '12px 14px' }}>
                  SELISIH (DIFF)
                </th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', width: '220px', padding: '12px 14px' }}>
                  ALASAN / CATATAN
                </th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center', width: '90px', padding: '12px 14px' }}>
                  AKSI
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSheet.map((item) => {
                const hasValue = item.physical_stock !== '' && !isNaN(parseFloat(item.physical_stock));
                const physQty = hasValue ? parseFloat(item.physical_stock) : null;
                const diff = hasValue ? physQty - item.system_stock : null;

                const isExact = hasValue && diff === 0;
                const isSurplus = hasValue && diff > 0;
                const isDeficit = hasValue && diff < 0;

                return (
                  <tr
                    key={item.item_id}
                    style={{
                      backgroundColor: item.is_checked ? (isDeficit ? '#fff8f8' : isSurplus ? '#f4fdf7' : '#ffffff') : '#f8fafc',
                      opacity: item.is_checked ? 1 : 0.65,
                      borderBottom: '1.5px solid #e2e8f0'
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ textAlign: 'center', padding: '10px 8px' }}>
                      <input
                        type="checkbox"
                        checked={item.is_checked}
                        onChange={() => handleToggleCheck(item.item_id)}
                        style={{ cursor: 'pointer', width: '17px', height: '17px', accentColor: '#0f172a' }}
                      />
                    </td>

                    {/* Item Name */}
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>{item.item_name}</div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#0f172a', border: '1.5px solid #cbd5e1', fontWeight: 700 }}>
                        {item.category_name}
                      </span>
                    </td>

                    {/* Unit */}
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#334155', fontSize: '12.5px', padding: '10px 14px' }}>
                      {item.unit_name}
                    </td>

                    {/* System Stock */}
                    <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#0f172a' }}>
                        {item.system_stock}
                      </span>
                    </td>

                    {/* Physical Stock Input Field: Desain Tegas & Berbobot */}
                    <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        value={item.physical_stock}
                        onChange={(e) => handleRowPhysicalChange(item.item_id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          textAlign: 'center',
                          fontWeight: 800,
                          fontSize: '14px',
                          border: hasValue ? (isDeficit ? '2px solid #dc2626' : isSurplus ? '2px solid #16a34a' : '2px solid #0f172a') : '2px solid #cbd5e1',
                          backgroundColor: hasValue ? (isDeficit ? '#fef2f2' : isSurplus ? '#f0fdf4' : '#ffffff') : '#ffffff',
                          color: hasValue ? (isDeficit ? '#991b1b' : isSurplus ? '#166534' : '#0f172a') : '#0f172a',
                          outline: 'none'
                        }}
                      />
                    </td>

                    {/* Difference (Selisih) Badges: Kontras Tinggi */}
                    <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                      {!hasValue ? (
                        <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 700 }}>&mdash;</span>
                      ) : isExact ? (
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: 800,
                          backgroundColor: '#f1f5f9',
                          color: '#1e293b',
                          border: '1.5px solid #64748b',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          display: 'inline-block'
                        }}>
                          Sesuai (0)
                        </span>
                      ) : isSurplus ? (
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: 800,
                          backgroundColor: '#dcfce7',
                          color: '#14532d',
                          border: '1.5px solid #16a34a',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          display: 'inline-block'
                        }}>
                          +{diff} {item.unit_name}
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: 800,
                          backgroundColor: '#fee2e2',
                          color: '#7f1d1d',
                          border: '1.5px solid #dc2626',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          display: 'inline-block'
                        }}>
                          {diff} {item.unit_name}
                        </span>
                      )}
                    </td>

                    {/* Reason Text Input */}
                    <td style={{ padding: '10px 14px' }}>
                      <input
                        type="text"
                        placeholder={diff !== null && diff !== 0 ? 'Wajib/isi alasan selisih...' : 'Catatan opsional...'}
                        value={item.reason}
                        onChange={(e) => handleRowReasonChange(item.item_id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0f172a',
                          border: '1.5px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          outline: 'none'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#0f172a'}
                        onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                      />
                    </td>

                    {/* Row Quick Action */}
                    <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                      <button
                        type="button"
                        onClick={() => handleSetSingleToSystem(item.item_id)}
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '5px 10px',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          border: '1.5px solid #0f172a',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        title="Isi fisik sama dengan sistem"
                      >
                        = Sistem
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredSheet.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontWeight: 600 }}>
                    Tidak ada barang ditemukan untuk kriteria pencarian ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Bottom Action Footer inside Sheet */}
          <div style={{
            padding: '16px 20px',
            background: '#f8fafc',
            borderTop: '2px solid #0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600 }}>
              Terpilih: <b style={{ color: '#0f172a', fontWeight: 800 }}>{checkedItems.length}</b> dari {totalItemsCount} barang &bull;{' '}
              Ada Selisih: <b style={{ color: varianceCount > 0 ? '#dc2626' : '#15803d', fontWeight: 800 }}>{varianceCount} barang</b>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '2px solid #0f172a',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSubmitBatchOpname}
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '8px',
                  padding: '10px 22px',
                  border: '2px solid #0f172a',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
                }}
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Memproses Stock Opname...' : `Simpan & Sesuaikan ${checkedItems.length} Barang`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE: HISTORY LIST VIEW (TEGAS & TERSTRUKTUR)
  // =========================================================================
  const filteredHistory = historyList.filter(row => 
    (row.opname_number && row.opname_number.toLowerCase().includes((globalSearch || '').toLowerCase())) ||
    (row.warehouse_name && row.warehouse_name.toLowerCase().includes((globalSearch || '').toLowerCase())) ||
    (row.created_by_name && row.created_by_name.toLowerCase().includes((globalSearch || '').toLowerCase()))
  );

  return (
    <div>
      {/* Header Block: Tegas, Kontras Tinggi & Profesional */}
      <div style={{
        background: '#ffffff',
        border: '2px solid #0f172a',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)'
            }}>
              <Package size={20} />
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
              Audit Stock Opname (Fisik vs Sistem)
            </h1>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: '1.5px solid #0f172a',
              padding: '4px 12px',
              borderRadius: '6px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              Dangau Kubu Raya
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#475569', margin: 0, fontWeight: 500 }}>
            Daftar audit rekonsiliasi fisik persediaan barang hotel di setiap gudang penyimpanan.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleOpenForm()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 800,
            padding: '11px 22px',
            borderRadius: '8px',
            border: '2px solid #0f172a',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
          }}
        >
          <Plus size={16} />
          <span>+ Input Stock Opname</span>
        </button>
      </div>

      {/* Main Table Container: Tegas & Berbobot */}
      <div style={{ border: '2px solid #0f172a', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: '#f8fafc',
          borderBottom: '2px solid #0f172a',
          padding: '14px 20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em' }}>LOKASI GUDANG:</span>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              style={{ fontSize: '13px', padding: '7px 14px', border: '2px solid #0f172a', borderRadius: '8px', fontWeight: 700, color: '#0f172a', backgroundColor: '#ffffff', outline: 'none' }}
            >
              <option value="ALL">Semua Fasilitas Gudang</option>
              <option value="1">Gudang Dangau (WH-DG)</option>
              <option value="2">Gudang White House (WH-WH)</option>
            </select>
          </div>
          
          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Cari No. Referensi SO..."
              style={{ width: '100%', paddingLeft: '36px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', fontSize: '12.5px', borderRadius: '8px', border: '2px solid #cbd5e1', outline: 'none', fontWeight: 600, color: '#0f172a' }}
              value={globalSearch || ''}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={(e) => e.target.style.borderColor = '#0f172a'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#0f172a' }} />
          </div>
        </div>

        <table className="data-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a', borderBottom: '2px solid #020617' }}>
              <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '12px 16px' }}>TANGGAL AUDIT</th>
              <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '12px 16px' }}>NO. REFERENSI SO</th>
              <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '12px 16px' }}>GUDANG</th>
              <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', padding: '12px 16px' }}>PETUGAS AUDITOR</th>
              <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center', padding: '12px 16px' }}>JUMLAH BARANG</th>
              <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center', padding: '12px 16px' }}>STATUS</th>
              <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center', padding: '12px 16px' }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '13px', fontWeight: 600 }}>
                  Belum ada riwayat stock opname tercatat.
                </td>
              </tr>
            ) : (
              filteredHistory.map(row => (
                <tr key={row.id} style={{ borderBottom: '1.5px solid #e2e8f0' }}>
                  <td style={{ color: '#334155', fontSize: '12.5px', fontWeight: 600, padding: '12px 16px' }}>
                    {new Date(row.opname_date || row.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ fontWeight: 900, color: '#0f172a', fontSize: '13.5px', padding: '12px 16px' }}>{row.opname_number}</td>
                  <td style={{ fontWeight: 700, color: '#0f172a', padding: '12px 16px' }}>{row.warehouse_name}</td>
                  <td style={{ color: '#334155', fontWeight: 600, padding: '12px 16px' }}>{row.created_by_name}</td>
                  <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      backgroundColor: '#f1f5f9',
                      color: '#0f172a',
                      border: '1.5px solid #0f172a',
                      padding: '3px 10px',
                      borderRadius: '6px'
                    }}>
                      {row.items?.length || 0} Barang
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: 800,
                      backgroundColor: '#dcfce7',
                      color: '#14532d',
                      border: '1.5px solid #16a34a',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      display: 'inline-block'
                    }}>
                      {row.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '12px 16px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenDetailModal(row.id)}
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        border: '1.5px solid #0f172a',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}
                    >
                      <Eye size={13} />
                      <span>Rincian</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Detail Stock Opname Items: Desain Tegas & Berbobot */}
      {selectedDetailSO && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px', borderRadius: '14px', border: '2px solid #0f172a', overflow: 'hidden', padding: 0 }}>
            <div className="modal-header" style={{
              background: '#0f172a',
              borderBottom: '2px solid #020617',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h3 className="modal-title" style={{ fontSize: '17px', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Rincian Audit {selectedDetailSO.opname_number}
                </h3>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', fontWeight: 500 }}>
                  {selectedDetailSO.warehouse_name} &bull; Auditor: {selectedDetailSO.created_by_name} &bull; {new Date(selectedDetailSO.opname_date || selectedDetailSO.created_at).toLocaleDateString('id-ID')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailSO(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ffffff' }}
              >
                <X size={20} color="#ffffff" />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px' }}>
              <div style={{
                background: '#f8fafc',
                border: '1.5px solid #0f172a',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#0f172a',
                marginBottom: '18px'
              }}>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>Catatan Dokumen:</span> {selectedDetailSO.notes || 'Audit Fisik Persediaan'}
              </div>

              <div style={{ border: '1.5px solid #0f172a', borderRadius: '8px', overflow: 'hidden' }}>
                <table className="data-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1e293b' }}>
                      <th style={{ fontSize: '11.5px', color: '#ffffff', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '10px 14px' }}>Nama Barang</th>
                      <th style={{ fontSize: '11.5px', color: '#ffffff', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center', padding: '10px 14px' }}>Sistem</th>
                      <th style={{ fontSize: '11.5px', color: '#ffffff', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center', padding: '10px 14px' }}>Fisik</th>
                      <th style={{ fontSize: '11.5px', color: '#ffffff', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center', padding: '10px 14px' }}>Selisih</th>
                      <th style={{ fontSize: '11.5px', color: '#ffffff', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '10px 14px' }}>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDetailSO.items?.map((it, idx) => {
                      const diff = parseFloat(it.difference || 0);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '10px 14px' }}>
                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13px' }}>{it.item_name}</div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: '#334155', padding: '10px 14px' }}>{it.system_stock} {it.unit_name}</td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#0f172a', padding: '10px 14px' }}>{it.physical_stock} {it.unit_name}</td>
                          <td style={{ textAlign: 'center', padding: '10px 14px' }}>
                            <span style={{
                              fontSize: '11.5px',
                              fontWeight: 800,
                              padding: '3px 9px',
                              borderRadius: '6px',
                              backgroundColor: diff === 0 ? '#f1f5f9' : diff > 0 ? '#dcfce7' : '#fee2e2',
                              color: diff === 0 ? '#1e293b' : diff > 0 ? '#14532d' : '#7f1d1d',
                              border: diff === 0 ? '1.5px solid #64748b' : diff > 0 ? '1.5px solid #16a34a' : '1.5px solid #dc2626'
                            }}>
                              {diff > 0 ? `+${diff}` : diff}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic', padding: '10px 14px' }}>
                            {it.reason || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '14px 24px', borderTop: '2px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setSelectedDetailSO(null)}
                style={{
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: 800,
                  borderRadius: '8px',
                  border: '2px solid #0f172a',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StokOpname;
