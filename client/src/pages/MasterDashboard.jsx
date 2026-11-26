import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  FileText, 
  Check, 
  X, 
  AlertTriangle, 
  Clock, 
  Package, 
  LogIn, 
  LogOut as LogOutIcon, 
  ArrowRight, 
  ShieldAlert, 
  AlertCircle,
  Eye,
  Search,
  SlidersHorizontal,
  Printer,
  Boxes
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MasterPrintReportModal from '../components/MasterPrintReportModal';
import RejectPRModal from '../components/RejectPRModal';

const MasterDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isMaster, isAdmin, isGudang, selectedWarehouse, globalSearch, triggerTempBadge, canAccess } = useAuth();
  const isPetugasStock = isGudang || user?.role_name === 'Petugas Gudang' || user?.role_name === 'Petugas Stock';

  // Master Official Print Report Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Review Modal & Reject Modal State
  const [reviewModalItem, setReviewModalItem] = useState(null);
  const [rejectModalItem, setRejectModalItem] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [stockTab, setStockTab] = useState('emergency'); // 'emergency', 'expiring', 'low'
  const [adminPrTab, setAdminPrTab] = useState('pending'); // 'pending' or 'all'

  // Master Inventory List State
  const [inventoryList, setInventoryList] = useState([]);
  const [invCategoryFilter, setInvCategoryFilter] = useState('ALL');
  const [invStatusFilter, setInvStatusFilter] = useState('ALL');
  const [invWarehouseFilter, setInvWarehouseFilter] = useState('ALL');
  const [invSearchQuery, setInvSearchQuery] = useState('');
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = selectedWarehouse && selectedWarehouse !== 'ALL' ? { warehouse_id: selectedWarehouse } : {};
      const [dashRes, invRes] = await Promise.all([
        api.get('/dashboard/master', { params }),
        api.get('/inventory', { params })
      ]);
      setData(dashRes.data);
      if (Array.isArray(invRes.data)) {
        setInventoryList(invRes.data);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedWarehouse]);

  // Handle Approve Action for PR (Menyetujui PR & Otomatis Membuka Form Pesanan Pembelian)
  const handleApprovePR = async (prItem) => {
    try {
      const prId = typeof prItem === 'object' ? prItem.id : prItem;
      const prNumber = typeof prItem === 'object' ? prItem.pr_number : '';
      const res = await api.put(`/purchase-requests/${prId}/approve`);
      if (triggerTempBadge) {
        triggerTempBadge('1', 5000);
      }
      if (reviewModalItem && reviewModalItem.id === prId) {
        setReviewModalItem(null);
      }
      const prData = typeof prItem === 'object' ? prItem : (filteredPendingList.find(p => p.id === prId) || {});
      // Otomatis navigasi ke Form Pesanan Pembelian dengan membawa data pengajuan PR
      navigate('/pesanan-pembelian', {
        state: {
          fromPR: true,
          pr_id: prId,
          pr_number: prNumber || prData.pr_number,
          warehouse_id: prData.warehouse_id,
          warehouse_name: prData.warehouse_name,
          notes: prData.notes,
          items: prData.items,
          po_number: res.data?.po_number,
          po_id: res.data?.po_id
        }
      });
    } catch (err) {
      console.error('Approve PR error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menyetujui permintaan.';
      setToastMsg(`Gagal: ${errMsg}`);
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  // Handle Reject Action for PR
  const handleRejectPR = async (prId, prNumber) => {
    try {
      await api.put(`/purchase-requests/${prId}/reject`);
      setToastMsg(`Permintaan ${prNumber || ''} Ditolak`);
      if (reviewModalItem && reviewModalItem.id === prId) {
        setReviewModalItem(null);
      }
      await fetchDashboardData();
    } catch (err) {
      console.error('Reject PR error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Gagal menolak permintaan.';
      setToastMsg(`Gagal: ${errMsg}`);
    } finally {
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  // Open Review Detail Modal
  const handleOpenReviewModal = (item) => {
    setReviewModalItem(item);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
        Memuat Dasbor Inventori Dangau...
      </div>
    );
  }

  // Extract warehouse totals from DB data
  const whDangau = data?.warehouses_summary?.find((w) => w.warehouse_code === 'WH-DG' || w.warehouse_name.toLowerCase().includes('dangau')) || { total_value: 0, total_units: 0 };
  const whWhiteHouse = data?.warehouses_summary?.find((w) => w.warehouse_code === 'WH-WH' || w.warehouse_name.toLowerCase().includes('white')) || { total_value: 0, total_units: 0 };

  const whDangauValue = parseFloat(whDangau.total_value || 0);
  const whDangauUnits = parseFloat(whDangau.total_units || 0);

  const whWhiteHouseValue = parseFloat(whWhiteHouse.total_value || 0);
  const whWhiteHouseUnits = parseFloat(whWhiteHouse.total_units || 0);

  // Backward compatibility aliases
  const whWarungDangauValue = whDangauValue;
  const whWarungDangauUnits = whDangauUnits;

  // Synchronized Purchase Orders from DB
  const defaultRecentOrders = [
    { id: 1, po_number: 'PO-2026-0891', supplier_name: 'Distributor Utama F&B', date: '31 Agu 2026', amount: 8200000.00, status: 'Terkirim' },
    { id: 2, po_number: 'PO-2026-0890', supplier_name: 'PT Mitra Bangunan Abadi', date: '2 Sep 2026', amount: 12450000.00, status: 'Diproses' },
  ];

  const recentOrdersList = data?.recent_orders?.length > 0
    ? data.recent_orders.map((po) => ({
        id: po.id,
        po_number: po.po_number,
        supplier_name: po.supplier_name,
        date: new Date(po.po_date || po.created_at || Date.now()).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: parseFloat(po.total_amount || 0),
        status: po.status === 'Diterima' ? 'Terkirim' : 'Diproses'
      }))
    : defaultRecentOrders;

  // Synchronized Pending PR Approvals from DB
  const defaultPendingApprovals = [
    {
      id: 1,
      pr_number: 'PR-2026-001',
      date: '28-08-2026',
      priority: 'Tinggi',
      role: 'Petugas Gudang',
      warehouse_name: 'White House',
      notes: 'Restok darurat bahan pokok harian',
      items: [
        { item_name: 'Pelumas Industri 5L', sku: 'PRD-8820-WHT', quantity: '20', unit_name: 'BTL', urgency: 'Tinggi' },
        { item_name: 'Sarung Tangan Kerja', sku: 'PRD-8821-WHT', quantity: '50', unit_name: 'PRS', urgency: 'Sedang' }
      ]
    },
    {
      id: 2,
      pr_number: 'PR-2026-002',
      date: '28-08-2026',
      priority: 'Sedang',
      role: 'Petugas Gudang',
      warehouse_name: 'Warung Dangau',
      notes: 'Pengajuan rutin persediaan bulanan',
      items: [
        { item_name: 'Kabel Supreme NYM 3x2.5mm', sku: 'PRD-9901-DNG', quantity: '10', unit_name: 'Roll', urgency: 'Sedang' }
      ]
    },
  ];

  const pendingList = Array.isArray(data?.pending_requests)
    ? data.pending_requests.map((pr) => {
        const hasTinggi = pr.items && pr.items.some(i => i.urgency === 'Tinggi');
        const firstUrgency = pr.items && pr.items[0] ? pr.items[0].urgency : null;
        return {
          id: pr.id,
          pr_number: pr.pr_number,
          date: new Date(pr.created_at || Date.now()).toLocaleDateString('id-ID'),
          priority: hasTinggi ? 'Tinggi' : (firstUrgency || 'Sedang'),
          role: pr.requester_name || 'Petugas Gudang',
          requester_phone: pr.requester_phone || '+62 812-5509-8112',
          warehouse_name: pr.warehouse_name || 'Gudang Dangau',
          notes: pr.notes || 'Pengajuan barang persediaan',
          rejection_reason: pr.rejection_reason || '',
          items: pr.items || []
        };
      })
    : defaultPendingApprovals;

  const qSearch = (globalSearch || '').toLowerCase();

  const filteredRecentOrders = recentOrdersList.filter(po => {
    if (!qSearch) return true;
    return (
      ((po.po_number || '').toLowerCase().includes(qSearch)) ||
      ((po.supplier_name || '').toLowerCase().includes(qSearch))
    );
  });

  const filteredPendingList = pendingList.filter(pr => {
    if (!qSearch) return true;
    return (
      ((pr.pr_number || '').toLowerCase().includes(qSearch)) ||
      ((pr.role || '').toLowerCase().includes(qSearch))
    );
  });

  // All recent PR requests for Admin/Master history view
  const allRequestsList = Array.isArray(data?.all_requests)
    ? data.all_requests.map((pr) => {
        const hasTinggi = pr.items && pr.items.some(i => i.urgency === 'Tinggi');
        const firstUrgency = pr.items && pr.items[0] ? pr.items[0].urgency : null;
        return {
          id: pr.id,
          pr_number: pr.pr_number,
          date: new Date(pr.created_at || Date.now()).toLocaleDateString('id-ID'),
          priority: hasTinggi ? 'Tinggi' : (firstUrgency || 'Sedang'),
          role: pr.requester_name || 'Petugas Gudang',
          requester_phone: pr.requester_phone || '+62 812-5509-8112',
          warehouse_name: pr.warehouse_name || 'Gudang Dangau',
          notes: pr.notes || 'Pengajuan barang persediaan',
          status: pr.status || 'Menunggu',
          rejection_reason: pr.rejection_reason || '',
          items: pr.items || []
        };
      })
    : pendingList;

  const filteredAllRequests = allRequestsList.filter(pr => {
    if (!qSearch) return true;
    return (
      ((pr.pr_number || '').toLowerCase().includes(qSearch)) ||
      ((pr.role || '').toLowerCase().includes(qSearch)) ||
      ((pr.notes || '').toLowerCase().includes(qSearch))
    );
  });

  const recentReceiptsList = data?.recent_receipts || [];
  const recentIssuesList = data?.recent_issues || [];

  const filteredReceipts = recentReceiptsList.filter(gr => {
    if (!qSearch) return true;
    return (
      ((gr.gr_number || '').toLowerCase().includes(qSearch)) ||
      ((gr.supplier_name || '').toLowerCase().includes(qSearch))
    );
  });

  const filteredIssues = recentIssuesList.filter(gi => {
    if (!qSearch) return true;
    return (
      ((gi.gi_number || '').toLowerCase().includes(qSearch)) ||
      ((gi.outlet_name || '').toLowerCase().includes(qSearch))
    );
  });

  // Dynamic actions count badge matching exact pending list length
  const actionsCount = pendingList.length;

  // Petugas Stock Data
  const emergencyStockList = data?.emergency_stock_items || [];
  const expiringList = data?.expiring_items || [];
  const lowStockList = data?.low_stock_items || [];

  const filteredEmergencyList = emergencyStockList.filter(item => {
    const q = (globalSearch || '').toLowerCase();
    if (!q) return true;
    return (
      (item.item_name && item.item_name.toLowerCase().includes(q)) ||
      (item.sku && item.sku.toLowerCase().includes(q)) ||
      (item.warehouse_code && item.warehouse_code.toLowerCase().includes(q)) ||
      (item.warehouse_name && item.warehouse_name.toLowerCase().includes(q))
    );
  });

  const filteredExpiringList = expiringList.filter(item => {
    const q = (globalSearch || '').toLowerCase();
    if (!q) return true;
    return (
      (item.item_name && item.item_name.toLowerCase().includes(q)) ||
      (item.sku && item.sku.toLowerCase().includes(q)) ||
      (item.warehouse_code && item.warehouse_code.toLowerCase().includes(q)) ||
      (item.warehouse_name && item.warehouse_name.toLowerCase().includes(q))
    );
  });

  const filteredLowStockList = lowStockList.filter(item => {
    const q = (globalSearch || '').toLowerCase();
    if (!q) return true;
    return (
      (item.item_name && item.item_name.toLowerCase().includes(q)) ||
      (item.sku && item.sku.toLowerCase().includes(q)) ||
      (item.warehouse_code && item.warehouse_code.toLowerCase().includes(q)) ||
      (item.warehouse_name && item.warehouse_name.toLowerCase().includes(q))
    );
  });

  // Calculations for Master List Stok Barang
  const categoriesList = Array.from(new Set(inventoryList.map(i => i.category_name).filter(Boolean)));

  const filteredInventory = inventoryList.filter(item => {
    const query = (invSearchQuery || globalSearch || '').toLowerCase();
    const matchSearch = query === '' ||
      item.item_name.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      (item.category_name && item.category_name.toLowerCase().includes(query));

    const matchCategory = invCategoryFilter === 'ALL' || item.category_name === invCategoryFilter;

    const whTarget = invWarehouseFilter !== 'ALL' ? invWarehouseFilter : selectedWarehouse;
    const matchWarehouse = whTarget === 'ALL' || String(item.warehouse_id) === String(whTarget);

    const curr = parseFloat(item.current_stock || 0);
    const min = parseFloat(item.minimum_stock || 10);
    const crit = parseFloat(item.critical_stock || 5);

    let status = 'Aman';
    if (curr <= crit) status = 'Kritis';
    else if (curr <= min) status = 'Menipis';

    const matchStatus = invStatusFilter === 'ALL' || status === invStatusFilter;

    return matchSearch && matchCategory && matchWarehouse && matchStatus;
  });

  const totalMasterItems = filteredInventory.length;
  const totalMasterUnits = filteredInventory.reduce((acc, i) => acc + parseFloat(i.current_stock || 0), 0);
  const totalMasterValuation = filteredInventory.reduce((acc, i) => acc + (parseFloat(i.current_stock || 0) * parseFloat(i.unit_price || 0)), 0);
  const totalCriticalItems = filteredInventory.filter(i => {
    const curr = parseFloat(i.current_stock || 0);
    const min = parseFloat(i.minimum_stock || 10);
    return curr <= min;
  }).length;

  const needRestockList = filteredInventory.filter(i => {
    const curr = parseFloat(i.current_stock || 0);
    const min = parseFloat(i.minimum_stock || 10);
    return curr <= min;
  });

  return (
    <div>
      <div className="screen-dashboard-content">
        {/* Toast Alert Notification */}
      {toastMsg && (
        <div style={{
          padding: '12px 20px',
          marginBottom: '16px',
          borderRadius: '8px',
          backgroundColor: toastMsg.includes('Disetujui') ? '#dcfce7' : '#fee2e2',
          color: toastMsg.includes('Disetujui') ? '#15803d' : '#b91c1c',
          fontWeight: 700,
          fontSize: '14px',
          border: `1px solid ${toastMsg.includes('Disetujui') ? '#bbf7d0' : '#fecaca'}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
          {toastMsg}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAMPILAN OPERASIONAL PETUGAS STOCK / GUDANG                             */}
      {/* ========================================================================= */}
      {isPetugasStock ? (
        <div>
          {/* Aksi Cepat Operasional Gudang: Desain Tegas & Berwibawa */}
          <div
            style={{
              marginBottom: '20px',
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              borderRadius: '14px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)'
            }}
          >
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                Operasional Gudang & Persediaan
              </h2>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '3px', fontWeight: 500 }}>
                Pengelolaan mutasi stok fisik, penerimaan, pengeluaran, dan monitoring barang
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Link
                to="/barang-masuk"
                className="btn-dark"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', padding: '9px 16px', textDecoration: 'none' }}
              >
                <LogIn size={15} />
                <span>Catat Barang Masuk</span>
              </Link>
              <Link
                to="/barang-keluar"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  padding: '9px 16px',
                  textDecoration: 'none',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  border: '2px solid #0f172a',
                  borderRadius: '10px',
                  fontWeight: 800
                }}
              >
                <LogOutIcon size={15} />
                <span>Catat Barang Keluar</span>
              </Link>
              <Link
                to="/permintaan-pembelian"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  padding: '9px 16px',
                  textDecoration: 'none',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  border: '2px solid #0f172a',
                  borderRadius: '10px',
                  fontWeight: 800
                }}
              >
                <FileText size={15} />
                <span>Pengajuan PR</span>
              </Link>
              <Link
                to="/stok-opname"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  padding: '9px 16px',
                  textDecoration: 'none',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  border: '2px solid #0f172a',
                  borderRadius: '10px',
                  fontWeight: 800
                }}
              >
                <Package size={15} />
                <span>Stok Opname</span>
              </Link>
            </div>
          </div>

          {/* 4 Kartu Metrik Operasional: Border 2px Tegas & Kontras */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {/* Card 1: Total Stok Fisik */}
            <div style={{ padding: '18px 20px', border: '2px solid #0f172a', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL STOK FISIK</span>
                <div style={{ padding: '6px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1.5px solid #0f172a' }}>
                  <Package size={16} color="#0f172a" />
                </div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                {(whDangauUnits + whWhiteHouseUnits).toLocaleString('id-ID')}{' '}
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Unit</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
                WH-DG: {whDangauUnits.toLocaleString('id-ID')} • WH-WH: {whWhiteHouseUnits.toLocaleString('id-ID')}
              </div>
            </div>

            {/* Card 2: Stok Perlu Reorder */}
            <div style={{
              padding: '18px 20px',
              border: emergencyStockList.length > 0 ? '2px solid #dc2626' : '2px solid #0f172a',
              borderRadius: '12px',
              backgroundColor: emergencyStockList.length > 0 ? '#fef2f2' : '#ffffff',
              boxShadow: emergencyStockList.length > 0 ? '0 4px 12px rgba(220, 38, 38, 0.12)' : '0 4px 12px rgba(15, 23, 42, 0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: emergencyStockList.length > 0 ? '#991b1b' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  STOK PERLU REORDER
                </span>
                <div style={{ padding: '6px', backgroundColor: emergencyStockList.length > 0 ? '#fee2e2' : '#f1f5f9', borderRadius: '8px', border: emergencyStockList.length > 0 ? '1.5px solid #dc2626' : '1.5px solid #cbd5e1' }}>
                  <AlertTriangle size={16} color={emergencyStockList.length > 0 ? '#dc2626' : '#64748b'} />
                </div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: emergencyStockList.length > 0 ? '#dc2626' : '#0f172a', lineHeight: 1.2 }}>
                {emergencyStockList.length}{' '}
                <span style={{ fontSize: '13px', fontWeight: 600, color: emergencyStockList.length > 0 ? '#991b1b' : '#64748b' }}>Item</span>
              </div>
              <div style={{ fontSize: '12px', color: emergencyStockList.length > 0 ? '#991b1b' : '#64748b', marginTop: '6px', fontWeight: 500 }}>
                {emergencyStockList.length > 0 ? 'Stok berada di bawah batas minimum' : 'Semua stok dalam batas aman'}
              </div>
            </div>

            {/* Card 3: Mendekati Kedaluwarsa */}
            <div style={{
              padding: '18px 20px',
              border: expiringList.length > 0 ? '2px solid #f59e0b' : '2px solid #0f172a',
              borderRadius: '12px',
              backgroundColor: expiringList.length > 0 ? '#fffdf5' : '#ffffff',
              boxShadow: expiringList.length > 0 ? '0 4px 12px rgba(245, 158, 11, 0.1)' : '0 4px 12px rgba(15, 23, 42, 0.06)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: expiringList.length > 0 ? '#78350f' : '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  MENDEKATI KEDALUWARSA
                </span>
                <div style={{ padding: '6px', backgroundColor: expiringList.length > 0 ? '#fef3c7' : '#f1f5f9', borderRadius: '8px', border: expiringList.length > 0 ? '1.5px solid #f59e0b' : '1.5px solid #cbd5e1' }}>
                  <Clock size={16} color={expiringList.length > 0 ? '#b45309' : '#64748b'} />
                </div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: expiringList.length > 0 ? '#b45309' : '#0f172a', lineHeight: 1.2 }}>
                {expiringList.length}{' '}
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Item</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
                Masa simpan kurang dari 60 hari
              </div>
            </div>

            {/* Card 4: Aktivitas Mutasi */}
            <div style={{ padding: '18px 20px', border: '2px solid #0f172a', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>MUTASI TERKINI</span>
                <div style={{ padding: '6px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1.5px solid #0f172a' }}>
                  <LogIn size={16} color="#0f172a" />
                </div>
              </div>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>
                {filteredReceipts.length + filteredIssues.length}{' '}
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Transaksi</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
                {filteredReceipts.length} Masuk • {filteredIssues.length} Keluar
              </div>
            </div>
          </div>

          {/* Panel Utama: Monitoring Persediaan & Perhatian Stok */}
          <div style={{ padding: '0', overflow: 'hidden', marginBottom: '20px', border: '2px solid #0f172a', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }}>
            {/* Header Tab Switcher */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '2px solid #0f172a',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setStockTab('emergency')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: stockTab === 'emergency' ? '2px solid #8c6208' : '2px solid #0f172a',
                    background: stockTab === 'emergency' ? 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)' : '#ffffff',
                    color: stockTab === 'emergency' ? '#ffffff' : '#0f172a',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: stockTab === 'emergency' ? '0 4px 12px rgba(184, 134, 11, 0.3)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Stok Kritis / Reorder</span>
                  <span style={{
                    backgroundColor: stockTab === 'emergency' ? '#ffffff26' : '#fee2e2',
                    color: stockTab === 'emergency' ? '#ffffff' : '#991b1b',
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontWeight: 800
                  }}>
                    {filteredEmergencyList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStockTab('expiring')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: stockTab === 'expiring' ? '2px solid #8c6208' : '2px solid #0f172a',
                    background: stockTab === 'expiring' ? 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)' : '#ffffff',
                    color: stockTab === 'expiring' ? '#ffffff' : '#0f172a',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: stockTab === 'expiring' ? '0 4px 12px rgba(184, 134, 11, 0.3)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Mendekati Kedaluwarsa</span>
                  <span style={{
                    backgroundColor: stockTab === 'expiring' ? '#ffffff26' : '#ffedd5',
                    color: stockTab === 'expiring' ? '#ffffff' : '#c2410c',
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontWeight: 800
                  }}>
                    {filteredExpiringList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStockTab('low')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: stockTab === 'low' ? '2px solid #8c6208' : '2px solid #0f172a',
                    background: stockTab === 'low' ? 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)' : '#ffffff',
                    color: stockTab === 'low' ? '#ffffff' : '#0f172a',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: stockTab === 'low' ? '0 4px 12px rgba(184, 134, 11, 0.3)' : 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Semua Stok Rendah</span>
                  <span style={{
                    backgroundColor: stockTab === 'low' ? '#ffffff26' : '#f1f5f9',
                    color: stockTab === 'low' ? '#ffffff' : '#0f172a',
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontWeight: 700
                  }}>
                    {filteredLowStockList.length}
                  </span>
                </button>
              </div>

              <div>
                {stockTab === 'expiring' ? (
                  <Link
                    to="/barang-keluar"
                    style={{
                      fontSize: '12px',
                      padding: '7px 12px',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none'
                    }}
                  >
                    <LogOutIcon size={13} />
                    <span>Catat Pengeluaran (OUT)</span>
                  </Link>
                ) : (
                  <Link
                    to="/permintaan-pembelian"
                    style={{
                      fontSize: '12px',
                      padding: '7px 12px',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none'
                    }}
                  >
                    <FileText size={13} />
                    <span>Buat Pengajuan PR</span>
                  </Link>
                )}
              </div>
            </div>

            {/* TAB CONTENT 1: Stok Kritis / Reorder */}
            {stockTab === 'emergency' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Nama Barang</th>
                      <th>Kategori</th>
                      <th>Gudang</th>
                      <th style={{ textAlign: 'center' }}>Stok Fisik</th>
                      <th style={{ textAlign: 'center' }}>Batas Minimal</th>
                      <th style={{ textAlign: 'center' }}>Defisit</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmergencyList.map((item) => (
                      <tr key={`em-${item.inventory_id || item.id}`}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{item.item_name}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                            {item.category_name || '-'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{item.warehouse_code}</span>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{item.warehouse_name}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#b91c1c' }}>
                            {parseFloat(item.current_stock)}
                          </span>{' '}
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{item.unit_name}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#475569' }}>
                            {parseFloat(item.critical_stock)}
                          </span>{' '}
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{item.unit_name}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#b91c1c' }}>
                            -{Math.abs(parseFloat(item.defisit_stok || (item.critical_stock - item.current_stock))).toFixed(1)} {item.unit_name}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, backgroundColor: '#fee2e2', color: '#991b1b', padding: '3px 8px', borderRadius: '4px' }}>
                            Kritis
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Link
                            to="/permintaan-pembelian"
                            style={{
                              fontSize: '11px',
                              padding: '4px 10px',
                              textDecoration: 'none',
                              backgroundColor: '#ffffff',
                              color: '#0f172a',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>Ajukan PR</span>
                            <ArrowRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {filteredEmergencyList.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '28px', color: '#64748b', fontSize: '13px' }}>
                          Tidak ada barang dengan status stok kritis. Semua persediaan dalam batas aman.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT 2: Mendekati Kedaluwarsa */}
            {stockTab === 'expiring' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Nama Barang</th>
                      <th>Kategori</th>
                      <th>Gudang</th>
                      <th style={{ textAlign: 'center' }}>Stok Fisik</th>
                      <th style={{ textAlign: 'center' }}>Tgl Kedaluwarsa</th>
                      <th style={{ textAlign: 'center' }}>Sisa Waktu</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpiringList.map((item) => {
                      const daysLeft = parseInt(item.days_left, 10);
                      const isCriticalExp = daysLeft <= 7;
                      const isNearExp = daysLeft <= 30;

                      return (
                        <tr key={`exp-${item.inventory_id || item.item_id}`}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{item.item_name}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                              {item.category_name || '-'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{item.warehouse_code}</span>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{item.warehouse_name}</div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                              {parseFloat(item.current_stock)}
                            </span>{' '}
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{item.unit_name}</span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>
                              {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {daysLeft < 0 ? (
                              <span style={{ fontSize: '11px', fontWeight: 600, backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px' }}>
                                Kedaluwarsa
                              </span>
                            ) : isCriticalExp ? (
                              <span style={{ fontSize: '11px', fontWeight: 600, backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: '4px' }}>
                                {daysLeft} Hari Lagi
                              </span>
                            ) : isNearExp ? (
                              <span style={{ fontSize: '11px', fontWeight: 600, backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px' }}>
                                {daysLeft} Hari Lagi
                              </span>
                            ) : (
                              <span style={{ fontSize: '11px', fontWeight: 500, backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                                {daysLeft} Hari Lagi
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: isCriticalExp ? '#991b1b' : isNearExp ? '#92400e' : '#475569'
                            }}>
                              {isCriticalExp ? 'Mendesak' : isNearExp ? 'Perhatian' : 'Normal'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <Link
                              to="/barang-keluar"
                              style={{
                                fontSize: '11px',
                                padding: '4px 10px',
                                textDecoration: 'none',
                                backgroundColor: '#ffffff',
                                color: '#0f172a',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <span>Keluarkan</span>
                              <ArrowRight size={11} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredExpiringList.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '28px', color: '#64748b', fontSize: '13px' }}>
                          Tidak ada stok barang yang mendekati masa kedaluwarsa.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT 3: Semua Stok Rendah */}
            {stockTab === 'low' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Nama Barang</th>
                      <th>Kategori</th>
                      <th>Gudang</th>
                      <th style={{ textAlign: 'center' }}>Stok Saat Ini</th>
                      <th style={{ textAlign: 'center' }}>Batas Minimal</th>
                      <th style={{ textAlign: 'center' }}>Batas Kritis</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLowStockList.map((item) => (
                      <tr key={`low-${item.id}`}>
                        <td>
                          <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>{item.item_name}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', color: '#475569', fontWeight: 600 }}>
                            {item.category_name || '-'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{item.warehouse_code}</span>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{item.warehouse_name}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: item.status_stok === 'Kritis' ? '#b91c1c' : '#d97706' }}>
                            {parseFloat(item.current_stock)}
                          </span>{' '}
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{item.unit_name}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#475569' }}>
                            {parseFloat(item.minimum_stock)}
                          </span>{' '}
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{item.unit_name}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 500, color: '#475569' }}>
                            {parseFloat(item.critical_stock)}
                          </span>{' '}
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{item.unit_name}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: item.status_stok === 'Kritis' ? '#fee2e2' : '#fef3c7',
                            color: item.status_stok === 'Kritis' ? '#991b1b' : '#92400e',
                            padding: '3px 8px',
                            borderRadius: '4px'
                          }}>
                            {item.status_stok}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Link
                            to="/permintaan-pembelian"
                            style={{
                              fontSize: '11px',
                              padding: '4px 10px',
                              textDecoration: 'none',
                              backgroundColor: '#ffffff',
                              color: '#0f172a',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span>Ajukan PR</span>
                            <ArrowRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {filteredLowStockList.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '28px', color: '#64748b', fontSize: '13px' }}>
                          Semua stok barang berada di atas batas minimum.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Riwayat Mutasi Barang Masuk & Keluar Terkini */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Riwayat Barang Masuk */}
            <div style={{ padding: '0', overflow: 'hidden', border: '2px solid #0f172a', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }}>
              <div style={{ padding: '14px 20px', borderBottom: '2px solid #0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LogIn size={16} color="#0f172a" />
                  <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>Penerimaan Barang Masuk (IN)</h3>
                </div>
                <Link to="/barang-masuk" style={{ fontSize: '12.5px', color: '#b8860b', textDecoration: 'none', fontWeight: 800 }}>
                  Lihat Semua &rarr;
                </Link>
              </div>
              <table className="data-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0f172a', borderBottom: '2.5px solid #d4af37' }}>
                    <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800 }}>No. Dokumen</th>
                    <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800 }}>Tanggal</th>
                    <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800 }}>Gudang</th>
                    <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800 }}>Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.slice(0, 4).map((gr) => (
                    <tr key={gr.id} style={{ borderBottom: '1.5px solid #e2e8f0' }}>
                      <td style={{ color: '#0f172a', fontSize: '12.5px', fontWeight: 700 }}>{gr.gr_number}</td>
                      <td style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>{new Date(gr.receipt_date || Date.now()).toLocaleDateString('id-ID')}</td>
                      <td style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: 700 }}>{gr.warehouse_code}</td>
                      <td style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600 }}>{gr.supplier_name || '-'}</td>
                    </tr>
                  ))}
                  {filteredReceipts.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontWeight: 600 }}>Belum ada data barang masuk.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Riwayat Barang Keluar */}
            <div style={{ padding: '0', overflow: 'hidden', border: '2px solid #0f172a', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }}>
              <div style={{ padding: '14px 20px', borderBottom: '2px solid #0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LogOutIcon size={16} color="#0f172a" />
                  <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#0f172a' }}>Pengeluaran Barang Keluar (OUT)</h3>
                </div>
                <Link to="/barang-keluar" style={{ fontSize: '12.5px', color: '#b8860b', textDecoration: 'none', fontWeight: 800 }}>
                  Lihat Semua &rarr;
                </Link>
              </div>
              <table className="data-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#0f172a', borderBottom: '2.5px solid #d4af37' }}>
                    <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800 }}>No. Dokumen</th>
                    <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800 }}>Tanggal</th>
                    <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800 }}>Gudang</th>
                    <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800 }}>Tujuan Outlet</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIssues.slice(0, 4).map((gi) => (
                    <tr key={gi.id} style={{ borderBottom: '1.5px solid #e2e8f0' }}>
                      <td style={{ color: '#0f172a', fontSize: '12.5px', fontWeight: 700 }}>{gi.gi_number}</td>
                      <td style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>{new Date(gi.issue_date || Date.now()).toLocaleDateString('id-ID')}</td>
                      <td style={{ fontSize: '12.5px', color: '#0f172a', fontWeight: 700 }}>{gi.warehouse_code}</td>
                      <td style={{ fontSize: '12.5px', color: '#334155', fontWeight: 600 }}>{gi.outlet_name || '-'}</td>
                    </tr>
                  ))}
                  {filteredIssues.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontWeight: 600 }}>Belum ada data barang keluar.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : isMaster ? (
        /* ========================================================================= */
        /* TAMPILAN KHUSUS MASTER: LIST STOK PERSEDIAAN BARANG HOTEL DANGAU         */
        /* ========================================================================= */
        <div>
          {/* Header Banner Master Executive: Tegas & Berbobot */}
          <div
            style={{
              marginBottom: '20px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              borderRadius: '14px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)'
            }}
          >
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>
                Laporan Persediaan &amp; Inventori Terpadu
              </h2>
              <div style={{ fontSize: '13px', color: '#475569', marginTop: '3px', fontWeight: 500 }}>
                Pengawasan eksekutif terhadap total aset, valuasi, dan mutasi persediaan Hotel Dangau Kubu Raya
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="btn-dark"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  fontSize: '13px',
                  fontWeight: 800,
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} />
                <span>Cetak Laporan Resmi</span>
              </button>
            </div>
          </div>

          {/* 4 Stat Cards: Border 2px Tegas & Kontras Emas */}
          <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '22px' }}>
            {/* Card 1: Ringkasan In */}
            <div style={{ border: '2px solid #0f172a', borderRadius: '12px', padding: '18px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
              <div className="card-label-italic" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>RINGKASAN IN</span>
                <div style={{ padding: '7px', border: '1.5px solid #0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', background: '#f8fafc' }}>
                  <LogIn size={17} color="#0f172a" />
                </div>
              </div>
              <div className="card-value-lg" style={{ color: '#0f172a', fontSize: '26px', fontWeight: 900, marginTop: '8px' }}>
                {filteredReceipts.length} <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Penerimaan</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
                Total mutasi penerimaan barang masuk
              </div>
            </div>

            {/* Card 2: Ringkasan Out Terbaru */}
            <div style={{ border: '2px solid #0f172a', borderRadius: '12px', padding: '18px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
              <div className="card-label-italic" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>RINGKASAN OUT TERBARU</span>
                <div style={{ padding: '7px', border: '1.5px solid #0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', background: '#f8fafc' }}>
                  <LogOutIcon size={17} color="#0f172a" />
                </div>
              </div>
              <div className="card-value-lg" style={{ color: '#0f172a', fontSize: '26px', fontWeight: 900, marginTop: '8px' }}>
                {filteredIssues.length} <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Pengeluaran</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
                Total mutasi distribusi barang keluar
              </div>
            </div>

            {/* Card 3: Total Nilai Stock */}
            <div style={{ border: '2px solid #b8860b', borderRadius: '12px', padding: '18px', backgroundColor: '#fdfbf7', boxShadow: '0 4px 12px rgba(184, 134, 11, 0.1)' }}>
              <div className="card-label-italic" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: '#78350f', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL NILAI STOCK</span>
                <div style={{ padding: '7px', border: '1.5px solid #b8860b', borderRadius: '8px', display: 'flex', alignItems: 'center', background: '#fef3c7' }}>
                  <CreditCard size={17} color="#b8860b" />
                </div>
              </div>
              <div className="card-value-lg" style={{ color: '#855800', fontSize: '26px', fontWeight: 900, marginTop: '8px' }}>
                Rp {Math.round(totalMasterValuation).toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '12px', color: '#855800', marginTop: '6px', fontWeight: 500 }}>
                Akumulasi seluruh nilai aset persediaan
              </div>
            </div>

            {/* Card 4: List Barang yang Perlu di Restock */}
            <div className="card" style={{ border: '2px solid #0f172a', borderRadius: '14px', padding: '18px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
              <div className="card-label-italic" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: '#991b1b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Perlu Restock Segera</span>
                <div style={{ padding: '7px', border: '1.5px solid #dc2626', borderRadius: '8px', display: 'flex', alignItems: 'center', background: '#fef2f2' }}>
                  <AlertTriangle size={17} color="#dc2626" />
                </div>
              </div>
              <div className="card-value-lg" style={{ color: needRestockList.length > 0 ? '#dc2626' : '#15803d', fontSize: '26px', fontWeight: 900, marginTop: '8px' }}>
                {needRestockList.length} <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>Item Menipis/Kritis</span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
                {needRestockList.length > 0 ? 'Segera periksa item di bawah batas aman' : 'Semua stok dalam ambang batas aman'}
              </div>
            </div>
          </div>

          {/* Riwayat Mutasi: Ringkasan In Terbaru & Ringkasan Out Terbaru */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '22px' }}>
            {/* Ringkasan Penerimaan Barang Masuk (IN) */}
            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '2px solid #0f172a', borderRadius: '14px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
              <div style={{ padding: '14px 20px', borderBottom: '2.5px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LogIn size={16} color="#d4af37" />
                  <h3 style={{ fontSize: '14.5px', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '0.02em' }}>Ringkasan In Terbaru</h3>
                </div>
                <Link to="/barang-masuk" style={{ fontSize: '12px', color: '#d4af37', textDecoration: 'none', fontWeight: 800 }}>
                  Lihat Semua &rarr;
                </Link>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>No. Dokumen</th>
                      <th>Tanggal</th>
                      <th>Gudang</th>
                      <th>Supplier / Sumber</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceipts.slice(0, 5).map((gr) => (
                      <tr key={gr.id}>
                        <td style={{ color: '#0f172a', fontSize: '12px', fontWeight: 700 }}>{gr.gr_number}</td>
                        <td style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{new Date(gr.receipt_date || Date.now()).toLocaleDateString('id-ID')}</td>
                        <td style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{gr.warehouse_code}</td>
                        <td style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{gr.supplier_name || 'Vendor Terdaftar'}</td>
                      </tr>
                    ))}
                    {filteredReceipts.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>Belum ada data penerimaan barang masuk.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Ringkasan Pengeluaran Barang Keluar (OUT) */}
            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '2px solid #0f172a', borderRadius: '14px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
              <div style={{ padding: '14px 20px', borderBottom: '2.5px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <LogOutIcon size={16} color="#d4af37" />
                  <h3 style={{ fontSize: '14.5px', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '0.02em' }}>Ringkasan Out Terbaru</h3>
                </div>
                <Link to="/barang-keluar" style={{ fontSize: '12px', color: '#d4af37', textDecoration: 'none', fontWeight: 800 }}>
                  Lihat Semua &rarr;
                </Link>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>No. Dokumen</th>
                      <th>Tanggal</th>
                      <th>Gudang</th>
                      <th>Tujuan Outlet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.slice(0, 5).map((gi) => (
                      <tr key={gi.id}>
                        <td style={{ color: '#0f172a', fontSize: '12px', fontWeight: 700 }}>{gi.gi_number}</td>
                        <td style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{new Date(gi.issue_date || Date.now()).toLocaleDateString('id-ID')}</td>
                        <td style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{gi.warehouse_code}</td>
                        <td style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>{gi.outlet_name || 'Warung Dangau'}</td>
                      </tr>
                    ))}
                    {filteredIssues.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>Belum ada data pengeluaran barang keluar.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section: List Barang yang Perlu di Restock */}
          <div className="card" style={{ marginBottom: '22px', padding: '0', overflow: 'hidden', border: '2px solid #0f172a', borderRadius: '14px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '2.5px solid #d4af37', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0f172a', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '7px', backgroundColor: '#fee2e2', borderRadius: '8px', border: '1.5px solid #dc2626' }}>
                  <AlertTriangle size={18} color="#dc2626" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#ffffff', letterSpacing: '0.02em' }}>List Barang yang Perlu di-Restock</h3>
                    <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 9px', borderRadius: '9999px', backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}>
                      {needRestockList.length} Item Menipis/Kritis
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px', fontWeight: 500 }}>
                    Barang persediaan yang mencapai batas minimum atau stok kritis dan butuh pengadaan restock.
                  </div>
                </div>
              </div>

              <Link
                to="/permintaan-pembelian"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none'
                }}
              >
                <FileText size={14} />
                <span>+ Buat Pengajuan PR</span>
              </Link>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                    <th>Nama Barang</th>
                    <th>Kategori</th>
                    <th>Gudang</th>
                    <th style={{ textAlign: 'right' }}>Stok Fisik</th>
                    <th style={{ textAlign: 'center' }}>Batas Minimal</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {needRestockList.map((item, idx) => {
                    const curr = parseFloat(item.current_stock || 0);
                    const min = parseFloat(item.minimum_stock || 10);
                    const crit = parseFloat(item.critical_stock || 5);
                    const isCrit = curr <= crit;

                    return (
                      <tr key={item.id || idx}>
                        <td style={{ textAlign: 'center', fontSize: '11.5px', color: '#78716c' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#1c1917', fontSize: '12.5px' }}>{item.item_name}</td>
                        <td style={{ fontSize: '12px', color: '#57534e' }}>{item.category_name || '-'}</td>
                        <td style={{ fontSize: '12px', color: '#57534e' }}>
                          <span style={{ fontWeight: 600 }}>{item.warehouse_code}</span> ({item.warehouse_name})
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '13px', color: isCrit ? '#dc2626' : '#b45309' }}>
                          {curr.toLocaleString('id-ID')} <span style={{ fontSize: '11px', color: '#78716c', fontWeight: 500 }}>{item.unit_name}</span>
                        </td>
                        <td style={{ textAlign: 'center', fontSize: '12px', color: '#57534e' }}>
                          Min: {min} | Kritis: {crit}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: isCrit ? '#fee2e2' : '#fef3c7',
                              color: isCrit ? '#b91c1c' : '#92400e',
                              border: `1px solid ${isCrit ? '#fecaca' : '#fde68a'}`
                            }}
                          >
                            {isCrit ? 'Kritis' : 'Menipis'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <Link
                            to="/permintaan-pembelian"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#fff7ed',
                              color: '#c2410c',
                              border: '1px solid #fed7aa',
                              textDecoration: 'none'
                            }}
                          >
                            <FileText size={12} />
                            <span>Ajukan PR</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {needRestockList.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#15803d', fontWeight: 600 }}>
                        Semua stok barang berada dalam kondisi aman (tidak ada barang yang perlu di-restock).
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div
            className="card"
            style={{
              marginBottom: '20px',
              padding: '16px 20px',
              border: '2px solid #0f172a',
              borderRadius: '14px',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px', maxWidth: '420px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={16} color="#0f172a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Cari nama barang atau kategori..."
                  value={invSearchQuery}
                  onChange={(e) => setInvSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: '2px solid #0f172a',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    color: '#0f172a'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SlidersHorizontal size={14} color="#0f172a" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>Filter:</span>
              </div>

              {/* Gudang */}
              <select
                value={invWarehouseFilter}
                onChange={(e) => setInvWarehouseFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: '2px solid #0f172a',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">Semua Gudang</option>
                <option value="1">Gudang Dangau (WH-DG)</option>
                <option value="2">Gudang White House (WH-WH)</option>
              </select>

              {/* Kategori */}
              <select
                value={invCategoryFilter}
                onChange={(e) => setInvCategoryFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: '2px solid #0f172a',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">Semua Kategori</option>
                {categoriesList.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>

              {/* Status Stok */}
              <select
                value={invStatusFilter}
                onChange={(e) => setInvStatusFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  border: '2px solid #0f172a',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="ALL">Semua Status</option>
                <option value="Aman">Stok Aman</option>
                <option value="Menipis">Stok Menipis</option>
                <option value="Kritis">Stok Kritis</option>
              </select>

              {(invSearchQuery || invCategoryFilter !== 'ALL' || invStatusFilter !== 'ALL' || invWarehouseFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setInvSearchQuery('');
                    setInvCategoryFilter('ALL');
                    setInvStatusFilter('ALL');
                    setInvWarehouseFilter('ALL');
                  }}
                  className="btn btn-secondary"
                  style={{
                    padding: '7px 14px',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    borderRadius: '8px'
                  }}
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>

          {/* Table List Stok Barang */}
          <div className="card" style={{ border: '2px solid #0f172a', borderRadius: '14px', padding: 0, overflow: 'hidden', backgroundColor: '#ffffff', marginBottom: '22px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '2.5px solid #d4af37',
              background: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={17} color="#d4af37" />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '0.02em' }}>
                  Daftar Master Stok Persediaan ({filteredInventory.length} Barang)
                </h3>
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500 }}>
                Menampilkan data inventori aktif
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                    <th>Nama Barang</th>
                    <th>Kategori</th>
                    <th>Gudang</th>
                    <th style={{ textAlign: 'right' }}>Stok Fisik</th>
                    <th>Satuan</th>
                    <th style={{ textAlign: 'center' }}>Batas Min / Kritis</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'right' }}>Harga Satuan</th>
                    <th style={{ textAlign: 'right' }}>Total Nilai (Rp)</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item, index) => {
                    const curr = parseFloat(item.current_stock || 0);
                    const min = parseFloat(item.minimum_stock || 10);
                    const crit = parseFloat(item.critical_stock || 5);
                    const price = parseFloat(item.unit_price || 0);
                    const totalVal = curr * price;

                    let status = 'Aman';
                    let badgeBg = '#dcfce7';
                    let badgeColor = '#15803d';
                    let badgeBorder = '#bbf7d0';

                    if (curr <= crit) {
                      status = 'Kritis';
                      badgeBg = '#fee2e2';
                      badgeColor = '#b91c1c';
                      badgeBorder = '#fecaca';
                    } else if (curr <= min) {
                      status = 'Menipis';
                      badgeBg = '#fef3c7';
                      badgeColor = '#92400e';
                      badgeBorder = '#fde68a';
                    }

                    return (
                      <tr key={item.id || index} style={{ transition: 'background-color 0.15s ease' }}>
                        <td style={{ textAlign: 'center', fontSize: '11.5px', color: '#78716c' }}>{index + 1}</td>
                        <td style={{ fontWeight: 600, color: '#1c1917', fontSize: '12.5px' }}>{item.item_name}</td>
                        <td style={{ fontSize: '12px', color: '#57534e' }}>{item.category_name || '-'}</td>
                        <td style={{ fontSize: '12px', color: '#57534e' }}>
                          <span style={{ fontWeight: 600, color: '#3d2f17' }}>{item.warehouse_code}</span>
                          <span style={{ fontSize: '11px', color: '#78716c', marginLeft: '4px' }}>({item.warehouse_name})</span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '13px', color: curr <= min ? '#dc2626' : '#1c1917' }}>
                          {curr.toLocaleString('id-ID')}
                        </td>
                        <td style={{ fontSize: '12px', color: '#57534e' }}>{item.unit_name || 'Pcs'}</td>
                        <td style={{ textAlign: 'center', fontSize: '11.5px', color: '#78716c' }}>
                          Min: {min} / Kritis: {crit}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: '9999px',
                            backgroundColor: badgeBg,
                            color: badgeColor,
                            border: `1px solid ${badgeBorder}`
                          }}>
                            {status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontSize: '12px', color: '#57534e' }}>
                          Rp {price.toLocaleString('id-ID')}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '12.5px', color: '#8a6515' }}>
                          Rp {Math.round(totalVal).toLocaleString('id-ID')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedItemDetail(item)}
                            style={{
                              backgroundColor: '#ffffff',
                              color: '#8a6515',
                              border: '1.5px solid #ebd9b0',
                              padding: '5px 12px',
                              borderRadius: '7px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Eye size={12} color="#8a6515" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInventory.length === 0 && (
                    <tr>
                      <td colSpan="12" style={{ textAlign: 'center', padding: '36px 20px', color: '#94a3b8' }}>
                        <Search size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#1c1917' }}>Tidak ada data barang yang sesuai</div>
                        <div style={{ fontSize: '12px', color: '#78716c', marginTop: '4px' }}>Coba ubah kata kunci pencarian atau reset filter.</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* TAMPILAN KHUSUS ACCOUNTING (ADMIN)                                       */
        /* ========================================================================= */
        <div>
          {/* Alert Banner Khusus Accounting jika ada Permintaan Pembelian dari Gudang yang Perlu di-ACC */}
          {pendingList.length > 0 && (
            <div style={{
              marginBottom: '20px',
              padding: '16px 22px',
              backgroundColor: '#fffdf5',
              border: '2px solid #b8860b',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              boxShadow: '0 4px 14px rgba(184, 134, 11, 0.12)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#fef3c7',
                  border: '1.5px solid #b8860b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#b8860b',
                  flexShrink: 0
                }}>
                  <FileText size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#78350f', letterSpacing: '0.01em', textTransform: 'uppercase' }}>
                    PERLU ACC: Ada {pendingList.length} Pengajuan Permintaan Pembelian (PR) dari Petugas Gudang!
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#92400e', marginTop: '3px', fontWeight: 500 }}>
                    Petugas gudang telah mengirimkan pengajuan restock barang. Segera periksa daftar di bawah dan klik tombol <strong>"ACC / Setujui"</strong> untuk menyetujui dan menerbitkan Pesanan Pembelian (PO).
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const prEl = document.getElementById('accounting-pr-approval-section');
                  if (prEl) prEl.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn btn-primary"
                style={{
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  borderRadius: '8px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>Tinjau {pendingList.length} PR Menunggu ACC &darr;</span>
              </button>
            </div>
          )}

          {/* Operasional Pengadaan & Logistik (Admin Navigation Bar) */}
          <div
            className="card"
            style={{
              marginBottom: '20px',
              padding: '16px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '14px',
              backgroundColor: '#ffffff',
              border: '2px solid #0f172a',
              borderRadius: '14px',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: 'var(--font-heading)' }}>
                  Operasional Pengadaan & Logistik
                </h2>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: '1.5px solid #d4af37',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  textTransform: 'uppercase'
                }}>
                  Admin Accounting
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '4px', fontWeight: 500 }}>
                Pencatatan Purchase Order (PO), penerimaan barang masuk, dan pengeluaran barang persediaan.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <Link
                to="/permintaan-pembelian"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '8px 16px',
                  textDecoration: 'none',
                  backgroundColor: pendingList.length > 0 ? '#fef3c7' : '#ffffff',
                  color: pendingList.length > 0 ? '#78350f' : '#0f172a',
                  border: pendingList.length > 0 ? '2px solid #b8860b' : '2px solid #0f172a',
                  borderRadius: '8px',
                  fontWeight: 800
                }}
              >
                <FileText size={15} color={pendingList.length > 0 ? '#b8860b' : '#0f172a'} />
                <span>Permintaan Pembelian (PR)</span>
                {pendingList.length > 0 && (
                  <span style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    marginLeft: '2px'
                  }}>
                    {pendingList.length} Perlu ACC
                  </span>
                )}
              </Link>
              <Link
                to="/pesanan-pembelian"
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '8px 16px',
                  textDecoration: 'none',
                  borderRadius: '8px'
                }}
              >
                <Package size={15} />
                <span>Pesanan Pembelian (PO)</span>
              </Link>
              <Link
                to="/barang-masuk"
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '8px 16px',
                  textDecoration: 'none',
                  borderRadius: '8px'
                }}
              >
                <LogIn size={15} />
                <span>Catat Barang Masuk</span>
              </Link>
              <Link
                to="/barang-keluar"
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  padding: '8px 16px',
                  textDecoration: 'none',
                  borderRadius: '8px'
                }}
              >
                <LogOutIcon size={15} />
                <span>Catat Barang Keluar</span>
              </Link>
            </div>
          </div>

          {/* 2 Top Metric Cards (Valuasi Rupiah & Unit Inventori) */}
          <div className="grid-cards" style={{ marginBottom: '20px' }}>
            <div className="card" style={{ padding: '16px 20px', border: '2px solid #0f172a', borderRadius: '14px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
              <div className="card-label-italic" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Inventori Gudang Dangau (WH-DG)</span>
                <div style={{ padding: '7px', border: '1.5px solid #b8860b', borderRadius: '8px', display: 'flex', alignItems: 'center', background: '#fef3c7' }}>
                  <CreditCard size={16} color="#b8860b" />
                </div>
              </div>
              <div className="card-value-lg" style={{ color: '#0f172a', fontSize: '26px', fontWeight: 900, marginTop: '8px' }}>
                Rp {whDangauValue.toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px', fontWeight: 600 }}>
                {whDangauUnits.toLocaleString('id-ID')} unit barang tercatat pada gudang utama
              </div>
            </div>

            <div className="card" style={{ padding: '16px 20px', border: '2px solid #0f172a', borderRadius: '14px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
              <div className="card-label-italic" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Inventori Gudang White House (WH-WH)</span>
                <div style={{ padding: '7px', border: '1.5px solid #b8860b', borderRadius: '8px', display: 'flex', alignItems: 'center', background: '#fef3c7' }}>
                  <CreditCard size={16} color="#b8860b" />
                </div>
              </div>
              <div className="card-value-lg" style={{ color: '#0f172a', fontSize: '26px', fontWeight: 900, marginTop: '8px' }}>
                Rp {whWhiteHouseValue.toLocaleString('id-ID')}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px', fontWeight: 600 }}>
                {whWhiteHouseUnits.toLocaleString('id-ID')} unit barang tercatat pada off-site storage
              </div>
            </div>
          </div>

          {/* Persetujuan Permintaan Pembelian Card (Untuk Admin Accounting) */}
          <div id="accounting-pr-approval-section" className="card" style={{ marginBottom: '20px', border: '2px solid #0f172a', borderRadius: '14px', padding: '0', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '2.5px solid #d4af37',
              background: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}>
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '0.02em' }}>
                      Persetujuan Permintaan Pembelian (PR Petugas Gudang)
                    </h3>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      backgroundColor: pendingList.length > 0 ? '#fee2e2' : '#f1f5f9',
                      color: pendingList.length > 0 ? '#991b1b' : '#334155',
                      border: `1.5px solid ${pendingList.length > 0 ? '#ef4444' : '#cbd5e1'}`,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {pendingList.length > 0 ? (
                        <>
                          <AlertCircle size={13} color="#dc2626" />
                          <span>{pendingList.length} Menunggu ACC dari Accounting</span>
                        </>
                      ) : (
                        <span>0 Menunggu ACC</span>
                      )}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px', fontWeight: 500 }}>
                    Daftar pengajuan restock barang dari petugas gudang yang memerlukan ACC / persetujuan Accounting untuk diterbitkan menjadi PO
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ display: 'flex', background: '#1e293b', border: '1.5px solid #475569', borderRadius: '8px', padding: '3px' }}>
                  <button
                    type="button"
                    onClick={() => setAdminPrTab('pending')}
                    style={{
                      border: 'none',
                      background: adminPrTab === 'pending' ? 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)' : 'transparent',
                      color: adminPrTab === 'pending' ? '#ffffff' : '#cbd5e1',
                      fontWeight: 800,
                      fontSize: '12px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Menunggu ACC ({pendingList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminPrTab('all')}
                    style={{
                      border: 'none',
                      background: adminPrTab === 'all' ? 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)' : 'transparent',
                      color: adminPrTab === 'all' ? '#ffffff' : '#cbd5e1',
                      fontWeight: 800,
                      fontSize: '12px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Semua ({allRequestsList.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Table of PRs */}
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>No. Dokumen PR</th>
                    <th style={{ width: '85px' }}>Tanggal</th>
                    <th style={{ width: '145px' }}>Pemohon (Petugas Gudang)</th>
                    <th style={{ width: '120px' }}>Gudang Tujuan</th>
                    <th>Rincian Barang</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>Urgensi</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Status</th>
                    <th style={{ width: '180px', textAlign: 'center' }}>Tindakan</th>
                  </tr>
                </thead>
                <tbody>
                  {(adminPrTab === 'pending' ? filteredPendingList : filteredAllRequests).map((pr) => (
                    <tr key={pr.id}>
                      <td style={{ fontWeight: 700, color: '#0f172a', fontSize: '12px' }}>{pr.pr_number}</td>
                      <td style={{ color: '#64748b', fontSize: '12px' }}>{pr.date}</td>
                      <td style={{ fontWeight: 600, color: '#334155', fontSize: '12px' }}>{pr.role}</td>
                      <td style={{ fontSize: '12px' }}>
                        <span style={{ padding: '2px 6px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 600, fontSize: '11px', color: '#1e293b' }}>
                          {pr.warehouse_name}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px' }}>
                        {pr.items && pr.items.length > 0 ? (
                          pr.items.map((it, idx) => (
                            <span key={idx} style={{ display: 'inline-block', marginRight: '6px', fontWeight: 600, color: '#0f172a' }}>
                              {it.item_name} ({parseFloat(it.quantity)} {it.unit_name || 'Unit'})
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#64748b' }}>{pr.notes || 'Permintaan barang'}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '4px',
                          backgroundColor: pr.priority === 'Tinggi' ? '#fee2e2' : '#fef3c7',
                          color: pr.priority === 'Tinggi' ? '#b91c1c' : '#b45309',
                          border: `1px solid ${pr.priority === 'Tinggi' ? '#fecaca' : '#fde68a'}`
                        }}>
                          {pr.priority}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: pr.status === 'Disetujui' ? '#dcfce7' : pr.status === 'Ditolak' ? '#fee2e2' : '#fef3c7',
                          color: pr.status === 'Disetujui' ? '#15803d' : pr.status === 'Ditolak' ? '#b91c1c' : '#b45309',
                          border: `1px solid ${pr.status === 'Disetujui' ? '#86efac' : pr.status === 'Ditolak' ? '#fca5a5' : '#fde047'}`
                        }}>
                          {pr.status === 'Menunggu' || !pr.status ? 'Menunggu ACC' : pr.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          {(pr.status === 'Menunggu' || !pr.status) ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApprovePR(pr)}
                                style={{
                                  backgroundColor: '#16a34a',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '5px 11px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)'
                                }}
                                title="ACC / Setujui dan langsung buka Form Pesanan Pembelian (PO)"
                              >
                                <Check size={12} strokeWidth={2.5} />
                                <span>ACC / Setujui</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectModalItem(pr)}
                                style={{
                                  backgroundColor: '#dc2626',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 800,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)'
                                }}
                                title="Tolak Pengajuan & Kirim Alasan"
                              >
                                <X size={12} strokeWidth={2.5} />
                                <span>Tolak</span>
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: '11.5px', color: '#64748b', fontStyle: 'italic' }}>
                              Telah Diproses
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(pr)}
                            style={{
                              backgroundColor: '#ffffff',
                              color: '#334155',
                              border: '1px solid #cbd5e1',
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                            title="Tinjau Rincian"
                          >
                            <Eye size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {(adminPrTab === 'pending' ? filteredPendingList : filteredAllRequests).length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '12.5px' }}>
                        {adminPrTab === 'pending' ? 'Tidak ada permohonan PR yang menunggu persetujuan.' : 'Belum ada riwayat permohonan PR.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Main Grid: Left Column & Right Column */}
          <div className="dashboard-main-grid" style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '20px', alignItems: 'start' }}>
            {/* Left Column: Pesanan Pembelian (PO) */}
            <div className="card" style={{ border: '2px solid #0f172a', borderRadius: '14px', padding: '0', overflow: 'hidden', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
                {/* Header Card */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '2.5px solid #d4af37',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff'
                    }}>
                      <Package size={16} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '0.02em' }}>
                        Pesanan Pembelian (Purchase Orders)
                      </h3>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 500 }}>
                        Daftar transaksi pesanan pembelian aktif kepada supplier
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/pesanan-pembelian"
                    style={{
                      fontSize: '12px',
                      color: '#d4af37',
                      fontWeight: 800,
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Kelola Semua PO</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Table Body for Admin */}
                <div style={{ padding: '0' }}>
                  <table className="data-table" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th>No. PO</th>
                        <th>Supplier / Vendor</th>
                        <th>Tanggal</th>
                        <th style={{ textAlign: 'right' }}>Total (Rp)</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecentOrders.map((po) => (
                        <tr key={po.id}>
                          <td style={{ fontWeight: 700, color: '#0f172a', fontSize: '12px' }}>{po.po_number}</td>
                          <td style={{ fontWeight: 600, color: '#1e293b', fontSize: '12px' }}>{po.supplier_name}</td>
                          <td style={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}>{po.date}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a', fontSize: '12px' }}>
                            Rp {parseFloat(po.amount || 0).toLocaleString('id-ID')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: po.status === 'Terkirim' || po.status === 'Diterima' ? '#dcfce7' : '#fef3c7',
                              color: po.status === 'Terkirim' || po.status === 'Diterima' ? '#15803d' : '#92400e',
                              border: `1px solid ${po.status === 'Terkirim' || po.status === 'Diterima' ? '#bbf7d0' : '#fde68a'}`
                            }}>
                              {po.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredRecentOrders.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '12.5px' }}>
                            Belum ada transaksi Pesanan Pembelian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            {/* Right Column: Riwayat Barang Masuk & Keluar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Riwayat Barang Masuk */}
              <div className="card" style={{ padding: '0', overflow: 'hidden', border: '2px solid #0f172a', borderRadius: '14px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '2.5px solid #d4af37', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '0.02em' }}>Riwayat Barang Masuk (In)</h3>
                  <Link to="/barang-masuk" style={{ fontSize: '12px', fontWeight: 800, color: '#d4af37', textDecoration: 'none' }}>
                    Lihat Semua &rarr;
                  </Link>
                </div>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>No. Dokumen</th>
                      <th>Tanggal</th>
                      <th>Gudang</th>
                      <th>Supplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReceipts.slice(0, 3).map((gr) => (
                      <tr key={gr.id}>
                        <td style={{ color: '#0f172a', fontSize: '12px', fontWeight: 700 }}>{gr.gr_number}</td>
                        <td style={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}>{new Date(gr.receipt_date || Date.now()).toLocaleDateString('id-ID')}</td>
                        <td style={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}>{gr.warehouse_code}</td>
                        <td style={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}>{gr.supplier_name || '-'}</td>
                      </tr>
                    ))}
                    {filteredReceipts.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>Belum ada data barang masuk.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Riwayat Barang Keluar */}
              <div className="card" style={{ padding: '0', overflow: 'hidden', border: '2px solid #0f172a', borderRadius: '14px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
                <div style={{ padding: '16px 20px', borderBottom: '2.5px solid #d4af37', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '0.02em' }}>Riwayat Barang Keluar (Out)</h3>
                  <Link to="/barang-keluar" style={{ fontSize: '12px', fontWeight: 800, color: '#d4af37', textDecoration: 'none' }}>
                    Lihat Semua &rarr;
                  </Link>
                </div>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>No. Dokumen</th>
                      <th>Tanggal</th>
                      <th>Gudang</th>
                      <th>Tujuan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.slice(0, 3).map((gi) => (
                      <tr key={gi.id}>
                        <td style={{ color: '#0f172a', fontSize: '12px', fontWeight: 700 }}>{gi.gi_number}</td>
                        <td style={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}>{new Date(gi.issue_date || Date.now()).toLocaleDateString('id-ID')}</td>
                        <td style={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}>{gi.warehouse_code}</td>
                        <td style={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}>{gi.outlet_name || '-'}</td>
                      </tr>
                    ))}
                    {filteredIssues.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>Belum ada data barang keluar.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Tinjauan Permintaan Pembelian */}
      {reviewModalItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} color="#0f172a" />
                <h3 className="modal-title">Detail Pengajuan - {reviewModalItem.pr_number || `PR-2026-00${reviewModalItem.id}`}</h3>
              </div>
              <button onClick={() => setReviewModalItem(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
                &times;
              </button>
            </div>

            <div className="modal-body">
              {/* Request Metadata Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Pemohon</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{reviewModalItem.role}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Gudang Tujuan</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{reviewModalItem.warehouse_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Tanggal Ajuan</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{reviewModalItem.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Prioritas Urgensi</div>
                  <span className="badge-priority" style={{ marginTop: '2px', display: 'inline-block' }}>
                    {reviewModalItem.priority}
                  </span>
                </div>
              </div>

              {/* Items List Table */}
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: '#0f172a' }}>
                Daftar Rincian Barang yang Diajukan
              </h4>

              <table className="outbound-items-table" style={{ marginBottom: '16px' }}>
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Barang</th>
                    <th style={{ textAlign: 'center' }}>Jumlah</th>
                    <th>Satuan</th>
                    <th style={{ textAlign: 'center' }}>Urgensi</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewModalItem.items && reviewModalItem.items.length > 0 ? (
                    reviewModalItem.items.map((it, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{it.item_name}</div>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>
                          {parseFloat(it.quantity || 1)}
                        </td>
                        <td>{it.unit_name || 'Pcs'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: it.urgency === 'Tinggi' ? '#ffe4e6' : '#f1f5f9', color: it.urgency === 'Tinggi' ? '#be123c' : '#475569', fontWeight: 600 }}>
                            {it.urgency || 'Sedang'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>
                        Detail rincian barang diajukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Notes */}
              <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '6px', fontSize: '12.5px', color: '#475569' }}>
                <strong>Catatan Pemohon:</strong> {reviewModalItem.notes || 'Pengajuan barang persediaan stok'}
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between', borderTop: '1px solid #ebd9b0', padding: '14px 20px', display: 'flex', alignItems: 'center' }}>
              <div>
                {(reviewModalItem.status === 'Menunggu' || !reviewModalItem.status) && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const prToReject = reviewModalItem;
                        setReviewModalItem(null);
                        setRejectModalItem(prToReject);
                      }}
                      style={{
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Tolak Permintaan & Kirim Pesan WhatsApp"
                    >
                      <X size={13} />
                      <span>Tolak & Kirim WA</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprovePR(reviewModalItem)}
                      style={{
                        backgroundColor: '#16a34a',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Setujui dan langsung buka Form Pesanan Pembelian"
                    >
                      <Check size={13} />
                      <span>Setujui Permintaan</span>
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setReviewModalItem(null)}
                className="btn-dark"
                style={{ padding: '8px 22px', fontSize: '13px', borderRadius: '8px' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail Barang Persediaan untuk Master */}
      {selectedItemDetail && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', border: '1.5px solid #ebd9b0', borderRadius: '16px' }}>
            <div className="modal-header" style={{ borderBottom: '1.5px solid #ebd9b0', background: 'linear-gradient(180deg, #fdfbf7 0%, #ffffff 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} color="#8a6515" />
                <h3 className="modal-title" style={{ color: '#1c1917', fontWeight: 800 }}>
                  Rincian Stok Barang &mdash; {selectedItemDetail.item_name}
                </h3>
              </div>
              <button onClick={() => setSelectedItemDetail(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#78716c' }}>
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1c1917' }}>
                  {selectedItemDetail.item_name}
                </div>
                <div style={{ fontSize: '12.5px', color: '#78716c', marginTop: '2px' }}>
                  Kategori: <strong style={{ color: '#3d2f17' }}>{selectedItemDetail.category_name || '-'}</strong> &bull; Satuan: <strong style={{ color: '#3d2f17' }}>{selectedItemDetail.unit_name || 'Pcs'}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#fcfbf8', padding: '16px', borderRadius: '12px', border: '1px solid #ebd9b0', marginBottom: '18px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#78716c' }}>Lokasi Gudang</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1c1917', marginTop: '2px' }}>
                    {selectedItemDetail.warehouse_name} ({selectedItemDetail.warehouse_code})
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#78716c' }}>Harga Satuan</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#8a6515', marginTop: '2px' }}>
                    Rp {parseFloat(selectedItemDetail.unit_price || 0).toLocaleString('id-ID')}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#78716c' }}>Stok Fisik Tersimpan</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: parseFloat(selectedItemDetail.current_stock || 0) <= parseFloat(selectedItemDetail.minimum_stock || 10) ? '#dc2626' : '#15803d', marginTop: '2px' }}>
                    {parseFloat(selectedItemDetail.current_stock || 0).toLocaleString('id-ID')} {selectedItemDetail.unit_name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#78716c' }}>Total Valuasi Aset</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#8a6515', marginTop: '2px' }}>
                    Rp {Math.round(parseFloat(selectedItemDetail.current_stock || 0) * parseFloat(selectedItemDetail.unit_price || 0)).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#ffffff', padding: '12px', borderRadius: '10px', border: '1px solid #ebd9b0', marginBottom: '18px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#78716c' }}>Batas Minimum Restock</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#3d2f17' }}>
                    {selectedItemDetail.minimum_stock || 10} {selectedItemDetail.unit_name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#78716c' }}>Batas Kritis Bahaya</div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#dc2626' }}>
                    {selectedItemDetail.critical_stock || 5} {selectedItemDetail.unit_name}
                  </div>
                </div>
              </div>

              {selectedItemDetail.description && (
                <div style={{ fontSize: '12px', color: '#57534e', padding: '10px 14px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong>Keterangan:</strong> {selectedItemDetail.description}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ justifyContent: 'flex-end', borderTop: '1px solid #ebd9b0', padding: '14px 20px' }}>
              <button
                type="button"
                onClick={() => setSelectedItemDetail(null)}
                className="btn-dark"
                style={{ padding: '8px 22px', fontSize: '13px', borderRadius: '8px' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Modal Penolakan PR & Kirim Pesan WhatsApp */}
      <RejectPRModal
        isOpen={Boolean(rejectModalItem)}
        onClose={() => setRejectModalItem(null)}
        prItem={rejectModalItem}
        onSuccess={({ prNum, sentWa, phone }) => {
          setToastMsg(`Permintaan ${prNum} Ditolak${sentWa ? ` & WhatsApp ke ${phone} dibuka` : ''}.`);
          fetchDashboardData();
          setTimeout(() => setToastMsg(null), 4000);
        }}
      />

      {/* Modal Cetak Laporan Resmi Master */}
      <MasterPrintReportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        inventoryList={filteredInventory}
        categoriesList={categoriesList}
        dashboardData={data}
      />
    </div>
  );
};

export default MasterDashboard;
