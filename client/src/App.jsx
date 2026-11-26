import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Layout from './components/layout/Layout';
import Login from './pages/Login';
import MasterDashboard from './pages/MasterDashboard';
import BarangMasuk from './pages/BarangMasuk';
import BarangKeluar from './pages/BarangKeluar';
import PermintaanPembelian from './pages/PermintaanPembelian';
import PesananPembelian from './pages/PesananPembelian';
import StokOpname from './pages/StokOpname';
import MasterData from './pages/MasterData';
import KelolaAksesVisibilitas from './pages/KelolaAksesVisibilitas';
import InformasiStock from './pages/InformasiStock';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat Inventori Dangau...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const RoleProtectedRoute = ({ children, restrictedRoles = [], moduleKey = null }) => {
  const { user, loading, canAccess } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Memuat Inventori Dangau...</div>;
  if (!user) return <Navigate to="/login" replace />;
  // Master is superuser and has unrestricted access to everything
  if (user.role_name === 'Master') return <Layout>{children}</Layout>;
  // Check explicit role restrictions
  if (restrictedRoles.includes(user.role_name)) return <Navigate to="/dashboard" replace />;
  // Check dynamic module visibility configured by Master
  if (moduleKey && !canAccess(moduleKey)) return <Navigate to="/dashboard" replace />;
  return <Layout>{children}</Layout>;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <MasterDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/barang-masuk"
        element={
          <RoleProtectedRoute moduleKey="can_barang_masuk">
            <BarangMasuk />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/barang-keluar"
        element={
          <RoleProtectedRoute moduleKey="can_barang_keluar">
            <BarangKeluar />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/permintaan-pembelian"
        element={
          <RoleProtectedRoute moduleKey="can_permintaan_pembelian">
            <PermintaanPembelian />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/pesanan-pembelian"
        element={
          <RoleProtectedRoute moduleKey="can_pesanan_pembelian">
            <PesananPembelian />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/stok-opname"
        element={
          <RoleProtectedRoute moduleKey="can_stok_opname">
            <StokOpname />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/master-data"
        element={
          <RoleProtectedRoute restrictedRoles={['Petugas Gudang']}>
            <MasterData />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/kelola-akses"
        element={
          <RoleProtectedRoute restrictedRoles={['Admin', 'Petugas Gudang']}>
            <KelolaAksesVisibilitas />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="/informasi-stok"
        element={
          <ProtectedRoute>
            <InformasiStock />
          </ProtectedRoute>
        }
      />

      <Route
        path="/informasi-stock"
        element={
          <ProtectedRoute>
            <InformasiStock />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stok-barang"
        element={
          <ProtectedRoute>
            <InformasiStock />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
