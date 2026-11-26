import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  Package,
  Search,
  SlidersHorizontal,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Eye,
  FileText,
  Building2,
  Layers,
  Info,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Clock,
  ArrowRight,
  Edit3,
  Sliders,
  Check,
  Plus,
  FileSpreadsheet,
  Upload,
  Download
} from 'lucide-react';
import MasterPrintReportModal from '../components/MasterPrintReportModal';

const InformasiStock = () => {
  const { user, isMaster, isAdmin, isGudang } = useAuth();
  const isAccountingUser = isAdmin || user?.role_name === 'Admin' || user?.role_name === 'Accounting' || user?.name?.toLowerCase().includes('accounting');
  const showFinancials = isMaster || isAccountingUser;

  // Data states
  const [inventoryList, setInventoryList] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [masterCategories, setMasterCategories] = useState([]);
  const [masterUnits, setMasterUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL'); // 'ALL', '1' (Dangau), '2' (White House)
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'Aman', 'Menipis', 'Kritis'
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Modals
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);
  const [itemMovements, setItemMovements] = useState([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Edit Threshold Modal States
  const [editThresholdItem, setEditThresholdItem] = useState(null);
  const [editMinStock, setEditMinStock] = useState('');
  const [editCritStock, setEditCritStock] = useState('');
  const [savingThreshold, setSavingThreshold] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Tambah Barang Modal States
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    item_name: '',
    category_id: '1',
    unit_id: '1',
    minimum_stock: 10,
    critical_stock: 5,
    unit_price: 0,
    initial_stock: 0,
    warehouse_id: '1'
  });
  const [savingItem, setSavingItem] = useState(false);

  // Import Excel Modal States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [workbookInstance, setWorkbookInstance] = useState(null);
  const [availableSheets, setAvailableSheets] = useState([]);
  const [activeSheetName, setActiveSheetName] = useState('');
  const [selectedImportWarehouse, setSelectedImportWarehouse] = useState('1');
  const [importData, setImportData] = useState([]);
  const [importing, setImporting] = useState(false);

  // Fetch Inventory, Warehouses, Categories, and Units
  const fetchData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [invRes, whRes, catRes, unitRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/warehouses').catch(() => ({ data: [] })),
        api.get('/categories').catch(() => ({ data: [] })),
        api.get('/units').catch(() => ({ data: [] }))
      ]);

      if (Array.isArray(invRes.data)) {
        setInventoryList(invRes.data);
      }
      if (Array.isArray(whRes.data)) {
        setWarehouses(whRes.data);
      }
      if (Array.isArray(catRes.data)) {
        setMasterCategories(catRes.data);
      }
      if (Array.isArray(unitRes.data)) {
        setMasterUnits(unitRes.data);
      }
    } catch (err) {
      console.error('Error fetching inventory data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handler for Creating New Item
  const handleCreateItemSubmit = async (e) => {
    e.preventDefault();
    if (!newItemForm.item_name.trim()) {
      alert('Nama barang wajib diisi!');
      return;
    }

    try {
      setSavingItem(true);
      await api.post('/items', {
        item_name: newItemForm.item_name.trim(),
        category_id: parseInt(newItemForm.category_id || masterCategories[0]?.id || 1),
        unit_id: parseInt(newItemForm.unit_id || masterUnits[0]?.id || 1),
        minimum_stock: parseFloat(newItemForm.minimum_stock || 10),
        critical_stock: parseFloat(newItemForm.critical_stock || 5),
        unit_price: parseFloat(newItemForm.unit_price || 0),
        initial_stock: parseFloat(newItemForm.initial_stock || 0),
        warehouse_id: parseInt(newItemForm.warehouse_id || warehouses[0]?.id || 1)
      });

      setToastMessage(`Barang "${newItemForm.item_name.trim()}" berhasil ditambahkan ke inventori!`);
      setShowAddItemModal(false);
      setNewItemForm({
        item_name: '',
        category_id: masterCategories[0]?.id || '1',
        unit_id: masterUnits[0]?.id || '1',
        minimum_stock: 10,
        critical_stock: 5,
        unit_price: 0,
        initial_stock: 0,
        warehouse_id: warehouses[0]?.id || '1'
      });
      await fetchData(true);
    } catch (err) {
      console.error('Error creating item:', err);
      alert('Gagal menambahkan barang: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingItem(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Handler for Exporting Inventory to Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      if (filteredInventory.length === 0) {
        alert('Tidak ada data stok untuk diekspor.');
        return;
      }

      const dataToExport = filteredInventory.map((item, index) => {
        const curr = parseFloat(item.current_stock || 0);
        const min = parseFloat(item.minimum_stock || 10);
        const crit = parseFloat(item.critical_stock || 5);
        const price = parseFloat(item.unit_price || 0);
        const totalVal = curr * price;

        let status = 'Aman';
        if (curr <= crit) status = 'Kritis';
        else if (curr <= min) status = 'Menipis';

        const row = {
          'No': index + 1,
          'Nama Barang': item.item_name,
          'Kategori': item.category_name || '-',
          'Kode Gudang': item.warehouse_code,
          'Nama Gudang': item.warehouse_name,
          'Stok Fisik': curr,
          'Satuan': item.unit_name || 'Pcs',
          'Batas Minimal': min,
          'Batas Kritis': crit,
          'Status Stok': status
        };

        if (showFinancials) {
          row['Harga Satuan (Rp)'] = price;
          row['Total Nilai (Rp)'] = Math.round(totalVal);
        }

        return row;
      });

      const ws = XLSX.utils.json_to_sheet(dataToExport);

      const colWidths = [
        { wch: 6 },
        { wch: 38 },
        { wch: 26 },
        { wch: 14 },
        { wch: 28 },
        { wch: 12 },
        { wch: 10 },
        { wch: 14 },
        { wch: 14 },
        { wch: 15 }
      ];
      if (showFinancials) {
        colWidths.push({ wch: 18 });
        colWidths.push({ wch: 20 });
      }
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Stok_Inventori');

      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `Laporan_Stok_Dangau_Kubu_Raya_${dateStr}.xlsx`;

      XLSX.writeFile(wb, fileName);
      setToastMessage(`Berhasil mengekspor ${dataToExport.length} data stok ke file Excel (${fileName})!`);
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Gagal mengekspor data ke Excel: ' + err.message);
    }
  };

  // Handler for Downloading Import Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Nama Barang': 'MINYAK GORENG 2 LITER',
        'Kategori': masterCategories[0]?.category_name || 'Bahan Makanan & F&B',
        'Satuan': 'PCS',
        'Batas Minimal': 10,
        'Batas Kritis': 5,
        'Harga Satuan': 32000,
        'Stok Awal': 25,
        'Gudang': warehouses[0]?.warehouse_name || 'Gudang Dangau'
      },
      {
        'Nama Barang': 'SABUN MANDI HOTEL 20GR',
        'Kategori': masterCategories[1]?.category_name || 'Peralatan & Amenities Kamar',
        'Satuan': 'PCS',
        'Batas Minimal': 50,
        'Batas Kritis': 20,
        'Harga Satuan': 1500,
        'Stok Awal': 100,
        'Gudang': warehouses[0]?.warehouse_name || 'Gudang Dangau'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Barang');
    XLSX.writeFile(wb, 'Template_Import_Barang_Dangau.xlsx');
  };

  // Smart sheet parser that handles real-life Excel files (titles, multiple sheets, varied column names)
  const parseSheetRows = (wb, sheetName, fallbackWhId) => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return [];

    const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (!rawRows || rawRows.length === 0) return [];

    // Find header row index by looking for 'nama barang' or 'barang' or 'item'
    let headerIdx = -1;
    for (let i = 0; i < Math.min(rawRows.length, 15); i++) {
      const row = rawRows[i];
      if (Array.isArray(row) && row.some(cell => {
        const s = String(cell || '').toLowerCase().trim();
        return s === 'nama barang' || s === 'nama' || s === 'barang' || s === 'item name' || s === 'item';
      })) {
        headerIdx = i;
        break;
      }
    }

    let headers = [];
    let dataStartIndex = 0;
    if (headerIdx !== -1) {
      headers = rawRows[headerIdx].map(h => String(h || '').trim());
      dataStartIndex = headerIdx + 1;
    } else {
      headers = (rawRows[0] || []).map(h => String(h || '').trim());
      dataStartIndex = 1;
    }

    // Auto-detect target warehouse from sheet name
    let detectedWhId = fallbackWhId || '1';
    const sLower = sheetName.toLowerCase();
    if (sLower.includes('white house') || sLower.includes('whitehouse') || sLower.includes('wh-wh')) {
      detectedWhId = '2';
    } else if (sLower.includes('dangau') || sLower.includes('wh-dg')) {
      detectedWhId = '1';
    }

    const parsedItems = [];
    for (let i = dataStartIndex; i < rawRows.length; i++) {
      const row = rawRows[i];
      if (!row || !Array.isArray(row) || row.length === 0) continue;

      const rowObj = {};
      headers.forEach((h, colIdx) => {
        if (h) rowObj[h.toUpperCase()] = row[colIdx];
      });

      let itemName = rowObj['NAMA BARANG'] || rowObj['NAMA'] || rowObj['BARANG'] || rowObj['ITEM NAME'] || rowObj['ITEM'] || rowObj['DESKRIPSI'];
      if (!itemName && row[1] && typeof row[1] === 'string' && isNaN(row[1])) {
        itemName = row[1];
      } else if (!itemName && row[0] && typeof row[0] === 'string' && isNaN(row[0])) {
        itemName = row[0];
      }

      if (!itemName || typeof itemName !== 'string' || !itemName.trim()) continue;
      itemName = itemName.trim();

      // Extract initial stock
      let stockAwal = 0;
      const rawStock = rowObj['STOCK AWAL'] ?? rowObj['STOK AWAL'] ?? rowObj['STOCK'] ?? rowObj['STOK'] ?? rowObj['QTY'] ?? rowObj['JUMLAH'] ?? rowObj['KUANTITAS'];
      if (rawStock !== undefined && rawStock !== null && rawStock !== '') {
        stockAwal = parseFloat(rawStock) || 0;
      } else if (row[2] !== undefined && !isNaN(row[2]) && row[2] !== '') {
        stockAwal = parseFloat(row[2]) || 0;
      }

      const satuan = String(rowObj['SATUAN'] || rowObj['UNIT'] || rowObj['UOM'] || 'PCS').trim().toUpperCase();
      const kategori = String(rowObj['KATEGORI'] || rowObj['CATEGORY'] || rowObj['JENIS'] || 'Bahan Makanan & F&B').trim();
      const minStock = parseFloat(rowObj['BATAS MINIMAL'] || rowObj['MIN STOCK'] || rowObj['MINIMAL'] || rowObj['MIN'] || 10);
      const critStock = parseFloat(rowObj['BATAS KRITIS'] || rowObj['CRITICAL STOCK'] || rowObj['KRITIS'] || 5);
      const harga = parseFloat(rowObj['HARGA SATUAN'] || rowObj['HARGA'] || rowObj['PRICE'] || rowObj['UNIT PRICE'] || 0);
      const notes = String(rowObj['KETERANGAN'] || rowObj['EXPIRY DATE'] || rowObj['EXPIRED'] || rowObj['CATATAN'] || (row[3] ? String(row[3]) : '') || '').trim();

      parsedItems.push({
        item_name: itemName,
        initial_stock: stockAwal,
        unit_name: satuan,
        category_name: kategori,
        minimum_stock: minStock,
        critical_stock: critStock,
        unit_price: harga,
        warehouse_id: detectedWhId,
        notes: notes
      });
    }

    return parsedItems;
  };

  // Handler for Uploading and Parsing Excel File
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        setWorkbookInstance(wb);
        setAvailableSheets(wb.SheetNames);

        const firstSheet = wb.SheetNames[0] || '';
        setActiveSheetName(firstSheet);

        const items = parseSheetRows(wb, firstSheet, selectedImportWarehouse);
        setImportData(items);
      } catch (err) {
        console.error('Error reading excel:', err);
        alert('Gagal membaca file Excel. Pastikan format file .xlsx valid.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSwitchSheet = (sheetName) => {
    if (!workbookInstance) return;
    setActiveSheetName(sheetName);
    const items = parseSheetRows(workbookInstance, sheetName, selectedImportWarehouse);
    setImportData(items);
  };

  // Handler for Processing Batch Import from Excel directly to Web Database
  const handleProcessImport = async () => {
    if (importData.length === 0) {
      alert('Tidak ada data barang yang valid untuk diimpor.');
      return;
    }

    try {
      setImporting(true);
      const res = await api.post('/items/import-excel', { items: importData });

      setToastMessage(res.data.message || `Berhasil mengimpor ${importData.length} data barang ke database web!`);
      setShowImportModal(false);
      setImportFile(null);
      setWorkbookInstance(null);
      setImportData([]);
      await fetchData(true);
    } catch (err) {
      console.error('Error processing import:', err);
      alert('Gagal mengimpor ke database web: ' + (err.response?.data?.message || err.message));
    } finally {
      setImporting(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Handlers for Editing Minimum & Critical Stock
  const handleOpenEditThreshold = (item) => {
    setEditThresholdItem(item);
    setEditMinStock(parseFloat(item.minimum_stock || 10));
    setEditCritStock(parseFloat(item.critical_stock || 5));
  };

  const handleSaveThreshold = async (e) => {
    e.preventDefault();
    if (!editThresholdItem) return;

    const minVal = parseFloat(editMinStock);
    const critVal = parseFloat(editCritStock);

    if (isNaN(minVal) || minVal < 0) {
      alert('Batas minimal harus berupa angka valid >= 0');
      return;
    }

    try {
      setSavingThreshold(true);
      const safeCrit = isNaN(critVal) ? Math.floor(minVal / 2) : critVal;

      await api.put(`/items/${editThresholdItem.item_id}`, {
        minimum_stock: minVal,
        critical_stock: safeCrit
      });

      // Update inventory list across all warehouses in memory immediately
      setInventoryList(prev => prev.map(inv => {
        if (inv.item_id === editThresholdItem.item_id) {
          return {
            ...inv,
            minimum_stock: minVal,
            critical_stock: safeCrit
          };
        }
        return inv;
      }));

      // Update active detail modal if open
      if (selectedItemDetail && selectedItemDetail.item_id === editThresholdItem.item_id) {
        setSelectedItemDetail(prev => ({
          ...prev,
          minimum_stock: minVal,
          critical_stock: safeCrit
        }));
      }

      setToastMessage(`Batas minimal untuk "${editThresholdItem.item_name}" berhasil diubah menjadi ${minVal} ${editThresholdItem.unit_name || 'Pcs'}`);
      setEditThresholdItem(null);
    } catch (err) {
      console.error('Error updating threshold:', err);
      alert('Gagal menyimpan batas minimal: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingThreshold(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Fetch movements when item is selected for detail
  useEffect(() => {
    if (!selectedItemDetail) {
      setItemMovements([]);
      return;
    }

    const fetchMovements = async () => {
      try {
        setLoadingMovements(true);
        const res = await api.get('/inventory/movements', {
          params: { item_id: selectedItemDetail.item_id }
        });
        if (Array.isArray(res.data)) {
          setItemMovements(res.data);
        } else {
          setItemMovements([]);
        }
      } catch (err) {
        console.error('Error fetching item movements:', err);
        setItemMovements([]);
      } finally {
        setLoadingMovements(false);
      }
    };

    fetchMovements();
  }, [selectedItemDetail]);

  // Extract unique categories
  const categoriesList = useMemo(() => {
    const set = new Set();
    inventoryList.forEach(item => {
      if (item.category_name) set.add(item.category_name);
    });
    return Array.from(set).sort();
  }, [inventoryList]);

  // Filtered Inventory
  const filteredInventory = useMemo(() => {
    return inventoryList.filter(item => {
      // Warehouse filter
      if (warehouseFilter !== 'ALL' && String(item.warehouse_id) !== String(warehouseFilter)) {
        return false;
      }

      // Category filter
      if (categoryFilter !== 'ALL' && item.category_name !== categoryFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (item.item_name || '').toLowerCase().includes(q);
        const catMatch = (item.category_name || '').toLowerCase().includes(q);
        const unitMatch = (item.unit_name || '').toLowerCase().includes(q);
        if (!nameMatch && !catMatch && !unitMatch) return false;
      }

      // Status filter
      const curr = parseFloat(item.current_stock || 0);
      const min = parseFloat(item.minimum_stock || 10);
      const crit = parseFloat(item.critical_stock || 5);

      if (statusFilter === 'Kritis') {
        if (curr > crit) return false;
      } else if (statusFilter === 'Menipis') {
        if (curr <= crit || curr > min) return false;
      } else if (statusFilter === 'Aman') {
        if (curr <= min) return false;
      }

      return true;
    });
  }, [inventoryList, warehouseFilter, categoryFilter, searchQuery, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [warehouseFilter, categoryFilter, statusFilter, searchQuery, pageSize]);

  // Statistics calculation based on current warehouse filter
  const stats = useMemo(() => {
    const list = warehouseFilter === 'ALL'
      ? inventoryList
      : inventoryList.filter(item => String(item.warehouse_id) === String(warehouseFilter));

    let totalPhysicalStock = 0;
    let totalValuation = 0;
    let safeCount = 0;
    let lowCount = 0;
    let criticalCount = 0;

    list.forEach(item => {
      const curr = parseFloat(item.current_stock || 0);
      const min = parseFloat(item.minimum_stock || 10);
      const crit = parseFloat(item.critical_stock || 5);
      const price = parseFloat(item.unit_price || 0);

      totalPhysicalStock += curr;
      totalValuation += (curr * price);

      if (curr <= crit) {
        criticalCount++;
      } else if (curr <= min) {
        lowCount++;
      } else {
        safeCount++;
      }
    });

    // Unique items count
    const uniqueItemIds = new Set(list.map(i => i.item_id));

    return {
      totalItems: uniqueItemIds.size,
      totalRecords: list.length,
      totalPhysicalStock,
      totalValuation,
      safeCount,
      lowCount,
      criticalCount,
      needRestockCount: lowCount + criticalCount
    };
  }, [inventoryList, warehouseFilter]);

  // Paginated records
  const paginatedInventory = useMemo(() => {
    if (pageSize === 'ALL') return filteredInventory;
    const start = (currentPage - 1) * pageSize;
    return filteredInventory.slice(start, start + pageSize);
  }, [filteredInventory, currentPage, pageSize]);

  const totalPages = pageSize === 'ALL' ? 1 : Math.ceil(filteredInventory.length / pageSize) || 1;

  // Breakdown for selected item across warehouses
  const itemWarehouseBreakdown = useMemo(() => {
    if (!selectedItemDetail) return [];
    return inventoryList.filter(i => i.item_id === selectedItemDetail.item_id);
  }, [selectedItemDetail, inventoryList]);

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header Banner: Tegas, Kontras Tinggi Emas & Putih */}
      <div
        style={{
          marginBottom: '20px',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: '#ffffff',
          border: '2px solid #0f172a',
          borderRadius: '14px',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)'
            }}
          >
            <Boxes size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '-0.02em'
                }}
              >
                Informasi Stock Barang
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '4px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: '1.5px solid #0f172a',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                Dangau Kubu Raya
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0 0', fontWeight: 500 }}>
              Pusat Informasi &amp; Monitoring Ketersediaan Stok Real-time (Gudang Dangau &amp; Gudang White House)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Tombol Tambah Barang Baru */}
          <button
            type="button"
            onClick={() => {
              setNewItemForm({
                item_name: '',
                category_id: masterCategories[0]?.id || '1',
                unit_id: masterUnits[0]?.id || '1',
                minimum_stock: 10,
                critical_stock: 5,
                unit_price: 0,
                initial_stock: 0,
                warehouse_id: warehouses[0]?.id || '1'
              });
              setShowAddItemModal(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 800,
              borderRadius: '8px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: '2px solid #0f172a',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)'
            }}
            title="Tambah jenis barang baru ke inventori"
          >
            <Plus size={16} />
            <span>+ Tambah Barang</span>
          </button>

          {/* Tombol Ekspor ke Excel (.xlsx) */}
          <button
            type="button"
            onClick={handleExportExcel}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 800,
              borderRadius: '8px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              border: '2px solid #14532d',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)'
            }}
            title="Ekspor seluruh data stok ke file Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet size={16} />
            <span>Ekspor Excel</span>
          </button>

          {/* Tombol Impor dari Excel (.xlsx) */}
          <button
            type="button"
            onClick={() => {
              setImportFile(null);
              setImportData([]);
              setShowImportModal(true);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 800,
              borderRadius: '8px',
              border: '2px solid #8c6208',
              background: 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(184, 134, 11, 0.3)'
            }}
            title="Impor / tambahkan barang dari file Excel (.xlsx)"
          >
            <Upload size={16} />
            <span>Impor Excel</span>
          </button>

          {/* Tombol Segarkan Data */}
          <button
            type="button"
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '8px',
              border: '2px solid #0f172a',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              cursor: refreshing ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={15} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
          </button>

          {/* Tombol Cetak Laporan Resmi */}
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              fontSize: '13px',
              fontWeight: 800,
              padding: '10px 18px',
              borderRadius: '8px',
              border: '2px solid #0f172a',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
            <span>Cetak Laporan</span>
          </button>

          {!isAccountingUser && (
            <Link
              to="/permintaan-pembelian"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                padding: '10px 18px',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: '2px solid #0f172a',
                textDecoration: 'none',
                fontWeight: 800
              }}
            >
              <FileText size={15} />
              <span>+ Pengajuan PR</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPI Stat Cards: Desain Tegas Berbingkai 2px */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: showFinancials
            ? 'repeat(auto-fit, minmax(210px, 1fr))'
            : 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '22px'
        }}
      >
        {/* Card 1: Total Jenis Barang */}
        <div style={{ border: '2px solid #0f172a', borderRadius: '12px', padding: '18px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL JENIS BARANG</span>
            <div style={{ padding: '7px', border: '1.5px solid #0f172a', borderRadius: '8px', display: 'flex', alignItems: 'center', background: '#f8fafc' }}>
              <Package size={17} color="#0f172a" />
            </div>
          </div>
          <div style={{ color: '#0f172a', fontSize: '26px', fontWeight: 900, marginTop: '8px' }}>
            {stats.totalItems.toLocaleString('id-ID')}{' '}
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Item</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
            Tersebar di {warehouses.length || 2} unit gudang aktif
          </div>
        </div>

        {/* Card 2: Total Unit Fisik */}
        <div style={{ border: '2px solid #0f172a', borderRadius: '12px', padding: '18px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL STOK FISIK</span>
            <div style={{ padding: '7px', border: '1.5px solid #16a34a', borderRadius: '8px', display: 'flex', alignItems: 'center', background: '#f0fdf4' }}>
              <Layers size={17} color="#16a34a" />
            </div>
          </div>
          <div style={{ color: '#15803d', fontSize: '26px', fontWeight: 900, marginTop: '8px' }}>
            {Math.round(stats.totalPhysicalStock).toLocaleString('id-ID')}{' '}
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Unit</span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>
            Akumulasi kuantitas stok tersimpan
          </div>
        </div>

        {/* Card 3: Stok Aman */}
        <div style={{ border: '2px solid #16a34a', borderRadius: '12px', padding: '18px', backgroundColor: '#f0fdf4', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#166534', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>STOK AMAN</span>
            <div style={{ padding: '7px', border: '1.5px solid #16a34a', borderRadius: '8px', display: 'flex', alignItems: 'center', background: '#dcfce7' }}>
              <CheckCircle2 size={17} color="#15803d" />
            </div>
          </div>
          <div style={{ color: '#15803d', fontSize: '26px', fontWeight: 900, marginTop: '8px' }}>
            {stats.safeCount.toLocaleString('id-ID')}{' '}
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>Item</span>
          </div>
          <div style={{ fontSize: '12px', color: '#166534', marginTop: '6px', fontWeight: 500 }}>
            Kuantitas berada di atas batas minimum
          </div>
        </div>

        {/* Card 4: Perlu Restock / Kritis */}
        <div style={{
          border: stats.needRestockCount > 0 ? '2px solid #dc2626' : '2px solid #cbd5e1',
          borderRadius: '12px',
          padding: '18px',
          backgroundColor: stats.needRestockCount > 0 ? '#fef2f2' : '#ffffff',
          boxShadow: stats.needRestockCount > 0 ? '0 4px 12px rgba(220, 38, 38, 0.12)' : '0 4px 12px rgba(15, 23, 42, 0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: stats.needRestockCount > 0 ? '#991b1b' : '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              PERLU RESTOCK / KRITIS
            </span>
            <div style={{ padding: '7px', border: stats.needRestockCount > 0 ? '1.5px solid #dc2626' : '1.5px solid #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', background: stats.needRestockCount > 0 ? '#fee2e2' : '#f8fafc' }}>
              <AlertTriangle size={17} color={stats.needRestockCount > 0 ? '#dc2626' : '#64748b'} />
            </div>
          </div>
          <div style={{ color: stats.needRestockCount > 0 ? '#dc2626' : '#64748b', fontSize: '26px', fontWeight: 900, marginTop: '8px' }}>
            {stats.needRestockCount.toLocaleString('id-ID')}{' '}
            <span style={{ fontSize: '13px', fontWeight: 600, color: stats.needRestockCount > 0 ? '#991b1b' : '#64748b' }}>Item</span>
          </div>
          <div style={{ fontSize: '12px', color: stats.needRestockCount > 0 ? '#991b1b' : '#64748b', marginTop: '6px', fontWeight: 500 }}>
            {stats.criticalCount} Kritis &bull; {stats.lowCount} Menipis
          </div>
        </div>

        {/* Card 5: Valuasi Total (Master & Accounting) */}
        {showFinancials && (
          <div style={{ border: '2px solid #b8860b', borderRadius: '12px', padding: '18px', backgroundColor: '#fdfbf7', boxShadow: '0 4px 12px rgba(184, 134, 11, 0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: '#78350f', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>TOTAL NILAI VALUASI</span>
              <div style={{ padding: '7px', border: '1.5px solid #b8860b', borderRadius: '8px', display: 'flex', alignItems: 'center', background: '#fef3c7' }}>
                <Building2 size={17} color="#b8860b" />
              </div>
            </div>
            <div style={{ color: '#855800', fontSize: '24px', fontWeight: 900, marginTop: '8px' }}>
              Rp {Math.round(stats.totalValuation).toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: '12px', color: '#855800', marginTop: '6px', fontWeight: 500 }}>
              Total aset persediaan di gudang terpilih
            </div>
          </div>
        )}
      </div>

      {/* Warehouse Selector Tabs: Bergaris Tegas Emas & Putih */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setWarehouseFilter('ALL')}
          style={{
            padding: '9px 20px',
            fontSize: '13px',
            fontWeight: 800,
            borderRadius: '10px',
            border: warehouseFilter === 'ALL' ? '2px solid #8c6208' : '2px solid #0f172a',
            background: warehouseFilter === 'ALL' ? 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)' : '#ffffff',
            color: warehouseFilter === 'ALL' ? '#ffffff' : '#0f172a',
            cursor: 'pointer',
            boxShadow: warehouseFilter === 'ALL' ? '0 4px 12px rgba(184, 134, 11, 0.3)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          Semua Gudang ({inventoryList.length} Baris)
        </button>

        {warehouses.map((wh) => (
          <button
            key={wh.id}
            type="button"
            onClick={() => setWarehouseFilter(String(wh.id))}
            style={{
              padding: '9px 20px',
              fontSize: '13px',
              fontWeight: 800,
              borderRadius: '10px',
              border: String(warehouseFilter) === String(wh.id) ? '2px solid #8c6208' : '2px solid #0f172a',
              background: String(warehouseFilter) === String(wh.id) ? 'linear-gradient(135deg, #d4af37 0%, #aa7c11 100%)' : '#ffffff',
              color: String(warehouseFilter) === String(wh.id) ? '#ffffff' : '#0f172a',
              cursor: 'pointer',
              boxShadow: String(warehouseFilter) === String(wh.id) ? '0 4px 12px rgba(184, 134, 11, 0.3)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {wh.warehouse_name} ({wh.warehouse_code})
          </button>
        ))}
      </div>

      {/* Filter and Search Bar: Garis Tegas */}
      <div
        style={{
          marginBottom: '20px',
          padding: '16px 20px',
          border: '2px solid #0f172a',
          borderRadius: '12px',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '280px', maxWidth: '440px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#0f172a" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari nama barang, kategori, satuan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                border: '2px solid #cbd5e1',
                outline: 'none',
                backgroundColor: '#ffffff',
                color: '#0f172a'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal size={15} color="#0f172a" />
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.04em' }}>FILTER:</span>
          </div>

          {/* Kategori Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              borderRadius: '8px',
              border: '2px solid #0f172a',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ALL">Semua Kategori ({categoriesList.length})</option>
            {categoriesList.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Stok Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              fontSize: '12.5px',
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
            <option value="Menipis">Stok Menipis (Restock)</option>
            <option value="Kritis">Stok Kritis / Habis</option>
          </select>

          {/* Page Size Selector */}
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            style={{
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              borderRadius: '8px',
              border: '2px solid #0f172a',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={25}>25 per baris</option>
            <option value={50}>50 per baris</option>
            <option value={100}>100 per baris</option>
            <option value="ALL">Tampilkan Semua</option>
          </select>

          {(searchQuery || categoryFilter !== 'ALL' || statusFilter !== 'ALL' || warehouseFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
                setStatusFilter('ALL');
                setWarehouseFilter('ALL');
              }}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 800,
                borderRadius: '8px',
                border: '2px solid #0f172a',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer'
              }}
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Stock Table: Desain Tegas, Border 2px & Thead Gelap */}
      <div style={{ border: '2px solid #0f172a', borderRadius: '12px', padding: 0, overflow: 'hidden', backgroundColor: '#ffffff', marginBottom: '22px', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '2px solid #0f172a',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Boxes size={18} color="#0f172a" />
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Daftar Informasi Stock Persediaan
            </h2>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '6px',
                backgroundColor: '#f1f5f9',
                color: '#0f172a',
                border: '1.5px solid #0f172a'
              }}
            >
              {filteredInventory.length} Data Ditemukan
            </span>
          </div>

          <div style={{ fontSize: '12.5px', color: '#475569', fontWeight: 600 }}>
            Halaman {currentPage} dari {totalPages} &bull; Menampilkan {paginatedInventory.length} baris
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0f172a', borderBottom: '2.5px solid #d4af37' }}>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, width: '45px', textAlign: 'center', padding: '12px 14px' }}>No</th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, padding: '12px 16px' }}>Nama Barang</th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, padding: '12px 16px' }}>Kategori</th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, padding: '12px 16px' }}>Gudang</th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, textAlign: 'right', padding: '12px 16px' }}>Stok Fisik</th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, padding: '12px 16px' }}>Satuan</th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, textAlign: 'center', padding: '12px 16px' }}>Batas Min / Kritis</th>
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, textAlign: 'center', padding: '12px 16px' }}>Status</th>
                {showFinancials && (
                  <>
                    <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, textAlign: 'right', padding: '12px 16px' }}>Harga Satuan</th>
                    <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, textAlign: 'right', padding: '12px 16px' }}>Total Nilai (Rp)</th>
                  </>
                )}
                <th style={{ color: '#ffffff', fontSize: '11.5px', fontWeight: 800, textAlign: 'center', width: '150px', padding: '12px 16px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={showFinancials ? 11 : 9} style={{ textAlign: 'center', padding: '40px', color: '#78716c' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <RefreshCw size={16} className="spin" color="#8a6515" />
                      <span>Memuat informasi stok barang...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedInventory.map((item, index) => {
                const globalIndex = pageSize === 'ALL' ? index + 1 : (currentPage - 1) * pageSize + index + 1;
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
                  <tr key={item.inventory_id || index} style={{ transition: 'background-color 0.15s ease' }}>
                    <td style={{ textAlign: 'center', fontSize: '11.5px', color: '#78716c' }}>{globalIndex}</td>
                    <td style={{ fontWeight: 600, color: '#1c1917', fontSize: '12.5px' }}>
                      {item.item_name}
                    </td>
                    <td style={{ fontSize: '12px', color: '#57534e' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#475569'
                        }}
                      >
                        {item.category_name || '-'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: '#57534e' }}>
                      <span style={{ fontWeight: 700, color: '#8a6515' }}>{item.warehouse_code}</span>
                      <span style={{ fontSize: '11px', color: '#78716c', marginLeft: '4px' }}>({item.warehouse_name})</span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, fontSize: '13px', color: curr <= min ? '#dc2626' : '#15803d' }}>
                      {curr.toLocaleString('id-ID')}
                    </td>
                    <td style={{ fontSize: '12px', color: '#57534e' }}>{item.unit_name || 'Pcs'}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11.5px', color: '#78716c' }}>
                          Min: <strong style={{ color: curr <= min ? '#b45309' : '#1c1917' }}>{min}</strong> / Kritis: {crit}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditThreshold(item)}
                          title="Ubah Batas Minimal & Kritis Stok"
                          style={{
                            background: '#fbf7ee',
                            border: '1px solid #ebd9b0',
                            borderRadius: '5px',
                            padding: '3px 6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            color: '#8a6515'
                          }}
                        >
                          <Edit3 size={11} />
                        </button>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          backgroundColor: badgeBg,
                          color: badgeColor,
                          border: `1px solid ${badgeBorder}`
                        }}
                      >
                        {status}
                      </span>
                    </td>
                    {showFinancials && (
                      <>
                        <td style={{ textAlign: 'right', fontSize: '12px', color: '#57534e' }}>
                          Rp {price.toLocaleString('id-ID')}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '12.5px', color: '#8a6515' }}>
                          Rp {Math.round(totalVal).toLocaleString('id-ID')}
                        </td>
                      </>
                    )}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedItemDetail(item)}
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#8a6515',
                            border: '1.5px solid #ebd9b0',
                            padding: '5px 10px',
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
                        <button
                          type="button"
                          onClick={() => handleOpenEditThreshold(item)}
                          style={{
                            backgroundColor: '#fbf7ee',
                            color: '#8a6515',
                            border: '1.5px solid #ebd9b0',
                            padding: '5px 9px',
                            borderRadius: '7px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="Ubah Batas Minimal Stok"
                        >
                          <Edit3 size={11} color="#8a6515" />
                          <span>Edit Min</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={showFinancials ? 11 : 9} style={{ textAlign: 'center', padding: '48px 20px', color: '#94a3b8' }}>
                    <Search size={32} color="#94a3b8" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1c1917' }}>Tidak ada data barang yang sesuai</div>
                    <div style={{ fontSize: '12px', color: '#78716c', marginTop: '4px' }}>Coba ubah kata kunci pencarian atau reset filter di atas.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {pageSize !== 'ALL' && totalPages > 1 && (
          <div
            style={{
              padding: '12px 20px',
              borderTop: '1px solid #ebd9b0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#faf8f5',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ fontSize: '12px', color: '#78716c' }}>
              Menampilkan {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredInventory.length)} dari {filteredInventory.length} barang
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #ebd9b0',
                  backgroundColor: currentPage === 1 ? '#f5f5f4' : '#ffffff',
                  color: currentPage === 1 ? '#a8a29e' : '#1c1917',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                <ChevronLeft size={14} />
                <span>Sebelumnya</span>
              </button>

              <span style={{ fontSize: '12px', fontWeight: 700, color: '#785711', padding: '0 8px' }}>
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #ebd9b0',
                  backgroundColor: currentPage === totalPages ? '#f5f5f4' : '#ffffff',
                  color: currentPage === totalPages ? '#a8a29e' : '#1c1917',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px'
                }}
              >
                <span>Selanjutnya</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detail Barang & Kartu Stok */}
      {selectedItemDetail && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div
            className="modal-content"
            style={{
              maxWidth: '680px',
              border: '1.5px solid #ebd9b0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0,0,0,0.18)'
            }}
          >
            {/* Modal Header */}
            <div
              className="modal-header"
              style={{
                borderBottom: '1.5px solid #ebd9b0',
                background: 'linear-gradient(180deg, #fdfbf7 0%, #ffffff 100%)',
                padding: '16px 20px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: '#fbf7ee', border: '1px solid #ebd9b0' }}>
                  <Boxes size={20} color="#8a6515" />
                </div>
                <div>
                  <h3 className="modal-title" style={{ color: '#1c1917', fontWeight: 800, fontSize: '16px', margin: 0 }}>
                    Informasi &amp; Kartu Stok Barang
                  </h3>
                  <div style={{ fontSize: '12px', color: '#78716c' }}>
                    Detail persediaan dan riwayat mutasi pergerakan barang
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItemDetail(null)}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#78716c' }}
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ padding: '20px', maxHeight: '75vh', overflowY: 'auto' }}>
              {/* Item General Details */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#1c1917' }}>
                  {selectedItemDetail.item_name}
                </div>
                <div style={{ fontSize: '12.5px', color: '#78716c', marginTop: '3px' }}>
                  Kategori: <strong style={{ color: '#3d2f17' }}>{selectedItemDetail.category_name || '-'}</strong> &bull; Satuan: <strong style={{ color: '#3d2f17' }}>{selectedItemDetail.unit_name || 'Pcs'}</strong>
                </div>
              </div>

              {/* Multi-Warehouse Stock Breakdown */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#785711', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                  Ketersediaan Stok per Gudang
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  {itemWarehouseBreakdown.map((whItem) => {
                    const st = parseFloat(whItem.current_stock || 0);
                    const isLow = st <= parseFloat(whItem.minimum_stock || 10);
                    return (
                      <div
                        key={whItem.warehouse_id}
                        style={{
                          backgroundColor: '#fcfbf8',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid #ebd9b0'
                        }}
                      >
                        <div style={{ fontSize: '11px', color: '#78716c', fontWeight: 600 }}>
                          {whItem.warehouse_name} ({whItem.warehouse_code})
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: isLow ? '#dc2626' : '#15803d', marginTop: '4px' }}>
                          {st.toLocaleString('id-ID')} <span style={{ fontSize: '12px', fontWeight: 600, color: '#78716c' }}>{whItem.unit_name}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Threshold & Financial Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: showFinancials ? '1fr 1fr 1fr 1fr' : '1fr 1fr',
                  gap: '10px',
                  backgroundColor: '#ffffff',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #ebd9b0',
                  marginBottom: '18px'
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#78716c' }}>Batas Minimum</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#3d2f17', marginTop: '2px' }}>
                    {selectedItemDetail.minimum_stock || 10} {selectedItemDetail.unit_name}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#78716c' }}>Batas Kritis</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#dc2626', marginTop: '2px' }}>
                    {selectedItemDetail.critical_stock || 5} {selectedItemDetail.unit_name}
                  </div>
                </div>
                {showFinancials && (
                  <>
                    <div>
                      <div style={{ fontSize: '11px', color: '#78716c' }}>Harga Satuan</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#3d2f17', marginTop: '2px' }}>
                        Rp {parseFloat(selectedItemDetail.unit_price || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#78716c' }}>Total Valuasi</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#8a6515', marginTop: '2px' }}>
                        Rp {Math.round(parseFloat(selectedItemDetail.current_stock || 0) * parseFloat(selectedItemDetail.unit_price || 0)).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action to Edit Threshold from within detail modal */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', marginBottom: '18px' }}>
                <button
                  type="button"
                  onClick={() => handleOpenEditThreshold(selectedItemDetail)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '7px 14px',
                    borderRadius: '8px',
                    backgroundColor: '#fbf7ee',
                    border: '1.5px solid #ebd9b0',
                    color: '#8a6515',
                    cursor: 'pointer'
                  }}
                >
                  <Edit3 size={13} color="#8a6515" />
                  <span>Ubah Batas Minimal &amp; Kritis Barang Ini</span>
                </button>
              </div>

              {/* Kartu Stok / Riwayat Mutasi Terkini */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#785711', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={13} color="#8a6515" />
                    <span>Kartu Stok &bull; 10 Riwayat Mutasi Terkini</span>
                  </div>
                </div>

                <div style={{ border: '1px solid #ebd9b0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table className="data-table" style={{ margin: 0, fontSize: '11.5px' }}>
                    <thead>
                      <tr style={{ background: '#fbf7ee' }}>
                        <th style={{ color: '#785711', fontSize: '11px' }}>Tanggal</th>
                        <th style={{ color: '#785711', fontSize: '11px' }}>Gudang</th>
                        <th style={{ color: '#785711', fontSize: '11px' }}>Tipe</th>
                        <th style={{ color: '#785711', fontSize: '11px', textAlign: 'right' }}>Jumlah</th>
                        <th style={{ color: '#785711', fontSize: '11px', textAlign: 'right' }}>Stok Akhir</th>
                        <th style={{ color: '#785711', fontSize: '11px' }}>Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingMovements ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '18px', color: '#78716c' }}>
                            <RefreshCw size={14} className="spin" style={{ display: 'inline', marginRight: '6px' }} />
                            Memuat riwayat mutasi...
                          </td>
                        </tr>
                      ) : itemMovements.length > 0 ? (
                        itemMovements.slice(0, 10).map((m, idx) => {
                          const isIncoming = m.transaction_type?.toLowerCase().includes('in') || m.transaction_type?.toLowerCase().includes('masuk');
                          return (
                            <tr key={m.id || idx}>
                              <td style={{ fontSize: '11px' }}>
                                {new Date(m.created_at || Date.now()).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </td>
                              <td style={{ fontSize: '11px' }}>{m.warehouse_code || 'WH'}</td>
                              <td style={{ fontSize: '11px' }}>
                                <span
                                  style={{
                                    fontWeight: 700,
                                    fontSize: '10.5px',
                                    color: isIncoming ? '#15803d' : '#b91c1c'
                                  }}
                                >
                                  {m.transaction_type}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 700, color: isIncoming ? '#15803d' : '#b91c1c' }}>
                                {isIncoming ? `+${m.quantity}` : `-${m.quantity}`} {m.unit_name}
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 700, color: '#1c1917' }}>
                                {m.stock_after ?? '-'}
                              </td>
                              <td style={{ fontSize: '10.5px', color: '#57534e' }}>
                                {m.notes || m.reference_id || '-'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>
                            Belum ada catatan mutasi transaksi untuk barang ini.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="modal-footer"
              style={{
                justifyContent: 'space-between',
                borderTop: '1px solid #ebd9b0',
                padding: '14px 20px',
                backgroundColor: '#faf8f5'
              }}
            >
              <div>
                {!isAccountingUser && parseFloat(selectedItemDetail.current_stock || 0) <= parseFloat(selectedItemDetail.minimum_stock || 10) && (
                  <Link
                    to="/permintaan-pembelian"
                    className="btn-dark"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      backgroundColor: '#b8860b'
                    }}
                  >
                    <FileText size={14} />
                    <span>Buat Pengajuan PR Barang Ini</span>
                  </Link>
                )}
              </div>

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

      {/* Modal Ubah Batas Minimal & Kritis Stok */}
      {editThresholdItem && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div
            className="modal-content"
            style={{
              maxWidth: '480px',
              border: '1.5px solid #ebd9b0',
              borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
              overflow: 'hidden'
            }}
          >
            <div
              className="modal-header"
              style={{
                borderBottom: '1.5px solid #ebd9b0',
                background: 'linear-gradient(180deg, #fdfbf7 0%, #ffffff 100%)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#fbf7ee', border: '1px solid #ebd9b0' }}>
                  <Sliders size={18} color="#8a6515" />
                </div>
                <div>
                  <h3 className="modal-title" style={{ color: '#1c1917', fontWeight: 800, margin: 0, fontSize: '15px' }}>
                    Ubah Batas Minimal Stok
                  </h3>
                  <div style={{ fontSize: '11px', color: '#78716c' }}>
                    Konfigurasi ambang batas restock inventori
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditThresholdItem(null)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#78716c' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveThreshold}>
              <div className="modal-body" style={{ padding: '20px' }}>
                {/* Item Info Box */}
                <div
                  style={{
                    backgroundColor: '#fcfbf8',
                    border: '1px solid #ebd9b0',
                    borderRadius: '10px',
                    padding: '14px',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#1c1917' }}>
                    {editThresholdItem.item_name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#78716c', marginTop: '3px' }}>
                    Kategori: <strong style={{ color: '#3d2f17' }}>{editThresholdItem.category_name || '-'}</strong> &bull; Satuan: <strong style={{ color: '#3d2f17' }}>{editThresholdItem.unit_name || 'Pcs'}</strong>
                  </div>
                  <div style={{ fontSize: '12px', color: '#78716c', marginTop: '4px' }}>
                    Stok Fisik Tersedia: <strong style={{ color: parseFloat(editThresholdItem.current_stock || 0) <= parseFloat(editThresholdItem.minimum_stock || 10) ? '#dc2626' : '#15803d' }}>{parseFloat(editThresholdItem.current_stock || 0).toLocaleString('id-ID')} {editThresholdItem.unit_name}</strong>
                  </div>
                </div>

                {/* Input Batas Minimal */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#1c1917', marginBottom: '6px' }}>
                    Batas Minimal (Minimum Stock) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={editMinStock}
                      onChange={(e) => setEditMinStock(e.target.value)}
                      placeholder="Masukkan batas minimal stok..."
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        fontSize: '14px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: '1.5px solid #ebd9b0',
                        backgroundColor: '#ffffff',
                        color: '#1c1917',
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#78716c', minWidth: '40px' }}>
                      {editThresholdItem.unit_name || 'Pcs'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#78716c', marginTop: '4px' }}>
                    Batas aman restock. Jika stok &le; angka ini, sistem otomatis memberi tanda <strong style={{ color: '#92400e' }}>Menipis (Perlu Restock)</strong>.
                  </div>
                </div>

                {/* Input Batas Kritis */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#1c1917', marginBottom: '6px' }}>
                    Batas Kritis Bahaya (Critical Stock) <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={editCritStock}
                      onChange={(e) => setEditCritStock(e.target.value)}
                      placeholder="Masukkan batas kritis..."
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        fontSize: '14px',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: '1.5px solid #fecaca',
                        backgroundColor: '#fffaf8',
                        color: '#991b1b',
                        outline: 'none'
                      }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#78716c', minWidth: '40px' }}>
                      {editThresholdItem.unit_name || 'Pcs'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#78716c', marginTop: '4px' }}>
                    Ambang batas darurat. Jika stok &le; angka ini, status menjadi <strong style={{ color: '#b91c1c' }}>Kritis / Habis (Urgent)</strong>.
                  </div>
                </div>
              </div>

              <div
                className="modal-footer"
                style={{
                  borderTop: '1px solid #ebd9b0',
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  backgroundColor: '#faf8f5'
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditThresholdItem(null)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingThreshold}
                  className="btn-dark"
                  style={{
                    padding: '8px 20px',
                    fontSize: '12.5px',
                    borderRadius: '8px',
                    cursor: savingThreshold ? 'not-allowed' : 'pointer'
                  }}
                >
                  {savingThreshold ? 'Menyimpan...' : 'Simpan Batas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Barang Baru */}
      {showAddItemModal && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div
            className="modal-content"
            style={{
              maxWidth: '560px',
              border: '1.5px solid #ebd9b0',
              borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
              overflow: 'hidden'
            }}
          >
            <div
              className="modal-header"
              style={{
                borderBottom: '1.5px solid #ebd9b0',
                background: 'linear-gradient(180deg, #fdfbf7 0%, #ffffff 100%)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#fbf7ee', border: '1px solid #ebd9b0' }}>
                  <Plus size={18} color="#8a6515" />
                </div>
                <div>
                  <h3 className="modal-title" style={{ color: '#1c1917', fontWeight: 800, margin: 0, fontSize: '15px' }}>
                    Tambah Jenis Barang Baru
                  </h3>
                  <div style={{ fontSize: '11px', color: '#78716c' }}>
                    Mendaftarkan item persediaan baru ke inventori Dangau Kubu Raya
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#78716c' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateItemSubmit}>
              <div className="modal-body" style={{ padding: '20px', maxHeight: '72vh', overflowY: 'auto' }}>
                {/* Nama Barang */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1c1917', marginBottom: '5px' }}>
                    Nama Barang / Bahan <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MINYAK GORENG 2 LITER..."
                    value={newItemForm.item_name}
                    onChange={(e) => setNewItemForm({ ...newItemForm, item_name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      border: '1.5px solid #ebd9b0',
                      backgroundColor: '#ffffff',
                      color: '#1c1917',
                      outline: 'none'
                    }}
                  />
                </div>

                {/* Kategori & Satuan */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1c1917', marginBottom: '5px' }}>
                      Kategori <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      value={newItemForm.category_id}
                      onChange={(e) => setNewItemForm({ ...newItemForm, category_id: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '12.5px',
                        borderRadius: '8px',
                        border: '1.5px solid #ebd9b0',
                        backgroundColor: '#ffffff',
                        color: '#1c1917',
                        outline: 'none'
                      }}
                    >
                      {masterCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.category_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1c1917', marginBottom: '5px' }}>
                      Satuan Ukur <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <select
                      value={newItemForm.unit_id}
                      onChange={(e) => setNewItemForm({ ...newItemForm, unit_id: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '12.5px',
                        borderRadius: '8px',
                        border: '1.5px solid #ebd9b0',
                        backgroundColor: '#ffffff',
                        color: '#1c1917',
                        outline: 'none'
                      }}
                    >
                      {masterUnits.map(u => (
                        <option key={u.id} value={u.id}>{u.unit_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Batas Minimal & Batas Kritis */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1c1917', marginBottom: '5px' }}>
                      Batas Minimal (Min Stock) <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={newItemForm.minimum_stock}
                      onChange={(e) => setNewItemForm({ ...newItemForm, minimum_stock: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        border: '1.5px solid #ebd9b0',
                        backgroundColor: '#ffffff',
                        color: '#1c1917',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1c1917', marginBottom: '5px' }}>
                      Batas Kritis Bahaya <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={newItemForm.critical_stock}
                      onChange={(e) => setNewItemForm({ ...newItemForm, critical_stock: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        border: '1.5px solid #fecaca',
                        backgroundColor: '#fffaf8',
                        color: '#991b1b',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Harga Satuan & Stok Awal */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1c1917', marginBottom: '5px' }}>
                      Harga Satuan (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={newItemForm.unit_price}
                      onChange={(e) => setNewItemForm({ ...newItemForm, unit_price: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        border: '1.5px solid #ebd9b0',
                        backgroundColor: '#ffffff',
                        color: '#1c1917',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1c1917', marginBottom: '5px' }}>
                      Stok Fisik Awal
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={newItemForm.initial_stock}
                      onChange={(e) => setNewItemForm({ ...newItemForm, initial_stock: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        borderRadius: '8px',
                        border: '1.5px solid #ebd9b0',
                        backgroundColor: '#ffffff',
                        color: '#1c1917',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Lokasi Gudang Stok Awal */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1c1917', marginBottom: '5px' }}>
                    Lokasi Gudang Penempatan Awal
                  </label>
                  <select
                    value={newItemForm.warehouse_id}
                    onChange={(e) => setNewItemForm({ ...newItemForm, warehouse_id: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      fontSize: '12.5px',
                      borderRadius: '8px',
                      border: '1.5px solid #ebd9b0',
                      backgroundColor: '#ffffff',
                      color: '#1c1917',
                      outline: 'none'
                    }}
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.warehouse_name} ({w.warehouse_code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                className="modal-footer"
                style={{
                  borderTop: '1px solid #ebd9b0',
                  padding: '14px 20px',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '10px',
                  backgroundColor: '#faf8f5'
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddItemModal(false)}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12.5px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#64748b',
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="btn-dark"
                  style={{
                    padding: '8px 20px',
                    fontSize: '12.5px',
                    borderRadius: '8px',
                    backgroundColor: '#b8860b',
                    cursor: savingItem ? 'not-allowed' : 'pointer'
                  }}
                >
                  {savingItem ? 'Menyimpan...' : 'Simpan Barang Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Impor Barang dari Excel */}
      {showImportModal && (
        <div className="modal-overlay" style={{ zIndex: 1200 }}>
          <div
            className="modal-content"
            style={{
              maxWidth: '680px',
              border: '1.5px solid #ebd9b0',
              borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.22)',
              overflow: 'hidden'
            }}
          >
            <div
              className="modal-header"
              style={{
                borderBottom: '1.5px solid #ebd9b0',
                background: 'linear-gradient(180deg, #fdfbf7 0%, #ffffff 100%)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <FileSpreadsheet size={18} color="#15803d" />
                </div>
                <div>
                  <h3 className="modal-title" style={{ color: '#1c1917', fontWeight: 800, margin: 0, fontSize: '15px' }}>
                    Impor Data Barang dari Excel (.xlsx)
                  </h3>
                  <div style={{ fontSize: '11px', color: '#78716c' }}>
                    Upload file spreadsheet untuk menambahkan barang ke database web
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#78716c' }}
              >
                &times;
              </button>
            </div>

            <div className="modal-body" style={{ padding: '20px', maxHeight: '72vh', overflowY: 'auto' }}>
              {/* Template Download Section */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  backgroundColor: '#fbf7ee',
                  border: '1px solid #ebd9b0',
                  borderRadius: '10px',
                  marginBottom: '18px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#3d2f17' }}>
                    Belum punya format template Excel?
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#78716c' }}>
                    Download template resmi yang sudah disesuaikan dengan format sistem.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    fontSize: '12px',
                    fontWeight: 700,
                    borderRadius: '7px',
                    backgroundColor: '#ffffff',
                    color: '#8a6515',
                    border: '1.5px solid #ebd9b0',
                    cursor: 'pointer'
                  }}
                >
                  <Download size={13} />
                  <span>Download Template Excel</span>
                </button>
              </div>

              {/* File Upload Zone */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#1c1917', marginBottom: '6px' }}>
                  Pilih File Excel (.xlsx / .xls)
                </label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1.5px dashed #ebd9b0',
                    borderRadius: '10px',
                    backgroundColor: '#faf8f5',
                    cursor: 'pointer',
                    fontSize: '12.5px'
                  }}
                />
              </div>

              {/* Sheet Selector if multiple sheets exist */}
              {availableSheets.length > 1 && (
                <div style={{ marginBottom: '16px', padding: '12px 14px', backgroundColor: '#fcfbf8', borderRadius: '10px', border: '1px solid #ebd9b0' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1c1917', marginBottom: '8px' }}>
                    Lembar Kerja (Sheet Excel) Terdeteksi &mdash; Pilih Sheet yang Ingin Dimasukkan:
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {availableSheets.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleSwitchSheet(s)}
                        style={{
                          padding: '7px 14px',
                          fontSize: '12px',
                          fontWeight: 700,
                          borderRadius: '8px',
                          border: activeSheetName === s ? '2px solid #15803d' : '1px solid #ebd9b0',
                          backgroundColor: activeSheetName === s ? '#f0fdf4' : '#ffffff',
                          color: activeSheetName === s ? '#15803d' : '#64748b',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {s} {activeSheetName === s ? '(Aktif)' : ''}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Default Warehouse & Import Strategy */}
              {importData.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1c1917', marginBottom: '6px' }}>
                      Gudang Penempatan Stok
                    </label>
                    <select
                      value={selectedImportWarehouse}
                      onChange={(e) => {
                        setSelectedImportWarehouse(e.target.value);
                        if (workbookInstance && activeSheetName) {
                          const items = parseSheetRows(workbookInstance, activeSheetName, e.target.value);
                          setImportData(items);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        fontSize: '12.5px',
                        borderRadius: '8px',
                        border: '1.5px solid #ebd9b0',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.warehouse_name} ({w.warehouse_code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#1c1917', marginBottom: '6px' }}>
                      Penyelarasan Database Web
                    </label>
                    <div style={{ padding: '9px 12px', backgroundColor: '#fcfbf8', border: '1px solid #ebd9b0', borderRadius: '8px', fontSize: '11.5px', color: '#785711', fontWeight: 600 }}>
                      Otomatis menambah barang baru &amp; memperbarui saldo stok yang ada
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Table */}
              {importData.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} />
                      <span>Ditemukan {importData.length} baris barang dari sheet "{activeSheetName}" siap dimasukkan</span>
                    </div>
                  </div>
                  <div style={{ maxHeight: '220px', overflowY: 'auto', border: '1px solid #ebd9b0', borderRadius: '8px' }}>
                    <table className="data-table" style={{ margin: 0, fontSize: '11px' }}>
                      <thead>
                        <tr style={{ background: '#fbf7ee' }}>
                          <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                          <th>Nama Barang</th>
                          <th style={{ textAlign: 'right' }}>Stok Fisik Awal</th>
                          <th>Satuan</th>
                          <th>Kategori</th>
                          <th style={{ textAlign: 'center' }}>Batas Min</th>
                          <th>Gudang</th>
                          <th>Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importData.slice(0, 10).map((row, idx) => {
                          const whObj = warehouses.find(w => String(w.id) === String(row.warehouse_id)) || warehouses[0];
                          return (
                            <tr key={idx}>
                              <td style={{ textAlign: 'center', color: '#78716c' }}>{idx + 1}</td>
                              <td style={{ fontWeight: 700, color: '#1c1917' }}>{row.item_name}</td>
                              <td style={{ textAlign: 'right', fontWeight: 800, color: '#15803d' }}>
                                {parseFloat(row.initial_stock || 0).toLocaleString('id-ID')}
                              </td>
                              <td style={{ color: '#57534e' }}>{row.unit_name || 'PCS'}</td>
                              <td style={{ color: '#57534e' }}>{row.category_name || 'F&B'}</td>
                              <td style={{ textAlign: 'center', color: '#78716c' }}>{row.minimum_stock || 10}</td>
                              <td style={{ fontWeight: 600, color: '#8a6515' }}>
                                {whObj?.warehouse_code || 'WH'}
                              </td>
                              <td style={{ fontSize: '10.5px', color: '#78716c' }}>
                                {row.notes || '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {importData.length > 10 && (
                    <div style={{ fontSize: '11.5px', color: '#78716c', marginTop: '6px', fontStyle: 'italic' }}>
                      ...dan {importData.length - 10} baris barang lainnya akan otomatis diproses ke database web.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              className="modal-footer"
              style={{
                borderTop: '1px solid #ebd9b0',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                backgroundColor: '#faf8f5'
              }}
            >
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                style={{
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleProcessImport}
                disabled={importing || importData.length === 0}
                className="btn-dark"
                style={{
                  padding: '9px 22px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  borderRadius: '8px',
                  backgroundColor: '#15803d',
                  cursor: (importing || importData.length === 0) ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {importing ? (
                  <>
                    <RefreshCw size={14} className="spin" />
                    <span>Menyimpan ke Database Web...</span>
                  </>
                ) : (
                  <span>Simpan ke Database Web ({importData.length} Barang)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#15803d',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Official Master Print Report Modal */}
      <MasterPrintReportModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        inventoryList={inventoryList}
        categoriesList={categoriesList}
      />
    </div>
  );
};

export default InformasiStock;

