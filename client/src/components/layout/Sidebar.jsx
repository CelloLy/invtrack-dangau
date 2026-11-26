import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  LayoutGrid,
  LogIn,
  LogOut,
  FileText,
  ShoppingCart,
  Package,
  Settings,
  ShieldCheck,
  Building2,
  Box,
  Boxes,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, selectedWarehouse, tempBadge, isGudang, isAdmin, isMaster, canAccess } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  const isAccountingUser = isAdmin || user?.role_name === 'Admin' || user?.role_name === 'Accounting' || user?.name?.toLowerCase().includes('accounting');
  const isGudangUser = isGudang || user?.role_name === 'Petugas Gudang' || user?.name?.toLowerCase().includes('gudang');

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const res = await api.get('/purchase-requests?status=Menunggu');
        if (Array.isArray(res.data)) {
          setPendingCount(res.data.length);
        }
      } catch (err) {
        console.warn('Error fetching pending PR count for sidebar:', err);
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 4000);
    return () => clearInterval(interval);
  }, [selectedWarehouse]);

  const activeBadge = tempBadge || (pendingCount > 0 ? String(pendingCount) : null);

  const navItems = isMaster
    ? [
        { label: 'Beranda', path: '/dashboard', icon: LayoutGrid },
        { label: 'Informasi Stock', path: '/informasi-stok', icon: Boxes },
        { label: 'Barang Masuk', path: '/barang-masuk', icon: LogIn },
        { label: 'Barang Keluar', path: '/barang-keluar', icon: LogOut },
        { label: 'Permintaan Pembelian', path: '/permintaan-pembelian', icon: FileText, badge: activeBadge },
        { label: 'Pesanan Pembelian', path: '/pesanan-pembelian', icon: ShoppingCart },
        { label: 'Stok Opname', path: '/stok-opname', icon: Package },
        { label: 'Atur Visibilitas User', path: '/kelola-akses', icon: ShieldCheck }
      ]
    : [
        { label: 'Beranda', path: '/dashboard', icon: LayoutGrid },
        { label: 'Informasi Stock', path: '/informasi-stok', icon: Boxes },
        ...(canAccess('can_barang_masuk') ? [{ label: 'Barang Masuk', path: '/barang-masuk', icon: LogIn }] : []),
        ...(canAccess('can_barang_keluar') ? [{ label: 'Barang Keluar', path: '/barang-keluar', icon: LogOut }] : []),
        ...(canAccess('can_permintaan_pembelian') ? [{ label: 'Permintaan Pembelian', path: '/permintaan-pembelian', icon: FileText, badge: activeBadge }] : []),
        ...(!isGudangUser && canAccess('can_pesanan_pembelian') ? [{ label: 'Pesanan Pembelian', path: '/pesanan-pembelian', icon: ShoppingCart }] : []),
        ...(canAccess('can_stok_opname') ? [{ label: 'Stok Opname', path: '/stok-opname', icon: Package }] : [])
      ];

  return (
    <aside className={`sidebar no-print ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header" style={{ padding: '18px 16px', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '5px 7px',
            borderRadius: '10px',
            background: '#0a0907',
            border: '1.5px solid rgba(212, 175, 55, 0.55)',
            boxShadow: '0 4px 14px rgba(212, 175, 55, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <img 
              src="/logo-dangau.jpg" 
              alt="Dangau Logo" 
              style={{ height: '32px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              lineHeight: 1.2
            }}>
              INVENTORI DANGAU
            </div>
            <div style={{
              color: '#d4af37',
              fontSize: '10.5px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginTop: '2px'
            }}>
              Dangau Kubu Raya
            </div>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            title="Tutup Menu"
            style={{
              background: 'none',
              border: 'none',
              color: '#d4af37',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => {
                if (onClose) onClose();
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {!isGudang && (
          <NavLink to="/master-data" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Settings size={18} />
            <span>Pengaturan</span>
          </NavLink>
        )}

        <button
          onClick={logout}
          className="nav-item"
          style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
