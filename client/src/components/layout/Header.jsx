import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Search,
  Bell,
  HelpCircle,
  Store,
  User,
  LogOut,
  ShieldCheck,
  Mail,
  Building2,
  X,
  Check,
  CheckCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FileText,
  PackagePlus,
  ArrowUpRight,
  ClipboardList,
  Info,
  ExternalLink,
  Menu
} from 'lucide-react';

const Header = ({ title, onToggleSidebar }) => {
  const {
    user,
    logout,
    isMaster,
    selectedWarehouse,
    setSelectedWarehouse,
    globalSearch,
    setGlobalSearch
  } = useAuth();

  const navigate = useNavigate();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifFilter, setNotifFilter] = useState('all');
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const notifDropdownRef = useRef(null);

  const userRole = user?.role_name || 'Admin';
  const userName = user?.name || (userRole === 'Master' ? 'Peran Master' : userRole === 'Admin' ? 'Accounting Manager' : 'Petugas Gudang');
  const userWarehouse = user?.warehouse_name ? `Gudang: ${user.warehouse_name}` : 'Gudang: White House';
  const avatarInitial = user?.name ? user.name.charAt(0).toUpperCase() : userRole.charAt(0).toUpperCase();

  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await api.get('/notifications');
      if (res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Gagal memuat notifikasi:', err.message);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    if (showNotifDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifDropdown]);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.is_read) {
      await handleMarkAsRead(notif.id);
    }
    setShowNotifDropdown(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);

    if (diffSecs < 60) return 'Baru saja';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} mnt lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  const getNotifVisuals = (type) => {
    switch (type) {
      case 'WARNING':
        return {
          bg: '#fef3c7',
          color: '#d97706',
          icon: <AlertTriangle size={18} color="#d97706" />
        };
      case 'DANGER':
        return {
          bg: '#fee2e2',
          color: '#dc2626',
          icon: <AlertCircle size={18} color="#dc2626" />
        };
      case 'SUCCESS':
        return {
          bg: '#dcfce7',
          color: '#15803d',
          icon: <CheckCircle2 size={18} color="#15803d" />
        };
      case 'PR':
        return {
          bg: '#e0e7ff',
          color: '#4338ca',
          icon: <FileText size={18} color="#4338ca" />
        };
      case 'RECEIPT':
        return {
          bg: '#d1fae5',
          color: '#047857',
          icon: <PackagePlus size={18} color="#047857" />
        };
      case 'ISSUE':
        return {
          bg: '#f3e8ff',
          color: '#7e22ce',
          icon: <ArrowUpRight size={18} color="#7e22ce" />
        };
      case 'OPNAME':
        return {
          bg: '#e0f2fe',
          color: '#0369a1',
          icon: <ClipboardList size={18} color="#0369a1" />
        };
      default:
        return {
          bg: '#f1f5f9',
          color: '#334155',
          icon: <Info size={18} color="#334155" />
        };
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'unread') return !n.is_read;
    return true;
  });

  return (
    <>
      <header className="top-header no-print">
        <div className="header-left">
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={onToggleSidebar}
            title="Buka Menu Navigasi"
          >
            <Menu size={20} />
          </button>
          {title ? (
            <h2 className="header-page-title">{title}</h2>
          ) : (
            <div className="header-search">
              <Search className="header-search-icon" />
              <input
                type="text"
                placeholder="Cari..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="header-actions">
          {title && (
            <div className="header-search">
              <Search className="header-search-icon" />
              <input
                type="text"
                placeholder="Cari nama barang, PO,..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', padding: '5px 12px', borderRadius: '8px', border: '2px solid #0f172a', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.06)' }}>
            <Store size={15} color="#b8860b" />
            <select
              style={{ border: 'none', background: 'transparent', fontSize: '12px', fontWeight: '800', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            >
              <option value="ALL">Warehouse: All Warehouses</option>
              <option value="1">Warehouse: Gudang Dangau</option>
              <option value="2">Warehouse: Gudang White House</option>
            </select>
          </div>

          <div ref={notifDropdownRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                if (!showNotifDropdown) fetchNotifications();
              }}
              style={{
                background: showNotifDropdown ? '#f1f5f9' : 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                padding: '7px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s ease'
              }}
              title="Notifikasi Sistem"
            >
              <Bell size={19} color={unreadCount > 0 ? '#0f172a' : '#64748b'} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    minWidth: '17px',
                    height: '17px',
                    padding: '0 4px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: '800',
                    borderRadius: '9999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(239, 68, 68, 0.45)',
                    lineHeight: 1
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="notif-dropdown">
                <div className="notif-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                      Notifikasi
                    </span>
                    {unreadCount > 0 && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        padding: '1px 8px',
                        borderRadius: '12px'
                      }}>
                        {unreadCount} baru
                      </span>
                    )}
                  </div>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 6px',
                        borderRadius: '6px'
                      }}
                      title="Tandai semua telah dibaca"
                    >
                      <CheckCheck size={14} />
                      <span>Tandai Semua Dibaca</span>
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: '#f8fafc',
                  padding: '4px 12px 0 12px'
                }}>
                  <button
                    type="button"
                    onClick={() => setNotifFilter('all')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: notifFilter === 'all' ? '2px solid #2563eb' : '2px solid transparent',
                      color: notifFilter === 'all' ? '#2563eb' : '#64748b',
                      fontWeight: notifFilter === 'all' ? 700 : 500,
                      fontSize: '12px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Semua ({notifications.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifFilter('unread')}
                    style={{
                      background: 'none',
                      border: 'none',
                      borderBottom: notifFilter === 'unread' ? '2px solid #2563eb' : '2px solid transparent',
                      color: notifFilter === 'unread' ? '#2563eb' : '#64748b',
                      fontWeight: notifFilter === 'unread' ? 700 : 500,
                      fontSize: '12px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Belum Dibaca ({unreadCount})
                  </button>
                </div>

                <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {filteredNotifications.length === 0 ? (
                    <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                      <Bell size={28} color="#cbd5e1" style={{ margin: '0 auto 10px auto', display: 'block' }} />
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                        Tidak ada notifikasi {notifFilter === 'unread' ? 'baru' : ''}
                      </div>
                      <div style={{ fontSize: '11.5px', marginTop: '4px' }}>
                        Aktivitas sistem dan pengingat stok akan muncul di sini.
                      </div>
                    </div>
                  ) : (
                    filteredNotifications.map((notif) => {
                      const visuals = getNotifVisuals(notif.type);
                      return (
                        <div
                          key={notif.id}
                          className={`notif-item ${!notif.is_read ? 'unread' : ''}`}
                          onClick={() => handleNotifClick(notif)}
                        >
                          <div
                            className="notif-item-icon"
                            style={{ backgroundColor: visuals.bg }}
                          >
                            {visuals.icon}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '12.5px', fontWeight: notif.is_read ? 600 : 700, color: '#0f172a', lineHeight: 1.3 }}>
                                {notif.title}
                              </span>
                              {!notif.is_read && (
                                <span
                                  style={{
                                    width: '7px',
                                    height: '7px',
                                    backgroundColor: '#2563eb',
                                    borderRadius: '50%',
                                    flexShrink: 0
                                  }}
                                  title="Belum dibaca"
                                />
                              )}
                            </div>

                            <p style={{ fontSize: '11.5px', color: '#475569', margin: '0 0 6px 0', lineHeight: 1.45 }}>
                              {notif.message}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: '#94a3b8' }}>
                              <span>{formatTimeAgo(notif.created_at)}</span>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {notif.link && (
                                  <span style={{ color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <span>Buka</span>
                                    <ExternalLink size={10} />
                                  </span>
                                )}
                                {!notif.is_read && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#64748b',
                                      cursor: 'pointer',
                                      padding: '2px 4px',
                                      borderRadius: '4px',
                                      fontSize: '10px'
                                    }}
                                    title="Tandai telah dibaca"
                                  >
                                    <Check size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid #f1f5f9',
                  textAlign: 'center',
                  fontSize: '11px',
                  color: '#64748b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Peran: <strong style={{ color: '#0f172a' }}>{userRole}</strong></span>
                  <span style={{ color: '#94a3b8' }}>Sinkronisasi Otomatis</span>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => alert('Bantuan Inventori Dangau: Hubungi Admin Accounting jika Anda memerlukan reset password atau izin tambahan.')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center' }}
            title="Pusat Bantuan"
          >
            <HelpCircle size={18} color="#475569" />
          </button>

          <div
            className="user-profile-badge"
            onClick={() => setShowProfileModal(true)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            title="Klik untuk melihat Detail Profil"
          >
            <div className="user-info">
              <span className="user-name">{userName}</span>
              <span className="user-role-label">{userWarehouse}</span>
            </div>
            <div className="user-avatar-placeholder">
              {avatarInitial}
            </div>
          </div>
        </div>
      </header>

      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', borderRadius: '12px' }}>
            <div className="modal-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#0f172a" />
                <h3 className="modal-title" style={{ fontSize: '16px', fontWeight: 700 }}>Detail Profil Pengguna</h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            <div className="modal-body" style={{ padding: '24px', textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#0b132b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  fontWeight: '700',
                  margin: '0 auto 16px auto',
                  boxShadow: '0 4px 12px rgba(11, 19, 43, 0.2)'
                }}
              >
                {avatarInitial}
              </div>

              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{userName}</h2>
              <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, backgroundColor: '#dbeafe', padding: '2px 10px', borderRadius: '12px' }}>
                {userRole}
              </span>

              <div style={{ textAlign: 'left', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <Mail size={16} color="#64748b" />
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Email Terdaftar</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{user?.email || 'admin@dangau.com'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <ShieldCheck size={16} color="#64748b" />
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Peran Akses</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{userRole}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <Building2 size={16} color="#64748b" />
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Lokasi Gudang Utama</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{user?.warehouse_name || 'Gudang Dangau'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={logout}
                className="btn-dark"
                style={{ backgroundColor: '#be123c', fontSize: '12px', padding: '8px 14px' }}
              >
                <LogOut size={14} />
                <span>Keluar Akun</span>
              </button>

              <button
                onClick={() => setShowProfileModal(false)}
                className="btn-outline-white"
                style={{ fontSize: '12px', padding: '8px 14px' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
