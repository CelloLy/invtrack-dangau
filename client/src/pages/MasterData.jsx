import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Boxes, Layers, Tag, Truck, Building2, Users, Search, Edit2, Trash2 } from 'lucide-react';

const MasterData = () => {
  const { isMaster, isGudang, globalSearch } = useAuth();
  const [activeTab, setActiveTab] = useState('items');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);

  // Form State for Adding Item
  const [newItem, setNewItem] = useState({
    sku: '',
    item_name: '',
    category_id: '1',
    unit_id: '1',
    minimum_stock: '10',
    critical_stock: '5',
    unit_price: '50000'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, catRes, unitRes, supRes, whRes, userRes] = await Promise.all([
        api.get('/items'),
        api.get('/categories'),
        api.get('/units'),
        api.get('/suppliers'),
        api.get('/warehouses'),
        api.get('/auth/users')
      ]);

      setItems(itemsRes.data);
      setCategories(catRes.data);
      setUnits(unitRes.data);
      setSuppliers(supRes.data);
      setWarehouses(whRes.data);
      setUsersList(userRes.data);
    } catch (err) {
      console.error('Error loading master data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/items', newItem);
      setShowItemModal(false);
      fetchData();
      setNewItem({
        sku: '',
        item_name: '',
        category_id: '1',
        unit_id: '1',
        minimum_stock: '10',
        critical_stock: '5',
        unit_price: '50000'
      });
    } catch (err) {
      console.warn('Create item warning:', err);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/items/${id}`);
      fetchData();
    } catch (err) {
      console.warn('Delete item warning:', err);
    }
  };

  return (
    <div>
      <div className="page-header-block">
        <div>
          <h1 className="page-title">Kelola Master Data Sistem</h1>
          <p className="page-description">
            Manajemen master data barang, kategori, satuan, supplier, lokasi gudang, dan pengguna
          </p>
        </div>

        {activeTab === 'items' && (
          <button onClick={() => setShowItemModal(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>+ Tambah Barang Baru</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          className={`btn ${activeTab === 'items' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('items')}
        >
          <Boxes size={16} /> Data Barang ({items.length})
        </button>

        <button
          className={`btn ${activeTab === 'suppliers' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('suppliers')}
        >
          <Truck size={16} /> Supplier ({suppliers.length})
        </button>

        <button
          className={`btn ${activeTab === 'warehouses' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('warehouses')}
        >
          <Building2 size={16} /> Gudang ({warehouses.length})
        </button>

        <button
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} /> User & Peran ({usersList.length})
        </button>
      </div>

      {/* Tab 1: Data Barang */}
      {activeTab === 'items' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th>Satuan</th>
                <th>Stok Keseluruhan</th>
                {!isGudang && <th>Harga Satuan (IDR)</th>}
                <th>Batas Min / Kritis</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter(item =>
                  item.item_name.toLowerCase().includes(globalSearch.toLowerCase())
                )
                .map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.item_name}</td>
                  <td>{item.category_name}</td>
                  <td>{item.unit_name}</td>
                  <td style={{ fontWeight: 700, color: '#2563eb' }}>
                    {parseFloat(item.total_stock)} {item.unit_name}
                  </td>
                  {!isGudang && <td>Rp {parseFloat(item.unit_price).toLocaleString('id-ID')}</td>}
                  <td style={{ fontSize: '12px', color: '#64748b' }}>
                    Min: {parseFloat(item.minimum_stock)} | Kritis: {parseFloat(item.critical_stock)}
                  </td>
                  <td>
                    <button onClick={() => handleDeleteItem(item.id)} className="btn btn-danger btn-sm" title="Hapus Barang">
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Supplier */}
      {activeTab === 'suppliers' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Supplier</th>
                <th>Kontak / Telp</th>
                <th>Alasan / Alamat</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id}>
                  <td>#{s.id}</td>
                  <td style={{ fontWeight: 700 }}>{s.supplier_name}</td>
                  <td>{s.contact}</td>
                  <td>{s.address}</td>
                  <td>
                    <span className="badge badge-success">{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Gudang */}
      {activeTab === 'warehouses' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Gudang</th>
                <th>Lokasi Fasilitas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {warehouses.map((w) => (
                <tr key={w.id}>
                  <td>
                    <span className={`badge ${w.warehouse_code === 'WH-DG' ? 'badge-wh-dg' : 'badge-wh-rb'}`}>
                      {w.warehouse_code}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{w.warehouse_name}</td>
                  <td>{w.location}</td>
                  <td>
                    <span className="badge badge-success">{w.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: User */}
      {activeTab === 'users' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Pengguna</th>
                <th>Email</th>
                <th>Peran / Role</th>
                <th>Gudang Asosiasi</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((u) => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td style={{ fontWeight: 700 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge badge-info">{u.role_name}</span>
                  </td>
                  <td>{u.warehouse_name || 'Semua Gudang'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Form Tambah Barang */}
      {showItemModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Tambah Barang Master Baru</h3>
              <button onClick={() => setShowItemModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateItem}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Nama Barang *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Contoh: Beras Pandan Wangi 5kg"
                    value={newItem.item_name}
                    onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Kategori *</label>
                    <select
                      className="form-control"
                      value={newItem.category_id}
                      onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.category_name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Satuan *</label>
                    <select
                      className="form-control"
                      value={newItem.unit_id}
                      onChange={(e) => setNewItem({ ...newItem, unit_id: e.target.value })}
                    >
                      {units.map(u => (
                        <option key={u.id} value={u.id}>{u.unit_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="form-label">Stok Minimum (Alert)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newItem.minimum_stock}
                      onChange={(e) => setNewItem({ ...newItem, minimum_stock: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stok Kritis (Warning)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newItem.critical_stock}
                      onChange={(e) => setNewItem({ ...newItem, critical_stock: e.target.value })}
                    />
                  </div>
                </div>

                {!isGudang && (
                  <div className="form-group">
                    <label className="form-label">Harga Satuan (IDR)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newItem.unit_price}
                      onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowItemModal(false)} className="btn btn-secondary">
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Barang Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
