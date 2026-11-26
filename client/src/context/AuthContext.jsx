import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    const token = sessionStorage.getItem('invtrack_token') || localStorage.getItem('invtrack_token');
    const savedUser = sessionStorage.getItem('invtrack_user') || localStorage.getItem('invtrack_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        sessionStorage.removeItem('invtrack_token');
        sessionStorage.removeItem('invtrack_user');
        localStorage.removeItem('invtrack_token');
        localStorage.removeItem('invtrack_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    sessionStorage.setItem('invtrack_token', token);
    sessionStorage.setItem('invtrack_user', JSON.stringify(userData));
    localStorage.setItem('invtrack_token', token);
    localStorage.setItem('invtrack_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    sessionStorage.removeItem('invtrack_token');
    sessionStorage.removeItem('invtrack_user');
    localStorage.removeItem('invtrack_token');
    localStorage.removeItem('invtrack_user');
    setUser(null);
  };

  // Quick Role Switching Demo Helper for testing Master, Admin, & Petugas Gudang
  const switchRoleDemo = async (roleEmail) => {
    try {
      await login(roleEmail, 'password123');
    } catch (err) {
      console.error('Failed role switch demo:', err);
    }
  };

  const [tempBadge, setTempBadge] = useState(null);
  const [visibilities, setVisibilities] = useState([]);

  const fetchVisibilities = async () => {
    try {
      const res = await api.get('/auth/visibilities');
      if (Array.isArray(res.data)) {
        setVisibilities(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch visibilities:', err);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem('invtrack_token') || localStorage.getItem('invtrack_token');
    if (token) {
      fetchVisibilities();
    }
  }, [user]);

  const canAccess = (moduleKey) => {
    if (!user) return false;
    // Master is Superuser and can access all modules
    if (user.role_name === 'Master') return true;

    // Aturan Khusus Role:
    // DI ACCOUNTING --> PERMINTAAN PEMBELIAN TIDAK USAH DITAMPILKAN
    const isAccountingUser = user.role_name === 'Admin' || user.role_name === 'Accounting' || user.name?.toLowerCase().includes('accounting');
    if (isAccountingUser && moduleKey === 'can_permintaan_pembelian') {
      return false;
    }

    // DI PETUGAS GUDANG --> PESANAN PEMBELIAN TIDAK USAH DI TAMPILKAN
    const isGudangUser = user.role_name === 'Petugas Gudang' || user.role_name === 'Gudang' || user.name?.toLowerCase().includes('gudang');
    if (isGudangUser && moduleKey === 'can_pesanan_pembelian') {
      return false;
    }

    if (!visibilities || visibilities.length === 0) return true;
    const roleVis = visibilities.find(v => v.role_name === user.role_name || v.role_id === user.role_id);
    if (!roleVis) return true;
    return roleVis[moduleKey] !== false;
  };

  const triggerTempBadge = (val = '1', durationMs = 5000) => {
    setTempBadge(String(val));
    setTimeout(() => {
      setTempBadge(null);
    }, durationMs);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        switchRoleDemo,
        selectedWarehouse,
        setSelectedWarehouse,
        globalSearch,
        setGlobalSearch,
        tempBadge,
        triggerTempBadge,
        visibilities,
        fetchVisibilities,
        canAccess,
        isMaster: user?.role_name === 'Master',
        isAdmin: user?.role_name === 'Admin',
        isGudang: user?.role_name === 'Petugas Gudang',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
