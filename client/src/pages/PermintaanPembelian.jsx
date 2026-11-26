import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import logoDangau from '../assets/logo-dangau.jpg';
import RejectPRModal from '../components/RejectPRModal';
import {
  AlertTriangle,
  Search,
  SlidersHorizontal,
  Download,
  Send,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Plus,
  Trash2
} from 'lucide-react';

const PermintaanPembelian = () => {
  const navigate = useNavigate();
  const { isMaster, isAdmin, isGudang, selectedWarehouse, globalSearch, setGlobalSearch, triggerTempBadge } = useAuth();
  const [requests, setRequests] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModalItem, setRejectModalItem] = useState(null);

  // Form State (Mendukung Pengajuan Multi-Item)
  const [formWarehouseId, setFormWarehouseId] = useState(selectedWarehouse !== 'ALL' ? selectedWarehouse : '1');
  const [urgency, setUrgency] = useState('Sedang'); // 'Sedang' or 'Urgent'
  const [notes, setNotes] = useState('');
  const [formItems, setFormItems] = useState([
    { id: 1, item_name: '', quantity: '1', unit_name: 'PCS' }
  ]);

  const handleAddFormItem = () => {
    setFormItems(prev => [
      ...prev,
      { id: Date.now() + Math.random(), item_name: '', quantity: '1', unit_name: 'PCS' }
    ]);
  };

  const handleRemoveFormItem = (id) => {
    if (formItems.length <= 1) {
      setFormItems([{ id: Date.now(), item_name: '', quantity: '1', unit_name: 'PCS' }]);
      return;
    }
    setFormItems(prev => prev.filter(i => i.id !== id));
  };

  const handleFormItemChange = (id, field, value) => {
    setFormItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'item_name') {
          const matched = itemsList.find(i => 
            i.item_name.toLowerCase() === value.trim().toLowerCase() ||
            (i.sku && i.sku.toLowerCase() === value.trim().toLowerCase())
          );
          if (matched && matched.unit_name) {
            updated.unit_name = matched.unit_name.toUpperCase();
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const handleSelectCriticalStockItem = (criticalItem) => {
    setFormItems(prev => {
      const hasEmptyFirst = prev.length === 1 && !prev[0].item_name.trim();
      const matched = itemsList.find(i => i.id === criticalItem.id || i.item_name.toLowerCase() === criticalItem.name.toLowerCase());
      const unitVal = matched?.unit_name?.toUpperCase() || 'PCS';
      if (hasEmptyFirst) {
        return [{
          id: prev[0].id,
          item_name: criticalItem.name,
          quantity: '1',
          unit_name: unitVal
        }];
      }
      if (prev.some(i => i.item_name.toLowerCase() === criticalItem.name.toLowerCase())) {
        return prev;
      }
      return [
        ...prev,
        {
          id: Date.now() + Math.random(),
          item_name: criticalItem.name,
          quantity: '1',
          unit_name: unitVal
        }
      ];
    });
  };

  // Table search (Local search so it is not masked by global search)
  const [tableSearch, setTableSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const whParam = selectedWarehouse !== 'ALL' ? `?warehouse_id=${selectedWarehouse}` : '';
      const [prRes, itemsRes] = await Promise.all([
        api.get(`/purchase-requests${whParam}`),
        api.get('/items')
      ]);
      setRequests(prRes.data || []);
      setItemsList(itemsRes.data || []);
    } catch (err) {
      console.error('Error loading purchase requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedWarehouse !== 'ALL') {
      setFormWarehouseId(selectedWarehouse);
    }
    fetchData();
  }, [selectedWarehouse]);

  // Critical Stock items mapping
  const lowStockItems = itemsList.filter(i => parseFloat(i.total_stock || 0) <= parseFloat(i.minimum_stock || 10));

  const criticalStockItems = lowStockItems.length > 0
    ? lowStockItems.slice(0, 4).map(i => ({
        id: i.id,
        name: i.item_name,
        qty: `${i.total_stock} / ${i.unit_name || 'PCS'}`,
        min: i.minimum_stock
      }))
    : [
        { id: 1, name: 'Pelumas Industri 5L', qty: '2 / BTL', min: 15 },
        { id: 2, name: 'Sarung Tangan Kerja Berat', qty: '5 / PRS', min: 50 },
        { id: 3, name: 'Gulungan Lakban Kemasan', qty: '12 / RLL', min: 100 },
      ];

  // History Requests Mapping
  const defaultHistoryList = [
    { id: 1, req_id: '#RQ-1042', date: '24 Oct 2023', item_name: 'Industrial Lubricant 5L', qty: '20 BTL', status: 'Menunggu' },
    { id: 2, req_id: '#RQ-1041', date: '23 Oct 2023', item_name: 'Heavy Duty Work Gloves', qty: '100 PRS', status: 'Disetujui' },
    { id: 3, req_id: '#RQ-1040', date: '22 Oct 2023', item_name: 'Cardboard Boxes L', qty: '500 PCS', status: 'Dipenuhi' },
  ];

  const historyList = requests.length > 0
    ? requests.map(pr => {
        const items = pr.items || [];
        const firstItem = items[0] || {};
        return {
          id: pr.id,
          raw_pr: pr,
          req_id: pr.pr_number || `#RQ-${pr.id}`,
          date: new Date(pr.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
          items: items,
          items_count: items.length,
          item_name: items.length > 1 
            ? `${firstItem.item_name || 'Barang'} (+${items.length - 1} barang lainnya)` 
            : (firstItem.item_name || 'Barang Persediaan'),
          qty: items.length > 1
            ? `${items.length} Jenis Barang`
            : (firstItem.quantity ? `${parseFloat(firstItem.quantity)} ${firstItem.unit_name || 'PCS'}` : '1 PCS'),
          urgency: firstItem.urgency || 'Sedang',
          warehouse_code: pr.warehouse_code || (pr.warehouse_id === 2 ? 'WH-WH' : 'WH-DG'),
          warehouse_name: pr.warehouse_name || (pr.warehouse_id === 2 ? 'Gudang White House' : 'Gudang Dangau'),
          requester: pr.requester_name || 'Petugas Gudang',
          notes: pr.notes,
          status: pr.status === 'Disetujui' ? 'Disetujui' : pr.status === 'Ditolak' ? 'Ditolak' : pr.status === 'Dipenuhi' ? 'Dipenuhi' : 'Menunggu'
        };
      })
    : [];

  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'Menunggu').length;
  const approvedCount = requests.filter(r => r.status === 'Disetujui').length;
  const otherCount = requests.filter(r => r.status !== 'Menunggu' && r.status !== 'Disetujui').length;

  const filteredHistory = historyList.filter(item =>
    !tableSearch ||
    item.item_name.toLowerCase().includes(tableSearch.toLowerCase()) ||
    item.req_id.toLowerCase().includes(tableSearch.toLowerCase()) ||
    (item.items && item.items.some(it => it.item_name && it.item_name.toLowerCase().includes(tableSearch.toLowerCase()))) ||
    (item.warehouse_code && item.warehouse_code.toLowerCase().includes(tableSearch.toLowerCase())) ||
    (item.notes && item.notes.toLowerCase().includes(tableSearch.toLowerCase()))
  );

  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState(null);

  const handleSubmitNewPR = async (e) => {
    e.preventDefault();

    const validItems = formItems.filter(i => i.item_name && i.item_name.trim() !== '' && parseFloat(i.quantity) > 0);

    if (validItems.length === 0) {
      setAlertMsg({ type: 'error', text: 'Masukkan minimal 1 barang dengan nama dan jumlah yang valid!' });
      return;
    }

    try {
      setSubmitting(true);
      setAlertMsg(null);

      const itemsPayload = [];

      for (const item of validItems) {
        const cleanName = item.item_name.trim();
        const quantityNum = parseFloat(item.quantity);

        // Find or match item in database
        let targetItem = itemsList.find(i =>
          i.item_name.toLowerCase() === cleanName.toLowerCase() ||
          (i.sku && i.sku.toLowerCase() === cleanName.toLowerCase())
        );

        // If item does not exist, create it automatically in database
        if (!targetItem) {
          const generatedSku = 'SKU-' + cleanName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) + '-' + Math.floor(100 + Math.random() * 900);
          const createRes = await api.post('/items', {
            sku: generatedSku,
            item_name: cleanName,
            category_id: 1,
            unit_id: 1,
            minimum_stock: 10,
            critical_stock: 5,
            unit_price: 0
          });
          targetItem = createRes.data?.item || createRes.data;
        }

        itemsPayload.push({
          item_id: targetItem.id,
          quantity: quantityNum,
          urgency: urgency
        });
      }

      const payload = {
        warehouse_id: parseInt(formWarehouseId, 10) || 1,
        notes: notes || `Pengadaan ${itemsPayload.length} barang persediaan (Prioritas: ${urgency})`,
        items: itemsPayload
      };

      await api.post('/purchase-requests', payload);

      setAlertMsg({ type: 'success', text: `Pengajuan Permintaan Pembelian (${itemsPayload.length} barang) berhasil dikirim dan tersimpan di sistem!` });

      if (triggerTempBadge) triggerTempBadge('1', 5000);

      setFormItems([{ id: Date.now(), item_name: '', quantity: '1', unit_name: 'PCS' }]);
      setUrgency('Sedang');
      setNotes('');
      await fetchData();

      setTimeout(() => setAlertMsg(null), 3500);
    } catch (err) {
      console.error('Submit PR error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal mengajukan permintaan pembelian.';
      setAlertMsg({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovePR = async (rowItem) => {
    try {
      setLoading(true);
      const prId = typeof rowItem === 'object' ? rowItem.id : rowItem;
      const prNumber = typeof rowItem === 'object' ? (rowItem.req_id || rowItem.raw_pr?.pr_number) : '';
      const res = await api.put(`/purchase-requests/${prId}/approve`);
      if (triggerTempBadge) triggerTempBadge('1', 5000);
      const prObj = typeof rowItem === 'object' ? (rowItem.raw_pr || requests.find(r => r.id === prId) || {}) : (requests.find(r => r.id === prId) || {});
      // Otomatis navigasi ke Form Pesanan Pembelian
      navigate('/pesanan-pembelian', {
        state: {
          fromPR: true,
          pr_id: prId,
          pr_number: prNumber || prObj.pr_number,
          warehouse_id: prObj.warehouse_id,
          warehouse_name: prObj.warehouse_name || rowItem.warehouse_name,
          notes: prObj.notes || rowItem.notes,
          items: prObj.items,
          po_number: res.data?.po_number,
          po_id: res.data?.po_id
        }
      });
    } catch (err) {
      console.error('Approve PR error:', err);
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Gagal menyetujui permintaan.' });
      setTimeout(() => setAlertMsg(null), 3500);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectPR = async (prId, prNumber) => {
    try {
      setLoading(true);
      await api.put(`/purchase-requests/${prId}/reject`);
      setAlertMsg({ type: 'success', text: `Permintaan ${prNumber} ditolak.` });
      await fetchData();
    } catch (err) {
      console.error('Reject PR error:', err);
      setAlertMsg({ type: 'error', text: err.response?.data?.message || 'Gagal menolak permintaan.' });
    } finally {
      setLoading(false);
      setTimeout(() => setAlertMsg(null), 3500);
    }
  };

  return (
    <div>
      {/* Page Title Section with Official Dangau Hotel Kubu Raya Logo */}
      <div style={{
        background: '#ffffff',
        border: '2px solid #0f172a',
        borderRadius: '14px',
        padding: '18px 24px',
        marginBottom: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          {/* Logo Dangau */}
          <div style={{
            background: '#0a0907',
            padding: '6px 14px',
            borderRadius: '10px',
            border: '2px solid #b8860b',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <img
              src={logoDangau}
              alt="Dangau Hotel - Kubu Raya"
              style={{
                height: '42px',
                objectFit: 'contain'
              }}
            />
          </div>

          <div style={{ height: '44px', width: '2px', background: 'linear-gradient(180deg, #b8860b, #d4af37)' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '3px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                Permintaan Pembelian (PR)
              </h1>
              <span style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '6px',
                border: '1.5px solid #8c6208',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <span>Restock & Pengadaan</span>
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', margin: 0, fontWeight: 500 }}>
              Kelola, setujui, dan ajukan permintaan restock kebutuhan Dangau Hotel & Resorts dengan cepat dan teratur.
            </p>
          </div>
        </div>

        {/* Right side warehouse indicator badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: '#ffffff',
            border: '2px solid #0f172a',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 800,
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#b8860b', display: 'inline-block' }}></span>
            <span>{selectedWarehouse === 'ALL' ? 'Semua Fasilitas Gudang' : selectedWarehouse === '1' ? 'Gudang Dangau' : 'Gudang White House'}</span>
          </div>
        </div>
      </div>

      {/* Alert Notification */}
      {alertMsg && (
        <div style={{
          padding: '12px 18px',
          marginBottom: '20px',
          borderRadius: '10px',
          fontWeight: 700,
          fontSize: '13.5px',
          backgroundColor: alertMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: alertMsg.type === 'success' ? '#15803d' : '#b91c1c',
          border: `2px solid ${alertMsg.type === 'success' ? '#15803d' : '#dc2626'}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{alertMsg.type === 'success' ? <Check size={16} color="#15803d" /> : <AlertTriangle size={16} color="#b91c1c" />}</span>
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* 4 Stat Summary Cards for Master Report View */}
      {isMaster && (
        <div className="pr-metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '22px' }}>
          <div className="card" style={{ padding: '16px 20px', border: '2px solid #0f172a', borderRadius: '14px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ fontSize: '11.5px', color: '#0f172a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Pengajuan PR</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '6px' }}>
              {totalCount} <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>dokumen</span>
            </div>
          </div>
          <div className="card" style={{ padding: '16px 20px', border: '2px solid #0f172a', borderRadius: '14px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ fontSize: '11.5px', color: '#b45309', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Menunggu Review</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#b45309', marginTop: '6px' }}>
              {pendingCount} <span style={{ fontSize: '12px', fontWeight: 600, color: '#b45309' }}>dokumen</span>
            </div>
          </div>
          <div className="card" style={{ padding: '16px 20px', border: '2px solid #0f172a', borderRadius: '14px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Disetujui</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#15803d', marginTop: '6px' }}>
              {approvedCount} <span style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>dokumen</span>
            </div>
          </div>
          <div className="card" style={{ padding: '16px 20px', border: '2px solid #0f172a', borderRadius: '14px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ fontSize: '11.5px', color: '#475569', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ditolak / Selesai</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#475569', marginTop: '6px' }}>
              {otherCount} <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>dokumen</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Container */}
      <div className="pr-main-grid" style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '22px', alignItems: 'start' }}>
        {/* Left Side: 2 Cards (Tingkat Stok Kritis & Permintaan Baru) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card 1: Tingkat Stok Kritis / Stok Menipis */}
          <div style={{
            background: '#ffffff',
            border: '2px solid #0f172a',
            borderRadius: '14px',
            padding: '20px',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #fef3c7 0%, #faeed1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #b8860b'
                }}>
                  <AlertTriangle size={17} color="#b8860b" />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Stok Menipis</h3>
              </div>
              <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 800, background: '#fee2e2', padding: '3px 10px', borderRadius: '6px', border: '1px solid #fecaca', textTransform: 'uppercase' }}>
                Perlu Restock
              </span>
            </div>

            <p style={{ fontSize: '12px', color: '#475569', marginBottom: '12px', fontWeight: 600 }}>
              Petunjuk: Klik item di bawah ini untuk otomatis mengisi formulir pengajuan:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {criticalStockItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectCriticalStockItem(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    border: '1.5px solid #0f172a',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.borderColor = '#b8860b';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(184, 134, 11, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#0f172a';
                    e.currentTarget.style.boxShadow = '0 2px 6px rgba(15, 23, 42, 0.04)';
                  }}
                  title="Klik untuk menambahkan barang ini ke daftar pengajuan"
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Batas Minimal: {item.min}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontWeight: 800,
                      fontSize: '12.5px',
                      color: '#ffffff',
                      background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
                      border: '1px solid #8c6208',
                      padding: '3px 10px',
                      borderRadius: '6px'
                    }}>
                      {item.qty}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Permintaan Baru Form */}
          <div style={{
            background: '#ffffff',
            border: '2px solid #0f172a',
            borderRadius: '14px',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 3px 8px rgba(184, 134, 11, 0.25)'
              }}>
                <Send size={15} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#2c2212', margin: 0 }}>Form Pengajuan Baru</h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: '1.5px solid #d4af37',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {formItems.length} Item
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitNewPR}>
              {/* 1. Gudang Tujuan */}
              <div className="form-group-custom" style={{ marginBottom: '14px' }}>
                <label className="form-label-custom" style={{ color: '#475569', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.03em', marginBottom: '6px', display: 'block' }}>
                  Gudang Tujuan *
                </label>
                <select
                  value={formWarehouseId}
                  onChange={(e) => setFormWarehouseId(e.target.value)}
                  className="form-input-custom"
                  style={{ border: '1.5px solid #0f172a', background: '#f8fafc', borderRadius: '10px', width: '100%', fontSize: '13px', fontWeight: 700, padding: '9px 12px' }}
                >
                  <option value="1">Gudang Utama (Dangau Kubu Raya - WH-DG)</option>
                  <option value="2">Gudang White House (WH-WH)</option>
                </select>
              </div>

              {/* 2. Daftar Barang yang Diajukan (Multi-Item) */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label className="form-label-custom" style={{ color: '#475569', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.03em', margin: 0 }}>
                    Daftar Barang yang Diajukan ({formItems.length} Barang) *
                  </label>
                  <span style={{ fontSize: '11px', color: '#b8860b', fontWeight: 700 }}>
                    Bisa ajukan &gt;1 barang
                  </span>
                </div>

                {formItems.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      marginBottom: '10px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a' }}>
                        Barang #{idx + 1}
                      </span>
                      {formItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFormItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 4px'
                          }}
                          title="Hapus baris barang ini"
                        >
                          <Trash2 size={13} />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>

                    {/* Nama Barang */}
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                        <input
                          type="text"
                          list="pr-items-datalist-options"
                          className="form-input-custom"
                          style={{ paddingLeft: '32px', width: '100%', border: '1.5px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                          placeholder="Ketik atau pilih nama barang..."
                          value={item.item_name}
                          onChange={(e) => handleFormItemChange(item.id, 'item_name', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Qty & Satuan */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <input
                          type="number"
                          min="0.1"
                          step="any"
                          className="form-input-custom"
                          style={{ border: '1.5px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', width: '100%', fontSize: '13px', fontWeight: 700, textAlign: 'center', padding: '6px' }}
                          placeholder="Jumlah (Qty)"
                          value={item.quantity}
                          onChange={(e) => handleFormItemChange(item.id, 'quantity', e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <select
                          className="form-input-custom"
                          style={{ border: '1.5px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', width: '100%', fontSize: '13px', fontWeight: 600, cursor: 'pointer', padding: '6px 8px' }}
                          value={item.unit_name}
                          onChange={(e) => handleFormItemChange(item.id, 'unit_name', e.target.value)}
                        >
                          <option value="PCS">PCS</option>
                          <option value="KG">KG</option>
                          <option value="BTL">BTL</option>
                          <option value="PRS">PRS</option>
                          <option value="RLL">RLL</option>
                          <option value="UNIT">UNIT</option>
                          <option value="DUS">DUS</option>
                          <option value="BOX">BOX</option>
                          <option value="SAK">SAK</option>
                          <option value="BTG">BTG</option>
                          <option value="PAIL">PAIL</option>
                          <option value="PACK">PACK</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Tombol Tambah Barang Lagi */}
                <button
                  type="button"
                  onClick={handleAddFormItem}
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    border: '1.5px dashed #0f172a',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = '#fef9ed'; e.currentTarget.style.borderColor = '#b8860b'; }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#0f172a'; }}
                >
                  <Plus size={14} color="#b8860b" strokeWidth={2.5} />
                  <span>+ Tambah Barang Lagi</span>
                </button>
              </div>

              {/* Datalist Barang */}
              <datalist id="pr-items-datalist-options">
                {itemsList.map(item => (
                  <option key={item.id} value={item.item_name}>
                    Stok: {item.total_stock || 0} {item.unit_name || 'PCS'}
                  </option>
                ))}
              </datalist>

              {/* 3. Catatan Kebutuhan */}
              <div className="form-group-custom" style={{ marginBottom: '14px' }}>
                <label className="form-label-custom" style={{ color: '#475569', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.03em', marginBottom: '6px', display: 'block' }}>
                  Catatan / Keterangan Kebutuhan
                </label>
                <textarea
                  className="form-input-custom"
                  style={{ border: '1.5px solid #cbd5e1', background: '#f8fafc', borderRadius: '10px', width: '100%', fontSize: '13px', padding: '8px 10px', minHeight: '60px', outline: 'none', resize: 'vertical' }}
                  placeholder="Contoh: Kebutuhan operasional mendesak minggu ini..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* 4. Jenis Prioritas */}
              <div className="form-group-custom" style={{ marginBottom: '20px' }}>
                <label className="form-label-custom" style={{ color: '#475569', fontWeight: 700, fontSize: '11.5px', letterSpacing: '0.03em', marginBottom: '6px', display: 'block' }}>
                  Jenis Prioritas *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setUrgency('Sedang')}
                    style={{
                      border: urgency === 'Sedang' ? '2px solid #b8860b' : '1.5px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      backgroundColor: urgency === 'Sedang' ? '#fef9ed' : '#ffffff',
                      color: urgency === 'Sedang' ? '#92400e' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                      boxShadow: urgency === 'Sedang' ? '0 2px 8px rgba(184, 134, 11, 0.15)' : 'none'
                    }}
                  >
                    <span>Sedang</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency('Urgent')}
                    style={{
                      border: urgency === 'Urgent' ? '2px solid #dc2626' : '1.5px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      backgroundColor: urgency === 'Urgent' ? '#fef2f2' : '#ffffff',
                      color: urgency === 'Urgent' ? '#b91c1c' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease',
                      boxShadow: urgency === 'Urgent' ? '0 2px 8px rgba(220, 38, 38, 0.15)' : 'none'
                    }}
                  >
                    <span>Urgent</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px 18px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(184, 134, 11, 0.28)',
                  transition: 'all 0.15s ease'
                }}
              >
                <Send size={15} />
                <span>
                  {submitting ? 'Mengirim...' : `Kirim Pengajuan Permintaan (${formItems.filter(i => i.item_name.trim()).length || 1} Barang)`}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Riwayat Permintaan Card */}
        <div style={{
          background: '#ffffff',
          border: '2px solid #0f172a',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)'
        }}>
          <div style={{
            padding: '18px 22px',
            borderBottom: '2.5px solid #d4af37',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            background: '#0f172a'
          }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '0.02em' }}>
                Riwayat Permintaan Restock
              </h3>
              <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '3px 0 0 0', fontWeight: 500 }}>
                Daftar pengajuan restock dan persetujuan barang terkini
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '200px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Cari permintaan..."
                  style={{
                    width: '100%',
                    paddingLeft: '32px',
                    fontSize: '12.5px',
                    borderRadius: '8px',
                    border: '2px solid #cbd5e1',
                    background: '#ffffff',
                    fontWeight: 600,
                    color: '#0f172a'
                  }}
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                />
                <SlidersHorizontal size={14} style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#b8860b' }} />
              </div>

              <button
                className="btn btn-secondary"
                style={{
                  padding: '7px 14px',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '8px',
                  fontWeight: 800
                }}
              >
                <Download size={14} />
                <span>Ekspor</span>
              </button>
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>REQ ID</th>
                <th>TANGGAL</th>
                <th>GUDANG</th>
                <th>NAMA BARANG</th>
                <th>JUMLAH</th>
                <th>PRIORITAS</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'center' }}>TINDAKAN</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map(row => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 700, color: '#b8860b', fontSize: '12.5px' }}>{row.req_id}</td>
                  <td style={{ color: '#7a6b52', fontSize: '12.5px' }}>{row.date}</td>
                  <td>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '2px 7px', borderRadius: '4px' }}>
                      {row.warehouse_code || 'WH-DG'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#1e293b' }}>
                    {row.items && row.items.length > 1 ? (
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {row.items[0].item_name} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>({parseFloat(row.items[0].quantity)} {row.items[0].unit_name || 'PCS'})</span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                          {row.items.slice(1).map((it, idx) => (
                            <span key={idx} style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              color: '#334155'
                            }}>
                              +{it.item_name} ({parseFloat(it.quantity)} {it.unit_name || 'PCS'})
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span>{row.item_name}</span>
                    )}
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#5c451a', backgroundColor: '#fcf6e8', border: '1px solid #ebd9b0', padding: '3px 8px', borderRadius: '6px' }}>
                      {row.qty}
                    </span>
                  </td>
                  <td>
                    {row.urgency === 'Urgent' || row.urgency === 'Tinggi' ? (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#b91c1c', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Urgent
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', backgroundColor: '#fef9ed', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Sedang
                      </span>
                    )}
                  </td>
                  <td>
                    {row.status === 'Menunggu' ? (
                      <span className="badge-status" style={{ backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706', display: 'inline-block' }}></span>
                        Menunggu
                      </span>
                    ) : row.status === 'Disetujui' ? (
                      <span className="badge-status" style={{ backgroundColor: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }}></span>
                        Disetujui
                      </span>
                    ) : row.status === 'Ditolak' ? (
                      <span className="badge-status" style={{ backgroundColor: '#ffe4e6', color: '#e11d48', border: '1px solid #fecdd3' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#e11d48', display: 'inline-block' }}></span>
                        Ditolak
                      </span>
                    ) : (
                      <span className="badge-status" style={{ backgroundColor: '#fef9ed', color: '#9a7322', border: '1px solid #ebd090' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#b8860b', display: 'inline-block' }}></span>
                        Dipenuhi
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {row.status === 'Menunggu' && (isAdmin || isMaster) ? (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleApprovePR(row)}
                          style={{
                            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
                            color: '#15803d',
                            border: '1px solid #86efac',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '11px',
                            fontWeight: 700,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                          title="Setujui dan buka Form Pesanan Pembelian"
                        >
                          <Check size={12} />
                          <span>Setujui</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const fullPr = requests.find(r => r.id === row.id) || row;
                            setRejectModalItem({
                              ...fullPr,
                              id: row.id,
                              pr_number: row.req_id,
                              role: row.requester || fullPr.requester_name || 'Petugas Gudang',
                              requester_phone: fullPr.requester_phone || '+62 812-5509-8112',
                              warehouse_name: row.warehouse_name || fullPr.warehouse_name,
                              date: row.date,
                              items: fullPr.items || [{ item_name: row.item_name, quantity: row.qty }]
                            });
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                            color: '#be123c',
                            border: '1px solid #fca5a5',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '11px',
                            fontWeight: 700,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                          title="Tolak Permintaan & Kirim Pesan WhatsApp"
                        >
                          <X size={12} />
                          <span>Tolak</span>
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: '11.5px', color: '#78716c', fontWeight: 500 }}>
                        {row.status === 'Menunggu' ? 'Menunggu Review' : 'Selesai'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-bar" style={{ borderTop: '1px solid #ebd9b0', padding: '14px 20px', background: '#fdfbf7' }}>
            <div style={{ color: '#7a684b', fontSize: '12px' }}>Menampilkan 1–{filteredHistory.length} dari {requests.length > 0 ? requests.length : 42} permintaan</div>
            <div className="pagination-pages">
              <button
                className="page-num"
                style={{ border: '1px solid #ecd8ad', background: '#ffffff', color: '#7a5a15' }}
                title="Halaman sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="page-num active" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)', color: '#ffffff', border: 'none' }}>1</div>
              <div className="page-num" style={{ border: '1px solid #ecd8ad', background: '#ffffff', color: '#7a5a15' }}>2</div>
              <div className="page-num" style={{ border: '1px solid #ecd8ad', background: '#ffffff', color: '#7a5a15' }}>3</div>
              <button
                className="page-num"
                style={{ border: '1px solid #ecd8ad', background: '#ffffff', color: '#7a5a15' }}
                title="Halaman berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Penolakan PR & Kirim Pesan WhatsApp */}
      <RejectPRModal
        isOpen={Boolean(rejectModalItem)}
        onClose={() => setRejectModalItem(null)}
        prItem={rejectModalItem}
        onSuccess={({ prNum, sentWa, phone }) => {
          setAlertMsg({ 
            type: 'success', 
            text: `Permintaan ${prNum} ditolak${sentWa ? ` & WhatsApp ke ${phone} dibuka` : ''}.` 
          });
          fetchData();
          setTimeout(() => setAlertMsg(null), 4000);
        }}
      />
    </div>
  );
};

export default PermintaanPembelian;
