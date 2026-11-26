import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Barcode,
  Home,
  Save,
  Clock,
  Plus,
  Truck,
  Check,
  DollarSign,
  AlertCircle,
  Edit3,
  Filter,
  CheckCircle2
} from 'lucide-react';
import Pagination from '../components/Pagination';
import { customSwal as Swal } from '../utils/swal';

const BarangMasuk = () => {
  const { isMaster, isAdmin, isGudang, user, selectedWarehouse, globalSearch, setGlobalSearch } = useAuth();
  const [viewMode, setViewMode] = useState('list');

  // Hak Akses Input Harga (Khusus Accounting & Master)
  const canInputPrice = isMaster || isAdmin || user?.role_name === 'Admin' || user?.name?.toLowerCase().includes('accounting');

  const [receipts, setReceipts] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterPriceStatus, setFilterPriceStatus] = useState('ALL'); // 'ALL', 'UNPRICED', 'PRICED'

  const searchSKU = globalSearch;
  const setSearchSKU = setGlobalSearch;

  // Price Modal State for Accounting
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedItemForPrice, setSelectedItemForPrice] = useState(null);
  const [inputUnitPrice, setInputUnitPrice] = useState('');
  const [updateMasterPrice, setUpdateMasterPrice] = useState(true);
  const [savingPrice, setSavingPrice] = useState(false);

  // Form State (Saat input penerimaan fisik barang baru)
  const [formData, setFormData] = useState({
    po_id: '',
    receipt_date: new Date().toISOString().split('T')[0],
    item_name: '',
    item_id: '',
    quantity: '',
    unit_name: 'PCS',
    unit_price: '',
    warehouse_id: '1',
    supplier_id: '',
    notes: '',
    attachment_url: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  // Other input states
  const [isOtherUnit, setIsOtherUnit] = useState(false);
  const [isOtherSupplier, setIsOtherSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const whParam = selectedWarehouse !== 'ALL' ? `?warehouse_id=${selectedWarehouse}` : '';
      const [grRes, itemsRes, whRes, supRes, poRes] = await Promise.all([
        api.get(`/goods-receipts${whParam}`),
        api.get('/items'),
        api.get('/warehouses'),
        api.get('/suppliers'),
        api.get('/purchase-orders')
      ]);

      setReceipts(grRes.data || []);
      setItemsList(itemsRes.data || []);
      setWarehouses(whRes.data || []);
      setSuppliers(supRes.data || []);
      setPurchaseOrders(poRes.data || []);
      if (whRes.data && whRes.data.length > 0 && !formData.warehouse_id) {
        setFormData(prev => ({ ...prev, warehouse_id: whRes.data[0].id.toString() }));
      }
    } catch (err) {
      console.error('Error loading goods receipts data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWarehouse]);

  // Flatten receipts into rows
  const tableDataList = receipts.flatMap((gr) => {
    if (!gr.items || gr.items.length === 0) {
      return [{
        id: `${gr.id}-0`,
        gr_id: gr.id,
        gr_number: gr.gr_number,
        gri_id: null,
        item_id: null,
        date: new Date(gr.receipt_date).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        raw_date: gr.receipt_date,
        warehouse: gr.warehouse_name || (gr.warehouse_code === 'WH-DG' ? 'Gudang Dangau' : 'Gudang White House'),
        item_name: 'Penerimaan Barang',
        qty: '1',
        raw_qty: 1,
        unit: 'Unit',
        source: gr.supplier_name || 'Penerimaan Langsung',
        unit_price: 0,
        total_price: 0,
        master_unit_price: 0,
        is_price_verified: false,
        created_by_name: gr.created_by_name,
        price_verified_by_name: gr.price_verified_by_name,
        price_verified_at: gr.price_verified_at
      }];
    }
    return gr.items.map((item, idx) => {
      const uPrice = parseFloat(item.unit_price) || 0;
      const tPrice = parseFloat(item.total_price) || (uPrice * parseFloat(item.quantity));
      const isVerified = Boolean(gr.is_price_verified && uPrice > 0);

      return {
        id: `${gr.id}-${idx}`,
        gr_id: gr.id,
        gr_number: gr.gr_number,
        gri_id: item.id,
        item_id: item.item_id,
        date: new Date(gr.receipt_date).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        raw_date: gr.receipt_date,
        warehouse: gr.warehouse_name || (gr.warehouse_code === 'WH-DG' ? 'Gudang Dangau' : 'Gudang White House'),
        item_name: item.item_name || 'Barang Masuk',
        qty: parseFloat(item.quantity).toLocaleString('id-ID'),
        raw_qty: parseFloat(item.quantity),
        unit: item.unit_name || 'PCS',
        source: gr.supplier_name || 'Penerimaan Langsung',
        unit_price: uPrice,
        total_price: tPrice,
        master_unit_price: parseFloat(item.master_unit_price) || 0,
        is_price_verified: isVerified,
        created_by_name: gr.created_by_name,
        price_verified_by_name: gr.price_verified_by_name,
        price_verified_at: gr.price_verified_at
      };
    });
  });

  // Hitung jumlah barang yang belum/sudah ada harga
  const unpricedCount = tableDataList.filter(row => row.unit_price <= 0).length;
  const pricedCount = tableDataList.filter(row => row.unit_price > 0).length;

  const filteredRows = tableDataList.filter(row => {
    const matchesSearch = row.item_name.toLowerCase().includes(searchSKU.toLowerCase()) ||
      row.source.toLowerCase().includes(searchSKU.toLowerCase()) ||
      row.warehouse.toLowerCase().includes(searchSKU.toLowerCase()) ||
      (row.gr_number && row.gr_number.toLowerCase().includes(searchSKU.toLowerCase()));
    const matchesSupplier = !filterSupplier || row.source.toLowerCase().includes(filterSupplier.toLowerCase());

    let matchesPrice = true;
    if (filterPriceStatus === 'UNPRICED') {
      matchesPrice = row.unit_price <= 0;
    } else if (filterPriceStatus === 'PRICED') {
      matchesPrice = row.unit_price > 0;
    }

    let matchesDate = true;
    if (startDate || endDate) {
      const rowDate = new Date(row.raw_date || row.date);
      rowDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (rowDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (rowDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesSupplier && matchesPrice && matchesDate;
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchSKU, filterSupplier, filterPriceStatus, startDate, endDate]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);

  const handleApplyFilter = () => {
    // Filter is applied dynamically
  };

  // Recent items side card
  const recentReceiptsSideList = receipts.length > 0
    ? receipts.slice(0, 4).map(gr => ({
      id: gr.id,
      item_name: gr.items && gr.items[0] ? gr.items[0].item_name : 'Barang Masuk',
      wh: gr.warehouse_code || 'WH-DG',
      qty: `+${gr.items && gr.items[0] ? parseFloat(gr.items[0].quantity).toLocaleString('id-ID') : 0} ${gr.items && gr.items[0]?.unit_name || ''}`
    }))
    : [
      { id: 1, item_name: 'Pelumas Industri', wh: 'WH-DG', qty: '+50 BOX' },
      { id: 2, item_name: 'Baja Bearing 12mm', wh: 'WH-WH', qty: '+2000 PCS' },
      { id: 3, item_name: 'Karton Bergelombang', wh: 'WH-DG', qty: '+5 PLT' },
      { id: 4, item_name: 'Sarung Tangan', wh: 'WH-DG', qty: '+100 PR' },
    ];

  // Handler Buka Modal Input Harga
  const handleOpenPriceModal = (row) => {
    setSelectedItemForPrice(row);
    // Jika harga sudah ada, gunakan harga tersebut. Jika belum, gunakan harga master item sebagai saran awal
    setInputUnitPrice(
      row.unit_price > 0
        ? row.unit_price.toString()
        : (row.master_unit_price > 0 ? row.master_unit_price.toString() : '')
    );
    setUpdateMasterPrice(true);
    setPriceModalOpen(true);
  };

  // Handler Simpan Harga oleh Accounting
  const handleSavePrice = async () => {
    if (!selectedItemForPrice) return;
    const parsedPrice = parseFloat(inputUnitPrice);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Harga Tidak Valid',
        text: 'Masukkan angka nominal harga satuan yang valid (>= 0).'
      });
      return;
    }

    try {
      setSavingPrice(true);
      await api.put(`/goods-receipts/${selectedItemForPrice.gr_id}/prices`, {
        items: [
          {
            id: selectedItemForPrice.gri_id,
            item_id: selectedItemForPrice.item_id,
            unit_price: parsedPrice
          }
        ],
        update_master_price: updateMasterPrice
      });

      Swal.fire({
        icon: 'success',
        title: 'Harga Berhasil Disimpan!',
        text: `Harga satuan untuk '${selectedItemForPrice.item_name}' sebesar Rp ${parsedPrice.toLocaleString('id-ID')} telah diverifikasi oleh Accounting.`,
        timer: 2000,
        showConfirmButton: false
      });

      setPriceModalOpen(false);
      setSelectedItemForPrice(null);
      await fetchData();
    } catch (err) {
      console.error('Error saving price:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan Harga',
        text: err.response?.data?.message || 'Gagal menyimpan harga barang masuk.'
      });
    } finally {
      setSavingPrice(false);
    }
  };

  // Submit Form Barang Masuk (Petugas Gudang / Accounting)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!formData.item_name.trim()) {
      setAlertMsg({ type: 'error', text: 'Nama barang wajib diisi!' });
      return;
    }
    const qty = parseFloat(formData.quantity);
    if (isNaN(qty) || qty <= 0) {
      setAlertMsg({ type: 'error', text: 'Jumlah barang harus lebih besar dari 0!' });
      return;
    }

    try {
      setSubmitting(true);
      setAlertMsg(null);

      const cleanName = formData.item_name.trim();

      // Find or match item in database
      let targetItem = itemsList.find(i =>
        (formData.item_id && i.id.toString() === formData.item_id.toString()) ||
        i.item_name.toLowerCase() === cleanName.toLowerCase() ||
        i.sku.toLowerCase() === cleanName.toLowerCase()
      );

      // If item does not exist yet, create it automatically in database
      if (!targetItem) {
        const generatedSku = 'SKU-' + cleanName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) + '-' + Math.floor(100 + Math.random() * 900);
        const createRes = await api.post('/items', {
          sku: generatedSku,
          item_name: cleanName,
          category_id: 1,
          unit_id: 1,
          minimum_stock: 10,
          critical_stock: 5,
          unit_price: parseFloat(formData.unit_price) || 0
        });
        targetItem = createRes.data?.item || createRes.data;
      }

      let finalSupplierId = formData.supplier_id ? parseInt(formData.supplier_id, 10) : (suppliers[0]?.id || 1);

      if (isOtherSupplier && newSupplierName.trim()) {
        const supRes = await api.post('/suppliers', {
          supplier_name: newSupplierName.trim(),
          contact_info: '-',
          address: '-'
        });
        finalSupplierId = supRes.data?.supplier?.id || supRes.data?.id || 1;
      }

      const parsedPrice = parseFloat(formData.unit_price) || 0;

      const payload = {
        po_id: formData.po_id ? parseInt(formData.po_id, 10) : null,
        warehouse_id: parseInt(formData.warehouse_id, 10) || 1,
        supplier_id: finalSupplierId,
        receipt_date: formData.receipt_date,
        notes: formData.notes || (parsedPrice > 0 ? 'Penerimaan barang masuk lengkap dengan harga' : 'Penerimaan barang masuk fisik (menunggu harga Accounting)'),
        attachment_url: formData.attachment_url || 'Dokumentasi Penerimaan Fisik',
        items: [
          {
            item_id: targetItem.id,
            quantity: qty,
            unit_price: parsedPrice
          }
        ]
      };

      await api.post('/goods-receipts', payload);

      setAlertMsg({
        type: 'success',
        text: 'Data barang masuk berhasil disimpan dan stok fisik telah diperbarui!'
      });

      await fetchData();
      handleResetForm();

      setTimeout(() => {
        setViewMode('list');
        setAlertMsg(null);
      }, 1500);

    } catch (err) {
      console.error('Error submit goods receipt:', err);
      let errMsg = err.response?.data?.message || err.message || 'Gagal menyimpan penerimaan barang.';
      setAlertMsg({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      po_id: '',
      receipt_date: new Date().toISOString().split('T')[0],
      item_name: '',
      item_id: '',
      quantity: '',
      unit_name: 'PCS',
      unit_price: '',
      warehouse_id: warehouses[0]?.id?.toString() || '1',
      supplier_id: suppliers[0]?.id?.toString() || '',
      notes: '',
      attachment_url: ''
    });
    setIsOtherUnit(false);
    setIsOtherSupplier(false);
    setNewSupplierName('');
  };

  const handleSelectPO = (poId) => {
    if (!poId) {
      setFormData(prev => ({ ...prev, po_id: '', unit_price: '' }));
      return;
    }
    const selectedPo = purchaseOrders.find(p => p.id.toString() === poId.toString());
    if (selectedPo) {
      const firstItem = selectedPo.items && selectedPo.items[0];
      setFormData(prev => ({
        ...prev,
        po_id: poId,
        supplier_id: selectedPo.supplier_id ? selectedPo.supplier_id.toString() : prev.supplier_id,
        warehouse_id: selectedPo.warehouse_id ? selectedPo.warehouse_id.toString() : prev.warehouse_id,
        item_name: firstItem ? firstItem.item_name : prev.item_name,
        item_id: firstItem && firstItem.item_id ? firstItem.item_id.toString() : prev.item_id,
        quantity: firstItem ? parseFloat(firstItem.quantity).toString() : prev.quantity,
        unit_name: firstItem && firstItem.unit_name ? firstItem.unit_name : prev.unit_name,
        unit_price: firstItem && firstItem.unit_price ? parseFloat(firstItem.unit_price).toString() : prev.unit_price,
        notes: `Penerimaan dari ${selectedPo.po_number}${selectedPo.notes ? ' (' + selectedPo.notes + ')' : ''}`
      }));
    }
  };

  // Render Form View
  if (viewMode === 'form') {
    return (
      <div>
        {/* Page Title Header */}
        <div className="page-header-block">
          <div>
            <h1 className="page-title">Penerimaan Barang (IN)</h1>
            <p className="page-description">Daftarkan barang baru yang masuk ke fasilitas gudang.</p>
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} />
            <span>Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Alert Notification */}
        {alertMsg && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '16px',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '14px',
            backgroundColor: alertMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: alertMsg.type === 'success' ? '#15803d' : '#b91c1c',
            border: `1px solid ${alertMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}>
            {alertMsg.text}
          </div>
        )}

        {/* 2 Column Layout */}
        <div className="form-2col-layout">
          {/* Left Column: Detail Penerimaan Card */}
          <div className="card">
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Detail Penerimaan Fisik Barang</h3>

            <form onSubmit={handleSubmitForm}>
              {/* Optional PO Selector */}
              <div className="form-group-custom" style={{ marginBottom: '16px' }}>
                <label className="form-label-custom">NOMOR PESANAN PEMBELIAN / PO (OPSIONAL)</label>
                <select
                  className="form-input-custom"
                  style={{ width: '100%', cursor: 'pointer', backgroundColor: '#f8fafc', fontWeight: 600 }}
                  value={formData.po_id}
                  onChange={(e) => handleSelectPO(e.target.value)}
                >
                  <option value="">-- Penerimaan Langsung (Tanpa PO) --</option>
                  {purchaseOrders
                    .filter(po => po.status !== 'Diterima' && po.status !== 'Dibatalkan')
                    .map(po => (
                      <option key={po.id} value={po.id}>
                        {po.po_number} - {po.supplier_name} ({po.status || 'Dipesan'})
                      </option>
                    ))}
                </select>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Jika barang berasal dari PO yang sudah diterbitkan, pilih PO di atas agar data terisi otomatis.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label-custom">NAMA BARANG *</label>
                  <div className="form-input-icon-wrapper" style={{ position: 'relative' }}>
                    <Barcode className="form-input-icon" size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none', zIndex: 10 }} />
                    <input
                      type="text"
                      list="items-datalist-options"
                      className="form-input-custom"
                      style={{ paddingLeft: '36px', width: '100%' }}
                      placeholder="Ketik atau pilih nama barang..."
                      value={formData.item_name}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matchedItem = itemsList.find(i => i.item_name === val);
                        setFormData({
                          ...formData,
                          item_name: val,
                          item_id: matchedItem ? matchedItem.id.toString() : '',
                          unit_name: matchedItem && matchedItem.unit_name ? matchedItem.unit_name : formData.unit_name
                        });
                      }}
                      required
                    />
                    <datalist id="items-datalist-options">
                      {itemsList.map(item => (
                        <option key={item.id} value={item.item_name}>
                          Stok: {item.total_stock} {item.unit_name || ''}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="form-label-custom">TANGGAL PENERIMAAN *</label>
                  <input
                    type="date"
                    className="form-input-custom"
                    style={{ width: '100%' }}
                    value={formData.receipt_date}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }} className="form-group-custom">
                <div>
                  <label className="form-label-custom">JUMLAH (QTY) *</label>
                  <input
                    type="number"
                    step="any"
                    className="form-input-custom"
                    placeholder="Contoh: 10"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label-custom">SATUAN *</label>
                  {isOtherUnit ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-input-custom"
                        style={{ flex: 1 }}
                        placeholder="Ketik satuan baru..."
                        value={formData.unit_name}
                        onChange={(e) => setFormData({ ...formData, unit_name: e.target.value })}
                        autoFocus
                      />
                      <button type="button" onClick={() => { setIsOtherUnit(false); setFormData({ ...formData, unit_name: 'PCS' }) }} className="btn-outline-white" style={{ padding: '0 12px' }}>Batal</button>
                    </div>
                  ) : (
                    <select
                      className="form-input-custom"
                      value={formData.unit_name}
                      onChange={(e) => {
                        if (e.target.value === 'Other') {
                          setIsOtherUnit(true);
                          setFormData({ ...formData, unit_name: '' });
                        } else {
                          setFormData({ ...formData, unit_name: e.target.value });
                        }
                      }}
                    >
                      <option value="PCS">PCS - Pieces</option>
                      <option value="KG">KG - Kilogram</option>
                      <option value="Btl">Btl - Botol</option>
                      <option value="Btg">Btg - Batang</option>
                      <option value="Sak">Sak - Sak</option>
                      <option value="Box">Box - Box</option>
                      <option value="Pail">Pail - Pail</option>
                      <option value="Roll">Roll - Roll</option>
                      <option value="Psg">Psg - Pasang</option>
                      <option value="Other">+ Lainnya (Ketik Sendiri)</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Input Harga Satuan (Opsional jika diinput Accounting langsung saat terima barang) */}
              <div className="form-group-custom" style={{ marginBottom: '16px' }}>
                <label className="form-label-custom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>HARGA SATUAN (RP) &mdash; {canInputPrice ? 'OPSIONAL' : 'DIKELOLA OLEH ACCOUNTING'}</span>
                  {canInputPrice && <span style={{ color: '#d97706', fontSize: '11px', fontWeight: 600 }}>Hak Akses Accounting Aktif</span>}
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b', fontSize: '13px' }}>
                    Rp
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    disabled={!canInputPrice}
                    className="form-input-custom"
                    style={{ paddingLeft: '38px', width: '100%', backgroundColor: !canInputPrice ? '#f1f5f9' : '#ffffff' }}
                    placeholder={canInputPrice ? "Ketik harga satuan jika sudah ada faktur..." : "Petugas Gudang: Kosongkan saja, nanti diisi Accounting"}
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Petugas Stock mencatat kuantitas fisik. Admin Accounting dapat menambahkan / mengoreksi harga satuan kapan saja di tabel riwayat.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }} className="form-group-custom">
                <div>
                  <label className="form-label-custom">GUDANG TUJUAN *</label>
                  <div className="form-input-icon-wrapper" style={{ position: 'relative' }}>
                    <Home className="form-input-icon" size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none', zIndex: 10 }} />
                    <select
                      className="form-input-custom"
                      style={{ paddingLeft: '36px', width: '100%', cursor: 'pointer' }}
                      value={formData.warehouse_id}
                      onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                    >
                      {warehouses && warehouses.length > 0 ? (
                        warehouses.map(w => (
                          <option key={w.id} value={w.id.toString()}>
                            {w.warehouse_code}: {w.warehouse_name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="1">WH-DG: Gudang Dangau</option>
                          <option value="2">WH-WH: Gudang White House</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label-custom">SUPPLIER / SUMBER *</label>
                  {isOtherSupplier ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-input-custom"
                        style={{ flex: 1 }}
                        placeholder="Ketik nama supplier baru..."
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                        autoFocus
                      />
                      <button type="button" onClick={() => setIsOtherSupplier(false)} className="btn-outline-white" style={{ padding: '0 12px' }}>Batal</button>
                    </div>
                  ) : (
                    <div className="form-input-icon-wrapper" style={{ position: 'relative' }}>
                      <Truck className="form-input-icon" size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none', zIndex: 10 }} />
                      <select
                        className="form-input-custom"
                        style={{ paddingLeft: '36px', width: '100%', cursor: 'pointer' }}
                        value={formData.supplier_id}
                        onChange={(e) => {
                          if (e.target.value === 'Other') {
                            setIsOtherSupplier(true);
                            setNewSupplierName('');
                          } else {
                            setFormData({ ...formData, supplier_id: e.target.value });
                          }
                        }}
                      >
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id.toString()}>{s.supplier_name}</option>
                        ))}
                        <option value="Other">+ Tambah Supplier Baru</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Catatan / Keterangan */}
              <div className="form-group-custom" style={{ marginBottom: '16px' }}>
                <label className="form-label-custom">CATATAN / NOMOR SURAT JALAN</label>
                <textarea
                  className="form-input-custom"
                  rows="2"
                  style={{ width: '100%' }}
                  placeholder="Nomor surat jalan supplier, kondisi fisik barang, atau catatan lainnya..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                <button type="submit" disabled={submitting} className="btn-dark" style={{ flex: 1 }}>
                  <Save size={16} />
                  <span>{submitting ? 'Menyimpan...' : 'Simpan Penerimaan Barang'}</span>
                </button>
                <button type="button" onClick={() => setViewMode('list')} className="btn-outline-white">
                  Batal
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Riwayat Penerimaan Terbaru Side Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#0f172a" />
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Penerimaan Terbaru</h3>
              </div>
              <button onClick={() => setViewMode('list')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer', fontStyle: 'italic' }}>
                Lihat Semua
              </button>
            </div>

            <div>
              {recentReceiptsSideList.map(item => (
                <div key={item.id} className="recent-list-item">
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>{item.item_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge-wh-pill" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '10px', fontWeight: 700, padding: '2px 6px', marginRight: '8px' }}>
                      {item.wh}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{item.qty}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              Terakhir diperbarui: Baru saja
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render List / Table View
  return (
    <div>
      {/* Page Header */}
      <div className="page-header-block">
        <div>
          <h1 className="page-title">Riwayat Barang Masuk (IN)</h1>
          <p className="page-description">Kelola penerimaan fisik gudang dan pengisian harga satuan oleh Admin Accounting.</p>
        </div>
        <button onClick={() => setViewMode('form')} className="btn-dark">
          <Plus size={16} />
          <span>Tambah Penerimaan</span>
        </button>
      </div>

      {/* Alert Banner Khusus Accounting jika ada barang masuk yang belum ada harganya */}
      {canInputPrice && unpricedCount > 0 && (
        <div style={{
          marginBottom: '18px',
          padding: '16px 20px',
          backgroundColor: '#fffdf5',
          border: '2px solid #0f172a',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)'
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
              <AlertCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#78350f', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                Tugas Accounting: Ada {unpricedCount} transaksi barang masuk yang belum diisi harga!
              </div>
              <div style={{ fontSize: '12.5px', color: '#92400e', marginTop: '2px', fontWeight: 500 }}>
                Barang fisik telah dicatat oleh Petugas Gudang. Silakan klik tombol <strong>"+ Input Harga"</strong> pada tabel untuk melengkapi harga satuan resmi sesuai faktur/bon toko.
              </div>
            </div>
          </div>
          <button
            onClick={() => setFilterPriceStatus(filterPriceStatus === 'UNPRICED' ? 'ALL' : 'UNPRICED')}
            style={{
              padding: '8px 18px',
              background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
              color: '#ffffff',
              border: '2px solid #0f172a',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Filter size={14} />
            <span>{filterPriceStatus === 'UNPRICED' ? 'Tampilkan Semua' : `Lihat Yang Belum Diisi (${unpricedCount})`}</span>
          </button>
        </div>
      )}

      {/* Toolbar Filter */}
      <div className="table-filters-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        <div className="filter-group">
          <label className="filter-label">STATUS HARGA ACCOUNTING</label>
          <select
            className="form-select"
            value={filterPriceStatus}
            onChange={(e) => setFilterPriceStatus(e.target.value)}
            style={{ fontWeight: 600 }}
          >
            <option value="ALL">Semua Status Harga ({tableDataList.length})</option>
            <option value="UNPRICED">Belum Ada Harga ({unpricedCount})</option>
            <option value="PRICED">Sudah Ada Harga ({pricedCount})</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">PEMASOK / SUMBER</label>
          <select
            className="form-select"
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
          >
            <option value="">Semua Pemasok</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.supplier_name}>{s.supplier_name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">DARI TANGGAL</label>
          <input
            type="date"
            className="form-input"
            style={{ width: '100%', paddingLeft: '12px' }}
            value={startDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">SAMPAI TANGGAL</label>
          <input
            type="date"
            className="form-input"
            style={{ width: '100%', paddingLeft: '12px' }}
            value={endDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="filter-group" style={{ gridColumn: 'span 2' }}>
          <label className="filter-label">CARI BARANG / NO. DOKUMEN</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Cari nama barang, nomor dokumen GR, atau pemasok..."
              style={{ width: '100%', paddingLeft: '32px' }}
              value={searchSKU}
              onChange={(e) => setSearchSKU(e.target.value)}
            />
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>TANGGAL</th>
              <th>DITERIMA DI GUDANG</th>
              <th>NAMA BARANG</th>
              <th>JUMLAH</th>
              <th>SUMBER</th>
              <th>HARGA SATUAN</th>
              <th>TOTAL NILAI</th>
              <th>STATUS HARGA</th>
              <th style={{ textAlign: 'center' }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row) => (
              <tr key={row.id}>
                <td style={{ color: '#64748b', fontSize: '12.5px' }}>{row.date}</td>
                <td>
                  <span className="badge-wh-pill">{row.warehouse}</span>
                </td>
                <td style={{ fontWeight: 600, color: '#0f172a' }}>
                  {row.item_name}
                  {row.gr_number && (
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                      {row.gr_number}
                    </div>
                  )}
                </td>
                <td style={{ fontWeight: 700 }}>
                  {row.qty} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>{row.unit}</span>
                </td>
                <td style={{ color: '#475569', fontSize: '12.5px' }}>{row.source}</td>
                <td style={{ fontWeight: 600 }}>
                  {row.unit_price > 0 ? (
                    <span style={{ color: '#0f172a' }}>Rp {row.unit_price.toLocaleString('id-ID')}</span>
                  ) : (
                    <span style={{ color: '#dc2626', fontSize: '12px', fontStyle: 'italic', fontWeight: 600 }}>
                      Belum diisi
                    </span>
                  )}
                </td>
                <td style={{ fontWeight: 700 }}>
                  {row.total_price > 0 ? (
                    <span style={{ color: '#047857' }}>Rp {row.total_price.toLocaleString('id-ID')}</span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>-</span>
                  )}
                </td>
                <td>
                  {row.unit_price > 0 ? (
                    <span style={{
                      backgroundColor: '#dcfce7',
                      color: '#15803d',
                      border: '1px solid #86efac',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <CheckCircle2 size={12} />
                      Terverifikasi
                    </span>
                  ) : (
                    <span style={{
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <AlertCircle size={12} />
                      Wajib Diisi
                    </span>
                  )}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {canInputPrice ? (
                    <button
                      type="button"
                      onClick={() => handleOpenPriceModal(row)}
                      style={{
                        padding: '5px 12px',
                        fontSize: '12px',
                        fontWeight: 700,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        transition: 'all 0.15s ease',
                        border: row.unit_price <= 0 ? '1px solid #b45309' : '1px solid #cbd5e1',
                        backgroundColor: row.unit_price <= 0 ? '#d97706' : '#ffffff',
                        color: row.unit_price <= 0 ? '#ffffff' : '#334155',
                        boxShadow: row.unit_price <= 0 ? '0 2px 6px rgba(217, 119, 6, 0.25)' : 'none'
                      }}
                      title={row.unit_price <= 0 ? 'Input Harga Satuan Resmi (Accounting)' : 'Ubah Harga Satuan Resmi (Accounting)'}
                    >
                      {row.unit_price <= 0 ? (
                        <>
                          <Plus size={13} />
                          <span>Input Harga</span>
                        </>
                      ) : (
                        <>
                          <Edit3 size={13} />
                          <span>Ubah</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
                      {row.unit_price > 0 ? 'Diverifikasi' : 'Menunggu Accounting'}
                    </span>
                  )}
                </td>
              </tr>
            ))}

            {currentRows.length === 0 && (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                  Tidak ada data barang masuk yang sesuai dengan filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredRows.length}
          itemsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* MODAL INPUT / UBAH HARGA SATUAN (KHUSUS ACCOUNTING) */}
      {priceModalOpen && selectedItemForPrice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            border: '1.5px solid #e2e8f0',
            animation: 'fadeIn 0.2s ease'
          }}>
            {/* Header Modal */}
            <div style={{
              padding: '18px 22px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 2px 6px rgba(217, 119, 6, 0.4)'
                }}>
                  <DollarSign size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>
                    {selectedItemForPrice.unit_price > 0 ? 'Edit Harga Barang Masuk' : 'Input Harga Barang Masuk'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '11.5px', color: '#cbd5e1' }}>
                    Verifikasi Resmi Accounting &bull; Dokumen {selectedItemForPrice.gr_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPriceModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
              >
                &times;
              </button>
            </div>

            {/* Body Modal */}
            <div style={{ padding: '22px' }}>
              {/* Rincian Barang */}
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '18px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Nama Barang:</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedItemForPrice.item_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Jumlah Fisik Masuk:</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb' }}>
                    {selectedItemForPrice.qty} {selectedItemForPrice.unit}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Gudang Penerima:</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{selectedItemForPrice.warehouse}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Supplier / Sumber:</span>
                  <span style={{ fontSize: '12px', color: '#334155' }}>{selectedItemForPrice.source}</span>
                </div>
              </div>

              {/* Input Harga Satuan */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                  HARGA SATUAN (RP) SESUAI FAKTUR / NOTA *
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#64748b', fontSize: '14px' }}>
                    Rp
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    autoFocus
                    className="form-input-custom"
                    style={{ paddingLeft: '38px', width: '100%', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}
                    placeholder="Contoh: 17250"
                    value={inputUnitPrice}
                    onChange={(e) => setInputUnitPrice(e.target.value)}
                  />
                </div>

                {/* Tombol Rekomendasi Harga Master */}
                {selectedItemForPrice.master_unit_price > 0 && (
                  <button
                    type="button"
                    onClick={() => setInputUnitPrice(selectedItemForPrice.master_unit_price.toString())}
                    style={{
                      marginTop: '6px',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#b45309',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Gunakan harga katalog terakhir:</span>
                    <strong style={{ textDecoration: 'underline' }}>
                      Rp {selectedItemForPrice.master_unit_price.toLocaleString('id-ID')}
                    </strong>
                  </button>
                )}
              </div>

              {/* Total Kalkulasi Realtime */}
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11.5px', color: '#92400e', fontWeight: 600 }}>Total Nilai Pembelian (Qty &times; Harga):</div>
                  <div style={{ fontSize: '11px', color: '#b45309' }}>
                    {selectedItemForPrice.raw_qty} {selectedItemForPrice.unit} &times; Rp {parseFloat(inputUnitPrice || 0).toLocaleString('id-ID')}
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#92400e' }}>
                  Rp {(selectedItemForPrice.raw_qty * parseFloat(inputUnitPrice || 0)).toLocaleString('id-ID')}
                </div>
              </div>

              {/* Checkbox Perbarui Harga Katalog */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12.5px',
                color: '#334155',
                cursor: 'pointer',
                marginBottom: '20px'
              }}>
                <input
                  type="checkbox"
                  checked={updateMasterPrice}
                  onChange={(e) => setUpdateMasterPrice(e.target.checked)}
                />
                <span>Perbarui harga satuan master barang ini di katalog stok</span>
              </label>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setPriceModalOpen(false)}
                  className="btn-outline-white"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={savingPrice}
                  onClick={handleSavePrice}
                  className="btn-dark"
                  style={{ padding: '8px 20px', fontSize: '13px', backgroundColor: '#d97706', borderColor: '#b45309' }}
                >
                  <Check size={15} />
                  <span>{savingPrice ? 'Menyimpan...' : 'Simpan & Verifikasi Harga'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarangMasuk;
