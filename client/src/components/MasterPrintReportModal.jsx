import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Printer,
  X,
  Calendar,
  Package,
  LogIn,
  LogOut as LogOutIcon,
  FileText,
  DollarSign,
  Filter,
  CheckCircle,
  Eye,
  Building,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';

const MasterPrintReportModal = ({
  isOpen,
  onClose,
  inventoryList = [],
  categoriesList = [],
  dashboardData = null
}) => {
  // Report selection state
  const [reportType, setReportType] = useState('STOK_PERSEDIAAN');
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [datePreset, setDatePreset] = useState('ALL');
  
  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Preview tab within modal
  const [activeTab, setActiveTab] = useState('config'); // 'config' or 'preview'

  // Data cache
  const [dataCache, setDataCache] = useState({
    receipts: null,
    issues: null,
    purchaseOrders: null,
    purchaseRequests: null
  });
  const [loadingData, setLoadingData] = useState(false);

  // Fetch full data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchFullReportData();
    }
  }, [isOpen]);

  const fetchFullReportData = async () => {
    setLoadingData(true);
    try {
      const [grRes, giRes, poRes, prRes] = await Promise.all([
        api.get('/goods-receipts').catch(() => ({ data: [] })),
        api.get('/goods-issues').catch(() => ({ data: [] })),
        api.get('/purchase-orders').catch(() => ({ data: [] })),
        api.get('/purchase-requests').catch(() => ({ data: [] }))
      ]);
      setDataCache({
        receipts: grRes.data || [],
        issues: giRes.data || [],
        purchaseOrders: poRes.data || [],
        purchaseRequests: prRes.data || []
      });
    } catch (err) {
      console.error('Error loading report datasets:', err);
    } finally {
      setLoadingData(false);
    }
  };

  if (!isOpen) return null;

  // Handle Preset Changes
  const handlePresetChange = (preset) => {
    setDatePreset(preset);
    if (preset === 'THIS_MONTH') {
      setStartDate(firstDayOfMonth);
      setEndDate(todayStr);
    } else if (preset === 'LAST_7_DAYS') {
      setStartDate(sevenDaysAgo);
      setEndDate(todayStr);
    } else if (preset === 'TODAY') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Helper date checker
  const isDateInRange = (dateStr) => {
    if (datePreset === 'ALL' || (!startDate && !endDate)) return true;
    if (!dateStr) return true;
    try {
      const d = new Date(dateStr).toISOString().split('T')[0];
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    } catch (e) {
      return true;
    }
  };

  // Helper warehouse checker
  const isWarehouseMatch = (whId, whCode = '') => {
    if (selectedWarehouse === 'ALL') return true;
    if (String(whId) === String(selectedWarehouse)) return true;
    if (selectedWarehouse === '1' && (whCode === 'WH-DG' || String(whId) === '1')) return true;
    if (selectedWarehouse === '2' && (whCode === 'WH-WH' || String(whId) === '2')) return true;
    return false;
  };

  // Helper text formatters
  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  const formatRupiah = (num) => {
    return 'Rp ' + Math.round(parseFloat(num || 0)).toLocaleString('id-ID');
  };

  // Warehouse Label
  const getWarehouseLabel = () => {
    if (selectedWarehouse === '1') return 'Gudang Utama Hotel (WH-DG)';
    if (selectedWarehouse === '2') return 'Gudang White House (WH-WH)';
    return 'Semua Gudang (Konsolidasi WH-DG & WH-WH)';
  };

  // Period Label
  const getPeriodLabel = () => {
    if (datePreset === 'ALL' || (!startDate && !endDate)) return 'Semua Periode Data';
    if (startDate && endDate) {
      if (startDate === endDate) return `Tanggal ${formatDateIndo(startDate)}`;
      return `${formatDateIndo(startDate)} s/d ${formatDateIndo(endDate)}`;
    }
    if (startDate) return `Sejak ${formatDateIndo(startDate)}`;
    if (endDate) return `Hingga ${formatDateIndo(endDate)}`;
    return 'Semua Periode';
  };

  // Compute Active Report Content & Rows
  const getReportData = () => {
    switch (reportType) {
      case 'STOK_PERSEDIAAN': {
        const rows = inventoryList.filter(item => {
          const matchWh = isWarehouseMatch(item.warehouse_id, item.warehouse_code);
          const matchCat = selectedCategory === 'ALL' || item.category_name === selectedCategory;
          
          const curr = parseFloat(item.current_stock || 0);
          const min = parseFloat(item.minimum_stock || 10);
          const crit = parseFloat(item.critical_stock || 5);
          let st = 'Aman';
          if (curr <= crit) st = 'Kritis';
          else if (curr <= min) st = 'Menipis';
          const matchSt = selectedStatus === 'ALL' || st === selectedStatus;

          return matchWh && matchCat && matchSt;
        });

        const totalQty = rows.reduce((acc, i) => acc + parseFloat(i.current_stock || 0), 0);
        const totalVal = rows.reduce((acc, i) => acc + (parseFloat(i.current_stock || 0) * parseFloat(i.unit_price || 0)), 0);

        return {
          title: 'LAPORAN REKAPITULASI STOK PERSEDIAAN GUDANG',
          code: 'REP-INV',
          totalRows: rows.length,
          kpi1: { label: 'Total Item Terdaftar', value: `${rows.length} Item` },
          kpi2: { label: 'Akumulasi Stok Fisik', value: `${Math.round(totalQty).toLocaleString('id-ID')} Unit` },
          kpi3: { label: 'Total Valuasi Aset', value: formatRupiah(totalVal) },
          rows,
          totalQty,
          totalVal
        };
      }

      case 'BARANG_MASUK': {
        const rawReceipts = dataCache.receipts && dataCache.receipts.length > 0 
          ? dataCache.receipts 
          : (dashboardData?.recent_receipts || []);

        const rows = rawReceipts.filter(gr => {
          const matchDate = isDateInRange(gr.receipt_date || gr.created_at);
          const matchWh = isWarehouseMatch(gr.warehouse_id, gr.warehouse_code);
          return matchDate && matchWh;
        });

        const totalItemsCount = rows.reduce((acc, gr) => {
          if (gr.items && Array.isArray(gr.items)) {
            return acc + gr.items.reduce((s, it) => s + parseFloat(it.quantity || 0), 0);
          }
          return acc + parseFloat(gr.quantity || 1);
        }, 0);

        const supplierCount = new Set(rows.map(gr => gr.supplier_name || 'Vendor')).size;

        return {
          title: 'LAPORAN TRANSAKSI PENERIMAAN BARANG MASUK (GOODS RECEIPT)',
          code: 'REP-GR',
          totalRows: rows.length,
          kpi1: { label: 'Total Dokumen Masuk', value: `${rows.length} Transaksi` },
          kpi2: { label: 'Total Kuantitas Masuk', value: `${Math.round(totalItemsCount).toLocaleString('id-ID')} Unit Fisik` },
          kpi3: { label: 'Rekanan Supplier', value: `${supplierCount} Vendor Aktif` },
          rows,
          totalItemsCount
        };
      }

      case 'BARANG_KELUAR': {
        const rawIssues = dataCache.issues && dataCache.issues.length > 0 
          ? dataCache.issues 
          : (dashboardData?.recent_issues || []);

        const rows = rawIssues.filter(gi => {
          const matchDate = isDateInRange(gi.issue_date || gi.created_at);
          const matchWh = isWarehouseMatch(gi.warehouse_id, gi.warehouse_code);
          return matchDate && matchWh;
        });

        const totalDistributed = rows.reduce((acc, gi) => {
          if (gi.items && Array.isArray(gi.items)) {
            return acc + gi.items.reduce((s, it) => s + parseFloat(it.quantity || 0), 0);
          }
          return acc + parseFloat(gi.quantity || 1);
        }, 0);

        const outletCount = new Set(rows.map(gi => gi.outlet_name || 'Operasional')).size;

        return {
          title: 'LAPORAN TRANSAKSI PENGELUARAN BARANG GUDANG (GOODS ISSUE)',
          code: 'REP-GI',
          totalRows: rows.length,
          kpi1: { label: 'Total Dokumen Keluar', value: `${rows.length} Transaksi` },
          kpi2: { label: 'Total Kuantitas Keluar', value: `${Math.round(totalDistributed).toLocaleString('id-ID')} Unit Fisik` },
          kpi3: { label: 'Outlet / Departemen', value: `${outletCount} Unit Tujuan` },
          rows,
          totalDistributed
        };
      }

      case 'PURCHASE_ORDER': {
        const rawPOs = dataCache.purchaseOrders && dataCache.purchaseOrders.length > 0 
          ? dataCache.purchaseOrders 
          : (dashboardData?.recent_orders || []);

        const rows = rawPOs.filter(po => {
          const matchDate = isDateInRange(po.po_date || po.created_at);
          const matchWh = isWarehouseMatch(po.warehouse_id, po.warehouse_code);
          return matchDate && matchWh;
        });

        const totalAmount = rows.reduce((acc, po) => acc + parseFloat(po.total_amount || 0), 0);

        return {
          title: 'LAPORAN REKAPITULASI PESANAN PEMBELIAN (PURCHASE ORDER)',
          code: 'REP-PO',
          totalRows: rows.length,
          kpi1: { label: 'Total Pesanan Pembelian', value: `${rows.length} Dokumen` },
          kpi2: { label: 'Akumulasi Biaya PO', value: formatRupiah(totalAmount) },
          kpi3: { label: 'Periode Pembelian', value: getPeriodLabel() },
          rows,
          totalAmount
        };
      }

      case 'PURCHASE_REQUEST': {
        const rawPRs = dataCache.purchaseRequests && dataCache.purchaseRequests.length > 0 
          ? dataCache.purchaseRequests 
          : (dashboardData?.all_requests || dashboardData?.pending_requests || []);

        const rows = rawPRs.filter(pr => {
          const matchDate = isDateInRange(pr.created_at);
          const matchWh = isWarehouseMatch(pr.warehouse_id, pr.warehouse_code);
          return matchDate && matchWh;
        });

        const approvedCount = rows.filter(pr => pr.status === 'Disetujui' || pr.status === 'Dipenuhi').length;
        const pendingCount = rows.filter(pr => pr.status === 'Menunggu' || pr.status === 'Pending').length;

        return {
          title: 'LAPORAN PENGAJUAN PERMINTAAN PEMBELIAN (PURCHASE REQUEST)',
          code: 'REP-PR',
          totalRows: rows.length,
          kpi1: { label: 'Total Dokumen PR', value: `${rows.length} Pengajuan` },
          kpi2: { label: 'Status Disetujui', value: `${approvedCount} Dokumen` },
          kpi3: { label: 'Menunggu Persetujuan', value: `${pendingCount} Dokumen` },
          rows
        };
      }

      case 'VALUASI_MUTASI': {
        // Categories valuation summary
        const catMap = {};
        inventoryList.forEach(item => {
          if (!isWarehouseMatch(item.warehouse_id, item.warehouse_code)) return;
          const cat = item.category_name || 'Lain-lain';
          if (!catMap[cat]) {
            catMap[cat] = { category: cat, totalSku: 0, totalUnits: 0, totalValuation: 0 };
          }
          catMap[cat].totalSku += 1;
          const qty = parseFloat(item.current_stock || 0);
          catMap[cat].totalUnits += qty;
          catMap[cat].totalValuation += qty * parseFloat(item.unit_price || 0);
        });
        const rows = Object.values(catMap);

        const grandValuation = rows.reduce((acc, r) => acc + r.totalValuation, 0);
        const grandUnits = rows.reduce((acc, r) => acc + r.totalUnits, 0);

        return {
          title: 'LAPORAN REKAPITULASI VALUASI ASET & KATEGORI PERSEDIAAN',
          code: 'REP-VAL',
          totalRows: rows.length,
          kpi1: { label: 'Total Kategori Aset', value: `${rows.length} Kategori` },
          kpi2: { label: 'Akumulasi Kuantitas', value: `${Math.round(grandUnits).toLocaleString('id-ID')} Unit` },
          kpi3: { label: 'Total Nilai Persediaan', value: formatRupiah(grandValuation) },
          rows,
          grandValuation,
          grandUnits
        };
      }

      default:
        return { title: 'LAPORAN LOGISTIK', totalRows: 0, rows: [] };
    }
  };

  const reportData = getReportData();

  // Trigger Print Dialog
  const handlePrint = () => {
    window.print();
  };

  // Render Table depending on reportType
  const renderTableContent = () => {
    switch (reportType) {
      case 'STOK_PERSEDIAAN':
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', fontFamily: 'Arial, sans-serif' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderTop: '1.5px solid #334155', borderBottom: '1.5px solid #334155' }}>
                <th style={{ padding: '6px 4px', textAlign: 'center', width: '30px', border: '1px solid #cbd5e1' }}>NO</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1' }}>NAMA BARANG</th>
                <th style={{ padding: '6px', textAlign: 'left', width: '130px', border: '1px solid #cbd5e1' }}>KATEGORI</th>
                <th style={{ padding: '6px', textAlign: 'center', width: '80px', border: '1px solid #cbd5e1' }}>GUDANG</th>
                <th style={{ padding: '6px', textAlign: 'right', width: '70px', border: '1px solid #cbd5e1' }}>STOK FISIK</th>
                <th style={{ padding: '6px', textAlign: 'center', width: '50px', border: '1px solid #cbd5e1' }}>SATUAN</th>
                <th style={{ padding: '6px', textAlign: 'center', width: '80px', border: '1px solid #cbd5e1' }}>BATAS MIN/KRIT</th>
                <th style={{ padding: '6px', textAlign: 'right', width: '90px', border: '1px solid #cbd5e1' }}>HARGA SATUAN</th>
                <th style={{ padding: '6px', textAlign: 'right', width: '110px', border: '1px solid #cbd5e1' }}>VALUASI (RP)</th>
                <th style={{ padding: '6px', textAlign: 'center', width: '65px', border: '1px solid #cbd5e1' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {reportData.rows.map((item, idx) => {
                const curr = parseFloat(item.current_stock || 0);
                const min = parseFloat(item.minimum_stock || 10);
                const crit = parseFloat(item.critical_stock || 5);
                const price = parseFloat(item.unit_price || 0);
                const val = curr * price;

                let st = 'AMAN';
                let stStyle = { fontWeight: 'bold', color: '#166534' };
                if (curr <= crit) {
                  st = 'KRITIS';
                  stStyle = { fontWeight: 'bold', color: '#991b1b' };
                } else if (curr <= min) {
                  st = 'MENIPIS';
                  stStyle = { fontWeight: 'bold', color: '#b45309' };
                }

                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: idx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                    <td style={{ padding: '5px 4px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{idx + 1}</td>
                    <td style={{ padding: '5px 6px', fontWeight: 'bold', border: '1px solid #e2e8f0' }}>{item.item_name}</td>
                    <td style={{ padding: '5px 6px', border: '1px solid #e2e8f0' }}>{item.category_name}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{item.warehouse_code || 'WH-DG'}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 'bold', border: '1px solid #e2e8f0' }}>{Math.round(curr).toLocaleString('id-ID')}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{item.unit_name || 'PCS'}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'center', fontSize: '8pt', border: '1px solid #e2e8f0' }}>{min} / {crit}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', border: '1px solid #e2e8f0' }}>{Math.round(price).toLocaleString('id-ID')}</td>
                    <td style={{ padding: '5px 6px', textAlign: 'right', fontWeight: 'bold', border: '1px solid #e2e8f0' }}>{Math.round(val).toLocaleString('id-ID')}</td>
                    <td style={{ padding: '5px 4px', textAlign: 'center', border: '1px solid #e2e8f0', ...stStyle }}>{st}</td>
                  </tr>
                );
              })}
              {reportData.rows.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Tidak ada data stok persediaan yang cocok dengan filter kriteria.
                  </td>
                </tr>
              )}
            </tbody>
            {reportData.rows.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', borderTop: '2px solid #334155', borderBottom: '2px solid #334155' }}>
                  <td colSpan="4" style={{ padding: '7px 8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                    TOTAL KESELURUHAN PERSEDIAAN ({reportData.rows.length} Item)
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', border: '1px solid #cbd5e1' }}>
                    {Math.round(reportData.totalQty).toLocaleString('id-ID')}
                  </td>
                  <td colSpan="3" style={{ padding: '7px 6px', textAlign: 'right', border: '1px solid #cbd5e1' }}>
                    TOTAL VALUASI FISIK :
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'right', border: '1px solid #cbd5e1' }}>
                    {formatRupiah(reportData.totalVal)}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1' }}></td>
                </tr>
              </tfoot>
            )}
          </table>
        );

      case 'BARANG_MASUK':
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', fontFamily: 'Arial, sans-serif' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderTop: '1.5px solid #334155', borderBottom: '1.5px solid #334155' }}>
                <th style={{ padding: '7px 4px', textAlign: 'center', width: '32px', border: '1px solid #cbd5e1' }}>NO</th>
                <th style={{ padding: '7px 6px', textAlign: 'left', width: '115px', border: '1px solid #cbd5e1' }}>NO. DOKUMEN GR</th>
                <th style={{ padding: '7px 6px', textAlign: 'center', width: '80px', border: '1px solid #cbd5e1' }}>TANGGAL</th>
                <th style={{ padding: '7px 8px', textAlign: 'left', width: '135px', border: '1px solid #cbd5e1' }}>VENDOR / SUPPLIER</th>
                <th style={{ padding: '7px 6px', textAlign: 'center', width: '60px', border: '1px solid #cbd5e1' }}>GUDANG</th>
                <th style={{ padding: '7px 8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>RINCIAN BARANG MASUK</th>
                <th style={{ padding: '7px 6px', textAlign: 'center', width: '95px', border: '1px solid #cbd5e1' }}>NO. PO REF</th>
              </tr>
            </thead>
            <tbody>
              {reportData.rows.map((gr, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: idx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                  <td style={{ padding: '7px 4px', textAlign: 'center', verticalAlign: 'top', border: '1px solid #e2e8f0', color: '#475569', fontSize: '8.5pt' }}>{idx + 1}</td>
                  <td style={{ padding: '7px 6px', verticalAlign: 'top', fontWeight: 'bold', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '8.5pt' }}>{gr.gr_number}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', verticalAlign: 'top', border: '1px solid #e2e8f0', color: '#334155', fontSize: '8.5pt' }}>{formatDateIndo(gr.receipt_date || gr.created_at)}</td>
                  <td style={{ padding: '7px 8px', verticalAlign: 'top', fontWeight: 600, border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '8.5pt' }}>{gr.supplier_name || '-'}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', verticalAlign: 'top', border: '1px solid #e2e8f0', fontSize: '8.5pt' }}>
                    <span style={{ display: 'inline-block', padding: '1px 5px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '3px', fontWeight: 600, fontSize: '8pt' }}>
                      {gr.warehouse_code || 'WH-DG'}
                    </span>
                  </td>
                  <td style={{ padding: '5px 8px', verticalAlign: 'top', border: '1px solid #e2e8f0' }}>
                    {gr.items && Array.isArray(gr.items) && gr.items.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {gr.items.map((it, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '3px 8px',
                              backgroundColor: i % 2 === 0 ? '#f8fafc' : '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '3px',
                              fontSize: '8.5pt'
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{it.item_name}</span>
                            <span style={{
                              fontWeight: 700,
                              color: '#1e293b',
                              marginLeft: '12px',
                              whiteSpace: 'nowrap',
                              padding: '1px 6px',
                              backgroundColor: '#e2e8f0',
                              borderRadius: '3px',
                              fontSize: '8pt'
                            }}>
                              {parseFloat(it.quantity).toLocaleString('id-ID')} {it.unit_name || 'Unit'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '3px 8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        fontSize: '8.5pt'
                      }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{gr.item_name || 'Barang persediaan'}</span>
                        <span style={{
                          fontWeight: 700,
                          color: '#1e293b',
                          marginLeft: '12px',
                          whiteSpace: 'nowrap',
                          padding: '1px 6px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '3px',
                          fontSize: '8pt'
                        }}>
                          {parseFloat(gr.quantity || 1).toLocaleString('id-ID')} {gr.unit_name || 'Unit'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', verticalAlign: 'top', border: '1px solid #e2e8f0', fontSize: '8.5pt' }}>
                    {gr.po_number ? (
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{gr.po_number}</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
              {reportData.rows.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Tidak ada data barang masuk pada kriteria periode ini.
                  </td>
                </tr>
              )}
            </tbody>
            {reportData.rows.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #334155' }}>
                  <td colSpan="5" style={{ padding: '8px 12px', textAlign: 'right', border: '1px solid #cbd5e1', fontSize: '9pt', color: '#334155' }}>
                    TOTAL AKUMULASI PENERIMAAN ({reportData.rows.length} DOKUMEN):
                  </td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontSize: '9pt', color: '#0f172a' }}>
                    <strong>{reportData.totalItemsCount.toLocaleString('id-ID')} Unit Fisik Diterima</strong>
                  </td>
                  <td style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#94a3b8', fontSize: '8.5pt' }}>
                    -
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        );

      case 'BARANG_KELUAR':
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', fontFamily: 'Arial, sans-serif' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderTop: '1.5px solid #334155', borderBottom: '1.5px solid #334155' }}>
                <th style={{ padding: '7px 4px', textAlign: 'center', width: '32px', border: '1px solid #cbd5e1' }}>NO</th>
                <th style={{ padding: '7px 6px', textAlign: 'left', width: '115px', border: '1px solid #cbd5e1' }}>NO. DOKUMEN GI</th>
                <th style={{ padding: '7px 6px', textAlign: 'center', width: '80px', border: '1px solid #cbd5e1' }}>TANGGAL</th>
                <th style={{ padding: '7px 6px', textAlign: 'center', width: '60px', border: '1px solid #cbd5e1' }}>GUDANG</th>
                <th style={{ padding: '7px 8px', textAlign: 'left', width: '135px', border: '1px solid #cbd5e1' }}>TUJUAN OUTLET / DEPT</th>
                <th style={{ padding: '7px 8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>RINCIAN BARANG KELUAR</th>
                <th style={{ padding: '7px 6px', textAlign: 'left', width: '100px', border: '1px solid #cbd5e1' }}>PENERIMA</th>
              </tr>
            </thead>
            <tbody>
              {reportData.rows.map((gi, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: idx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                  <td style={{ padding: '7px 4px', textAlign: 'center', verticalAlign: 'top', border: '1px solid #e2e8f0', color: '#475569', fontSize: '8.5pt' }}>{idx + 1}</td>
                  <td style={{ padding: '7px 6px', verticalAlign: 'top', fontWeight: 'bold', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '8.5pt' }}>{gi.gi_number}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', verticalAlign: 'top', border: '1px solid #e2e8f0', color: '#334155', fontSize: '8.5pt' }}>{formatDateIndo(gi.issue_date || gi.created_at)}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', verticalAlign: 'top', border: '1px solid #e2e8f0', fontSize: '8.5pt' }}>
                    <span style={{ display: 'inline-block', padding: '1px 5px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '3px', fontWeight: 600, fontSize: '8pt' }}>
                      {gi.warehouse_code || 'WH-DG'}
                    </span>
                  </td>
                  <td style={{ padding: '7px 8px', verticalAlign: 'top', fontWeight: 600, border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '8.5pt' }}>{gi.outlet_name || 'Operasional Hotel'}</td>
                  <td style={{ padding: '5px 8px', verticalAlign: 'top', border: '1px solid #e2e8f0' }}>
                    {gi.items && Array.isArray(gi.items) && gi.items.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {gi.items.map((it, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '3px 8px',
                              backgroundColor: i % 2 === 0 ? '#f8fafc' : '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '3px',
                              fontSize: '8.5pt'
                            }}
                          >
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{it.item_name}</span>
                            <span style={{
                              fontWeight: 700,
                              color: '#1e293b',
                              marginLeft: '12px',
                              whiteSpace: 'nowrap',
                              padding: '1px 6px',
                              backgroundColor: '#e2e8f0',
                              borderRadius: '3px',
                              fontSize: '8pt'
                            }}>
                              {parseFloat(it.quantity).toLocaleString('id-ID')} {it.unit_name || 'Unit'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '3px 8px',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '3px',
                        fontSize: '8.5pt'
                      }}>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{gi.item_name || 'Barang distribusi'}</span>
                        <span style={{
                          fontWeight: 700,
                          color: '#1e293b',
                          marginLeft: '12px',
                          whiteSpace: 'nowrap',
                          padding: '1px 6px',
                          backgroundColor: '#e2e8f0',
                          borderRadius: '3px',
                          fontSize: '8pt'
                        }}>
                          {parseFloat(gi.quantity || 1).toLocaleString('id-ID')} {gi.unit_name || 'Unit'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '7px 6px', verticalAlign: 'top', border: '1px solid #e2e8f0', fontSize: '8.5pt', color: '#334155' }}>
                    {gi.recipient_name || gi.receiver || '-'}
                  </td>
                </tr>
              ))}
              {reportData.rows.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Tidak ada data barang keluar pada kriteria periode ini.
                  </td>
                </tr>
              )}
            </tbody>
            {reportData.rows.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #334155' }}>
                  <td colSpan="5" style={{ padding: '8px 12px', textAlign: 'right', border: '1px solid #cbd5e1', fontSize: '9pt', color: '#334155' }}>
                    TOTAL AKUMULASI PENGELUARAN ({reportData.rows.length} DOKUMEN):
                  </td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontSize: '9pt', color: '#0f172a' }}>
                    <strong>{reportData.totalDistributed.toLocaleString('id-ID')} Unit Didistribusikan</strong>
                  </td>
                  <td style={{ padding: '8px 6px', border: '1px solid #cbd5e1', textAlign: 'center', color: '#94a3b8', fontSize: '8.5pt' }}>
                    -
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        );

      case 'PURCHASE_ORDER':
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', fontFamily: 'Arial, sans-serif' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderTop: '1.5px solid #334155', borderBottom: '1.5px solid #334155' }}>
                <th style={{ padding: '7px 4px', textAlign: 'center', width: '32px', border: '1px solid #cbd5e1' }}>NO</th>
                <th style={{ padding: '7px 6px', textAlign: 'left', width: '130px', border: '1px solid #cbd5e1' }}>NO. PURCHASE ORDER</th>
                <th style={{ padding: '7px 6px', textAlign: 'center', width: '85px', border: '1px solid #cbd5e1' }}>TANGGAL PO</th>
                <th style={{ padding: '7px 8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>SUPPLIER / VENDOR</th>
                <th style={{ padding: '7px 6px', textAlign: 'center', width: '65px', border: '1px solid #cbd5e1' }}>GUDANG</th>
                <th style={{ padding: '7px 8px', textAlign: 'right', width: '130px', border: '1px solid #cbd5e1' }}>NILAI PO (RP)</th>
                <th style={{ padding: '7px 6px', textAlign: 'center', width: '90px', border: '1px solid #cbd5e1' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {reportData.rows.map((po, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: idx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                  <td style={{ padding: '7px 4px', textAlign: 'center', verticalAlign: 'top', border: '1px solid #e2e8f0', color: '#475569', fontSize: '8.5pt' }}>{idx + 1}</td>
                  <td style={{ padding: '7px 6px', verticalAlign: 'top', fontWeight: 'bold', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '8.5pt' }}>{po.po_number}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', verticalAlign: 'top', border: '1px solid #e2e8f0', color: '#334155', fontSize: '8.5pt' }}>{formatDateIndo(po.po_date || po.created_at)}</td>
                  <td style={{ padding: '7px 8px', verticalAlign: 'top', fontWeight: 600, border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '8.5pt' }}>{po.supplier_name}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', verticalAlign: 'top', border: '1px solid #e2e8f0', fontSize: '8.5pt' }}>
                    <span style={{ display: 'inline-block', padding: '1px 5px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '3px', fontWeight: 600, fontSize: '8pt' }}>
                      {po.warehouse_code || 'WH-DG'}
                    </span>
                  </td>
                  <td style={{ padding: '7px 8px', textAlign: 'right', verticalAlign: 'top', fontWeight: 'bold', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '8.5pt' }}>
                    {formatRupiah(po.total_amount)}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', verticalAlign: 'top', fontWeight: 'bold', border: '1px solid #e2e8f0', fontSize: '8.5pt' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '8pt',
                      backgroundColor: po.status === 'Selesai' ? '#dcfce7' : '#eff6ff',
                      color: po.status === 'Selesai' ? '#15803d' : '#1d4ed8',
                      border: `1px solid ${po.status === 'Selesai' ? '#bbf7d0' : '#bfdbfe'}`
                    }}>
                      {po.status || 'Dipesan'}
                    </span>
                  </td>
                </tr>
              ))}
              {reportData.rows.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Tidak ada transaksi Purchase Order pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
            {reportData.rows.length > 0 && (
              <tfoot>
                <tr style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #334155' }}>
                  <td colSpan="5" style={{ padding: '8px 12px', textAlign: 'right', border: '1px solid #cbd5e1', fontSize: '9pt', color: '#334155' }}>
                    TOTAL AKUMULASI PENGADAAN (PO):
                  </td>
                  <td style={{ padding: '8px 8px', textAlign: 'right', border: '1px solid #cbd5e1', fontSize: '9.5pt', color: '#0f172a' }}>
                    {formatRupiah(reportData.totalAmount)}
                  </td>
                  <td style={{ border: '1px solid #cbd5e1' }}></td>
                </tr>
              </tfoot>
            )}
          </table>
        );

      case 'PURCHASE_REQUEST':
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', fontFamily: 'Arial, sans-serif' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderTop: '1.5px solid #334155', borderBottom: '1.5px solid #334155' }}>
                <th style={{ padding: '7px 4px', textAlign: 'center', width: '32px', border: '1px solid #cbd5e1' }}>NO</th>
                <th style={{ padding: '7px 6px', textAlign: 'left', width: '130px', border: '1px solid #cbd5e1' }}>NO. DOKUMEN PR</th>
                <th style={{ padding: '7px 6px', textAlign: 'center', width: '85px', border: '1px solid #cbd5e1' }}>TANGGAL</th>
                <th style={{ padding: '7px 8px', textAlign: 'left', width: '130px', border: '1px solid #cbd5e1' }}>PEMOHON</th>
                <th style={{ padding: '7px 6px', textAlign: 'center', width: '65px', border: '1px solid #cbd5e1' }}>GUDANG</th>
                <th style={{ padding: '7px 8px', textAlign: 'left', border: '1px solid #cbd5e1' }}>CATATAN / KEBUTUHAN</th>
                <th style={{ padding: '7px 6px', textAlign: 'center', width: '90px', border: '1px solid #cbd5e1' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {reportData.rows.map((pr, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: idx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                  <td style={{ padding: '7px 4px', textAlign: 'center', verticalAlign: 'top', border: '1px solid #e2e8f0', color: '#475569', fontSize: '8.5pt' }}>{idx + 1}</td>
                  <td style={{ padding: '7px 6px', verticalAlign: 'top', fontWeight: 'bold', border: '1px solid #e2e8f0', color: '#0f172a', fontSize: '8.5pt' }}>{pr.pr_number}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', verticalAlign: 'top', border: '1px solid #e2e8f0', color: '#334155', fontSize: '8.5pt' }}>{formatDateIndo(pr.created_at)}</td>
                  <td style={{ padding: '7px 8px', verticalAlign: 'top', fontWeight: 600, border: '1px solid #e2e8f0', color: '#1e293b', fontSize: '8.5pt' }}>{pr.requester_name || pr.role || 'Petugas Gudang'}</td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', verticalAlign: 'top', border: '1px solid #e2e8f0', fontSize: '8.5pt' }}>
                    <span style={{ display: 'inline-block', padding: '1px 5px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '3px', fontWeight: 600, fontSize: '8pt' }}>
                      {pr.warehouse_code || 'WH-DG'}
                    </span>
                  </td>
                  <td style={{ padding: '7px 8px', verticalAlign: 'top', border: '1px solid #e2e8f0', fontSize: '8.5pt', color: '#334155' }}>
                    {pr.notes || 'Pengajuan kebutuhan stok rutin'}
                  </td>
                  <td style={{ padding: '7px 6px', textAlign: 'center', verticalAlign: 'top', fontWeight: 'bold', border: '1px solid #e2e8f0', fontSize: '8.5pt' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '8pt',
                      backgroundColor: pr.status === 'Disetujui' ? '#dcfce7' : pr.status === 'Ditolak' ? '#fee2e2' : '#fef3c7',
                      color: pr.status === 'Disetujui' ? '#15803d' : pr.status === 'Ditolak' ? '#b91c1c' : '#b45309',
                      border: `1px solid ${pr.status === 'Disetujui' ? '#bbf7d0' : pr.status === 'Ditolak' ? '#fecaca' : '#fde68a'}`
                    }}>
                      {pr.status || 'Menunggu'}
                    </span>
                  </td>
                </tr>
              ))}
              {reportData.rows.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                    Tidak ada data pengajuan Purchase Request pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        );

      case 'VALUASI_MUTASI':
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9pt', fontFamily: 'Arial, sans-serif' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderTop: '1.5px solid #334155', borderBottom: '1.5px solid #334155' }}>
                <th style={{ padding: '6px 4px', textAlign: 'center', width: '35px', border: '1px solid #cbd5e1' }}>NO</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #cbd5e1' }}>KATEGORI ASET / BARANG</th>
                <th style={{ padding: '6px', textAlign: 'center', width: '100px', border: '1px solid #cbd5e1' }}>JUMLAH ITEM</th>
                <th style={{ padding: '6px', textAlign: 'right', width: '130px', border: '1px solid #cbd5e1' }}>TOTAL FISIK (UNIT)</th>
                <th style={{ padding: '6px', textAlign: 'right', width: '160px', border: '1px solid #cbd5e1' }}>TOTAL VALUASI (RP)</th>
                <th style={{ padding: '6px', textAlign: 'center', width: '110px', border: '1px solid #cbd5e1' }}>PORSI VALUASI</th>
              </tr>
            </thead>
            <tbody>
              {reportData.rows.map((row, idx) => {
                const percent = reportData.grandValuation > 0 
                  ? ((row.totalValuation / reportData.grandValuation) * 100).toFixed(1) 
                  : '0.0';
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: idx % 2 === 1 ? '#fafafa' : '#ffffff' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{idx + 1}</td>
                    <td style={{ padding: '6px', fontWeight: 'bold', border: '1px solid #e2e8f0' }}>{row.category}</td>
                    <td style={{ padding: '6px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{row.totalSku} Item</td>
                    <td style={{ padding: '6px', textAlign: 'right', fontWeight: '600', border: '1px solid #e2e8f0' }}>{Math.round(row.totalUnits).toLocaleString('id-ID')}</td>
                    <td style={{ padding: '6px', textAlign: 'right', fontWeight: 'bold', border: '1px solid #e2e8f0' }}>{formatRupiah(row.totalValuation)}</td>
                    <td style={{ padding: '6px', textAlign: 'center', fontWeight: '600', border: '1px solid #e2e8f0' }}>{percent}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', borderTop: '2px solid #334155' }}>
                <td colSpan="2" style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                  TOTAL AKUMULASI NILAI PERSEDIAAN
                </td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>
                  {reportData.rows.reduce((acc, r) => acc + r.totalSku, 0)} Item
                </td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #cbd5e1' }}>
                  {Math.round(reportData.grandUnits).toLocaleString('id-ID')}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #cbd5e1' }}>
                  {formatRupiah(reportData.grandValuation)}
                </td>
                <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #cbd5e1' }}>100.0%</td>
              </tr>
            </tfoot>
          </table>
        );

      default:
        return null;
    }
  };

  // Reusable Document Template (rendered both in Modal Preview and in .official-print-document)
  const renderOfficialPrintDocument = () => {
    return (
      <div style={{ backgroundColor: '#ffffff', color: '#000000', padding: '16px', fontFamily: 'Arial, sans-serif' }}>
        
        {/* KOP SURAT RESMI */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{ fontSize: '18pt', fontWeight: 'bold', letterSpacing: '1.5px', color: '#000000', fontFamily: 'serif' }}>
            DANGAU HOTELS & RESORTS
          </div>
          <div style={{ fontSize: '10pt', fontWeight: 'bold', color: '#1e293b', marginTop: '2px' }}>
            DANGAU KUBU RAYA — DIVISION LOGISTICS & INVENTORY
          </div>
          <div style={{ fontSize: '8.5pt', color: '#334155', marginTop: '2px' }}>
            Jl. Arteri Supadio Km. 12 Sungai Raya, Kabupaten Kubu Raya, Kalimantan Barat 78391
          </div>
          <div style={{ fontSize: '8pt', color: '#475569', marginTop: '1px' }}>
            Telepon: (0561) 723-999 / +62 822-5046-3315 | Email: accounting@dangau.com | Web: www.dangauresort.com
          </div>
          {/* Double line divider */}
          <div style={{ borderTop: '1px solid #000000', borderBottom: '2.5px solid #000000', height: '3px', margin: '8px 0 14px 0' }} />
        </div>

        {/* JUDUL DOKUMEN & NOMOR */}
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '13pt', fontWeight: 'bold', margin: '0 0 4px 0', textDecoration: 'underline', color: '#000000', letterSpacing: '0.5px' }}>
            {reportData.title}
          </h2>
          <div style={{ fontSize: '9pt', color: '#475569', fontWeight: '600' }}>
            NO. DOKUMEN: DNG/{reportData.code || 'REP'}/{new Date().toISOString().slice(0, 10).replace(/-/g, '')}/001
          </div>
        </div>

        {/* METADATA PERIODE & GUDANG (2-Column Grid) */}
        <table style={{ width: '100%', marginBottom: '14px', fontSize: '9pt', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '15%', padding: '3px 0', fontWeight: 'bold' }}>Periode Data</td>
              <td style={{ width: '35%', padding: '3px 0' }}>: {getPeriodLabel()}</td>
              <td style={{ width: '18%', padding: '3px 0', fontWeight: 'bold' }}>Tanggal Cetak</td>
              <td style={{ width: '32%', padding: '3px 0' }}>: {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
            </tr>
            <tr>
              <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Lokasi Gudang</td>
              <td style={{ padding: '3px 0' }}>: {getWarehouseLabel()}</td>
              <td style={{ padding: '3px 0', fontWeight: 'bold' }}>Penanggung Jawab</td>
              <td style={{ padding: '3px 0' }}>: Accounting Manager (Master)</td>
            </tr>
          </tbody>
        </table>

        {/* SUMMARY KPI BOXES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
          <div style={{ border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '4px', backgroundColor: '#f8fafc', minHeight: '62px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '8pt', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {reportData.kpi1?.label || 'Total Data'}
            </div>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', color: '#0f172a', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {reportData.kpi1?.value || '-'}
            </div>
          </div>
          <div style={{ border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '4px', backgroundColor: '#f8fafc', minHeight: '62px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '8pt', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {reportData.kpi2?.label || 'Kuantitas'}
            </div>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', color: '#0f172a', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {reportData.kpi2?.value || '-'}
            </div>
          </div>
          <div style={{ border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '4px', backgroundColor: '#f8fafc', minHeight: '62px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '8pt', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {reportData.kpi3?.label || 'Keterangan'}
            </div>
            <div style={{ fontSize: '12pt', fontWeight: 'bold', color: '#0f172a', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {reportData.kpi3?.value || '-'}
            </div>
          </div>
        </div>

        {/* MAIN DATA TABLE */}
        <div style={{ marginBottom: '24px' }}>
          {renderTableContent()}
        </div>

        {/* LEMBAR PENGESAHAN 3 PIHAK */}
        <div style={{ pageBreakInside: 'avoid', marginTop: '20px' }}>
          <div style={{ textAlign: 'right', fontSize: '9pt', marginBottom: '10px', fontWeight: '600' }}>
            Kubu Raya, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
          
          <table style={{ width: '100%', fontSize: '9pt', textAlign: 'center', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ width: '33.3%', paddingBottom: '60px' }}>
                  Dibuat Oleh,<br />
                  <span style={{ fontSize: '8pt', color: '#475569' }}>Petugas Gudang / Logistik</span>
                </td>
                <td style={{ width: '33.3%', paddingBottom: '60px' }}>
                  Diperiksa Oleh,<br />
                  <span style={{ fontSize: '8pt', color: '#475569' }}>Admin Accounting (Supervisor)</span>
                </td>
                <td style={{ width: '33.3%', paddingBottom: '60px' }}>
                  Disetujui Oleh,<br />
                  <span style={{ fontSize: '8pt', color: '#475569' }}>Accounting Manager (Master)</span>
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold' }}>
                  ( Budi Santoso )<br />
                  <span style={{ fontSize: '8pt', fontWeight: 'normal', color: '#64748b' }}>Staf Logistik Gudang</span>
                </td>
                <td style={{ fontWeight: 'bold' }}>
                  ( Lidya / Supervisor )<br />
                  <span style={{ fontSize: '8pt', fontWeight: 'normal', color: '#64748b' }}>Supervisor Accounting</span>
                </td>
                <td style={{ fontWeight: 'bold' }}>
                  ( Accounting Manager )<br />
                  <span style={{ fontSize: '8pt', fontWeight: 'normal', color: '#64748b' }}>Master Executive</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* FOOTER NOTATION */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontSize: '7.5pt', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
          <span>Inventori Dangau — Sistem Informasi Manajemen Inventori & Pengadaan Dangau Kubu Raya</span>
          <span>Dicetak otomatis pada {new Date().toLocaleString('id-ID')}</span>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. MODAL DIALOG ON SCREEN */}
      <div
        className="modal-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}
      >
        <div
          className="modal-card"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: activeTab === 'preview' ? '980px' : '780px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
            border: '1px solid #cbd5e1',
            overflow: 'hidden'
          }}
        >
          {/* Modal Header */}
          <div
            style={{
              padding: '16px 22px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '7px', backgroundColor: '#e2e8f0', borderRadius: '6px', display: 'flex' }}>
                <Printer size={18} color="#0f172a" />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  Pusat Cetak Laporan Resmi — Master Executive
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Pilih modul laporan, tentukan periode tanggal, dan cetak dokumen resmi berstandar korporat.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'config' ? 'preview' : 'config')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid #cbd5e1',
                  backgroundColor: activeTab === 'preview' ? '#0f172a' : '#ffffff',
                  color: activeTab === 'preview' ? '#ffffff' : '#0f172a',
                  cursor: 'pointer'
                }}
              >
                <Eye size={14} />
                <span>{activeTab === 'preview' ? 'Kembali ke Filter' : 'Pratinjau Dokumen'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
            {activeTab === 'config' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. PILIH JENIS LAPORAN */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={15} color="#2563eb" />
                    <span>1. Pilih Modul / Jenis Laporan:</span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      { id: 'STOK_PERSEDIAAN', label: 'Stok Persediaan', icon: Package, desc: 'Master stok fisik, ambang batas, dan valuasi aset' },
                      { id: 'BARANG_MASUK', label: 'Barang Masuk (GR)', icon: LogIn, desc: 'Penerimaan stok masuk dari vendor / supplier' },
                      { id: 'BARANG_KELUAR', label: 'Barang Keluar (GI)', icon: LogOutIcon, desc: 'Distribusi barang ke outlet / departemen hotel' },
                    ].map(item => {
                      const isSelected = reportType === item.id;
                      const IconComp = item.icon;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setReportType(item.id)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '8px',
                            border: `1.5px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                            backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <IconComp size={16} color={isSelected ? '#2563eb' : '#475569'} />
                            <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#1e3a8a' : '#1e293b' }}>
                              {item.label}
                            </div>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.3' }}>
                            {item.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. PILIH PERIODE TANGGAL */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} color="#2563eb" />
                    <span>2. Tentukan Periode Tanggal Laporan:</span>
                  </div>

                  {/* Preset Buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {[
                      { id: 'ALL', label: 'Semua Periode' },
                      { id: 'THIS_MONTH', label: 'Bulan Ini' },
                      { id: 'LAST_7_DAYS', label: '7 Hari Terakhir' },
                      { id: 'TODAY', label: 'Hari Ini' },
                      { id: 'CUSTOM', label: 'Kustom Rentang Tanggal' }
                    ].map(btn => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => handlePresetChange(btn.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: `1px solid ${datePreset === btn.id ? '#2563eb' : '#cbd5e1'}`,
                          backgroundColor: datePreset === btn.id ? '#2563eb' : '#f8fafc',
                          color: datePreset === btn.id ? '#ffffff' : '#334155'
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Date Input Pickers */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Tanggal Mulai :
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        disabled={datePreset === 'ALL'}
                        onChange={(e) => {
                          setStartDate(e.target.value);
                          setDatePreset('CUSTOM');
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          fontSize: '12.5px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: datePreset === 'ALL' ? '#f1f5f9' : '#ffffff',
                          outline: 'none'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Tanggal Selesai :
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        disabled={datePreset === 'ALL'}
                        onChange={(e) => {
                          setEndDate(e.target.value);
                          setDatePreset('CUSTOM');
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          fontSize: '12.5px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: datePreset === 'ALL' ? '#f1f5f9' : '#ffffff',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. FILTER GUDANG & KRITERIA KHUSUS */}
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={15} color="#2563eb" />
                    <span>3. Lokasi Gudang & Filter Tambahan:</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        Lokasi Gudang :
                      </label>
                      <select
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          fontSize: '12.5px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="ALL">Semua Gudang (Konsolidasi)</option>
                        <option value="1">Gudang Utama Hotel (WH-DG)</option>
                        <option value="2">Gudang White House (WH-WH)</option>
                      </select>
                    </div>

                    {reportType === 'STOK_PERSEDIAAN' && (
                      <>
                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                            Kategori Barang :
                          </label>
                          <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              fontSize: '12.5px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="ALL">Semua Kategori</option>
                            {categoriesList.map((cat, i) => (
                              <option key={i} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '11.5px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>
                            Status Stok :
                          </label>
                          <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              fontSize: '12.5px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              backgroundColor: '#ffffff',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="ALL">Semua Status</option>
                            <option value="Aman">Hanya Stok Aman</option>
                            <option value="Menipis">Hanya Stok Menipis</option>
                            <option value="Kritis">Hanya Stok Kritis</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Ringkasan Dokumen Siap Cetak */}
                <div style={{ backgroundColor: '#f1f5f9', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '12.5px', color: '#1e293b' }}>
                    Laporan siap dicetak: <strong>{reportData.title}</strong> • Terpilih <strong>{reportData.totalRows} data baris</strong>.
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('preview')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563eb',
                      fontWeight: 700,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>Lihat Pratinjau Kertas</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

              </div>
            ) : (
              /* TAB PRATINJAU DOKUMEN CETAK */
              <div>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Pratinjau lembar A4 laporan resmi Hotel Dangau (siap cetak atau simpan PDF):
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('config')}
                    style={{ fontSize: '12px', color: '#2563eb', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                  >
                    ← Ubah Pilihan Laporan / Tanggal
                  </button>
                </div>
                
                {/* Paper Preview Container */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                  {renderOfficialPrintDocument()}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: '14px 22px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Dokumen akan dicetak dengan kop resmi dan kolom tanda tangan 3 pihak (Gudang, Accounting, Master).
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="btn-dark"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Printer size={16} />
                <span>Cetak Sekarang (Print / PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. OFFICIAL PRINT DOCUMENT IN DOM (Targeted by @media print) */}
      <div className="official-print-document">
        {renderOfficialPrintDocument()}
      </div>
    </>
  );
};

export default MasterPrintReportModal;
