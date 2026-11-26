import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Save,
  UserCheck,
  UserX,
  Lock,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const moduleDefinitions = [
  {
    key: 'can_barang_masuk',
    label: 'Barang Masuk (IN)',
    desc: 'Pencatatan dan penerimaan barang masuk dari vendor/supplier ke gudang.'
  },
  {
    key: 'can_barang_keluar',
    label: 'Barang Keluar (OUT)',
    desc: 'Pencatatan pengambilan barang persediaan ke outlet / departemen hotel.'
  },
  {
    key: 'can_permintaan_pembelian',
    label: 'Permintaan Pembelian (PR)',
    desc: 'Pengajuan dan persetujuan kebutuhan restock barang persediaan.'
  },
  {
    key: 'can_pesanan_pembelian',
    label: 'Pesanan Pembelian (PO)',
    desc: 'Penerbitan surat pesanan resmi kepada vendor dan tracking status pesanan.'
  },
  {
    key: 'can_stok_opname',
    label: 'Stok Opname',
    desc: 'Audit fisik persediaan berkala dan rekonsiliasi selisih stok gudang.'
  }
];

const KelolaAksesVisibilitas = () => {
  const { user: currentUser, fetchVisibilities } = useAuth();
  const [visibilities, setLocalVisibilities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingRoleId, setSavingRoleId] = useState(null);
  const [togglingUserId, setTogglingUserId] = useState(null);
  const [alert, setAlert] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [visRes, usersRes] = await Promise.all([
        api.get('/auth/visibilities'),
        api.get('/auth/users')
      ]);
      setLocalVisibilities(visRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error loading visibilities or users:', err);
      setAlert({ type: 'danger', message: 'Gagal memuat konfigurasi hak akses.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleModule = (roleId, moduleKey) => {
    setLocalVisibilities((prev) =>
      prev.map((role) => {
        if (role.role_id === roleId) {
          return {
            ...role,
            [moduleKey]: !role[moduleKey]
          };
        }
        return role;
      })
    );
  };

  const handleSaveVisibility = async (roleObj) => {
    try {
      setSavingRoleId(roleObj.role_id);
      const payload = {
        role_id: roleObj.role_id,
        can_barang_masuk: roleObj.can_barang_masuk,
        can_barang_keluar: roleObj.can_barang_keluar,
        can_permintaan_pembelian: roleObj.can_permintaan_pembelian,
        can_pesanan_pembelian: roleObj.can_pesanan_pembelian,
        can_stok_opname: roleObj.can_stok_opname
      };
      await api.put('/auth/visibilities', payload);
      await fetchVisibilities();
      setAlert({
        type: 'success',
        message: `Visibilitas menu untuk peran "${roleObj.role_name}" berhasil disimpan dan diterapkan.`
      });
      setTimeout(() => setAlert(null), 5000);
    } catch (err) {
      console.error('Error saving visibility:', err);
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Gagal menyimpan pengaturan visibilitas.'
      });
    } finally {
      setSavingRoleId(null);
    }
  };

  const handleToggleUserStatus = async (userObj) => {
    const newStatus = !userObj.is_active;
    const confirmText = newStatus
      ? `Aktifkan kembali akun "${userObj.name}"? Pengguna akan dapat login kembali.`
      : `Nonaktifkan akun "${userObj.name}"? Pengguna ini tidak akan bisa login ke dalam sistem.`;

    if (!window.confirm(confirmText)) return;

    try {
      setTogglingUserId(userObj.id);
      await api.put(`/auth/users/${userObj.id}/status`, { is_active: newStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === userObj.id ? { ...u, is_active: newStatus } : u))
      );
      setAlert({
        type: 'success',
        message: `Akun "${userObj.name}" berhasil diubah menjadi ${newStatus ? 'Aktif' : 'Nonaktif'}.`
      });
      setTimeout(() => setAlert(null), 5000);
    } catch (err) {
      console.error('Error toggling user status:', err);
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Gagal mengubah status akun pengguna.'
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#78716c' }}>
        Memuat data hak akses dan visibilitas pengguna...
      </div>
    );
  }

  // Filter roles: only Admin (id 2) and Petugas Gudang (id 3) are configurable. Master (id 1) always has full access.
  const targetRoles = visibilities.filter((r) => r.role_id !== 1);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header-block" style={{ marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '6px',
                background: '#fef3c7',
                color: '#92400e',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <ShieldCheck size={13} />
              Hak Akses Superuser Master
            </span>
          </div>
          <h1 className="page-title" style={{ fontSize: '22px', fontWeight: 800, color: '#1c1917', margin: 0 }}>
            Pengaturan Visibilitas & Hak Akses Pengguna
          </h1>
          <p className="page-description" style={{ color: '#78716c', marginTop: '4px' }}>
            Atur visibilitas menu operasional untuk peran Admin dan Petugas Gudang, serta kelola status keaktifan akun staf.
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn-outline-white"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px' }}
        >
          <RefreshCw size={15} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* Alert Feedback */}
      {alert && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: alert.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: alert.type === 'success' ? '#065f46' : '#991b1b',
            border: `1.5px solid ${alert.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
            fontSize: '13px',
            fontWeight: 500
          }}
        >
          {alert.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Section 1: Role Visibilities Configuration */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Layers size={18} style={{ color: '#c59b27' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1c1917', margin: 0 }}>
            1. Kontrol Visibilitas Menu Operasional Peran
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
          {targetRoles.map((role) => (
            <div
              key={role.role_id}
              className="card"
              style={{
                borderRadius: '14px',
                border: '2px solid #0f172a',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff'
              }}
            >
              <div>
                {/* Role Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: role.role_id === 2 ? '#eff6ff' : '#f0fdf4',
                        color: role.role_id === 2 ? '#1d4ed8' : '#15803d'
                      }}
                    >
                      {role.role_id === 2 ? 'Staf Keuangan / Admin' : 'Staf Gudang'}
                    </span>
                    <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#1c1917', marginTop: '6px', marginBottom: '2px' }}>
                      Peran: {role.role_name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#78716c', margin: 0 }}>
                      {role.role_id === 2
                        ? 'Kelola akses menu untuk staf accounting / administrasi hotel.'
                        : 'Kelola akses menu untuk petugas operasional gudang logistik.'}
                    </p>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #f1ece4', margin: '14px 0 16px 0' }} />

                {/* Module Checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {moduleDefinitions.map((mod) => {
                    const isChecked = Boolean(role[mod.key]);
                    return (
                      <div
                        key={mod.key}
                        onClick={() => handleToggleModule(role.role_id, mod.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: `1.5px solid ${isChecked ? '#fde68a' : '#e2e8f0'}`,
                          backgroundColor: isChecked ? '#fffdf5' : '#f8fafc',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ flex: 1, paddingRight: '12px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: isChecked ? '#1c1917' : '#64748b' }}>
                            {mod.label}
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#78716c', marginTop: '2px' }}>
                            {mod.desc}
                          </div>
                        </div>

                        <div
                          style={{
                            width: '42px',
                            height: '24px',
                            borderRadius: '12px',
                            backgroundColor: isChecked ? '#c59b27' : '#cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            flexShrink: 0
                          }}
                        >
                          <div
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              backgroundColor: '#ffffff',
                              transform: isChecked ? 'translateX(18px)' : 'translateX(0)',
                              transition: 'transform 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                            }}
                          >
                            {isChecked ? <Check size={12} color="#c59b27" strokeWidth={3} /> : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Button for this Role */}
              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1ece4' }}>
                <button
                  type="button"
                  onClick={() => handleSaveVisibility(role)}
                  disabled={savingRoleId === role.role_id}
                  className="btn-dark"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    fontWeight: 700
                  }}
                >
                  <Save size={16} />
                  <span>
                    {savingRoleId === role.role_id
                      ? 'Menyimpan...'
                      : `Simpan Pengaturan Visibilitas ${role.role_name}`}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: User Accounts Activation / Status */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Users size={18} style={{ color: '#c59b27' }} />
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1c1917', margin: 0 }}>
            2. Daftar & Status Keaktifan Akun Pengguna
          </h2>
        </div>

        <div className="card" style={{ padding: '0', overflow: 'hidden', border: '2px solid #0f172a', borderRadius: '14px', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', margin: 0 }}>
            <thead>
              <tr>
                <th style={{ padding: '14px 18px', textAlign: 'left' }}>PENGGUNA</th>
                <th style={{ padding: '14px 18px', textAlign: 'left' }}>EMAIL</th>
                <th style={{ padding: '14px 18px', textAlign: 'left' }}>PERAN (ROLE)</th>
                <th style={{ padding: '14px 18px', textAlign: 'left' }}>GUDANG PENUGASAN</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>STATUS</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>KONTROL AKSES</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMasterAccount = u.role_id === 1 || u.id === currentUser?.id;
                const isActive = u.is_active !== false;

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1ece4' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#1c1917' }}>{u.name}</div>
                      {isMasterAccount && (
                        <span style={{ fontSize: '10.5px', color: '#b45309', fontWeight: 600 }}>
                          Akun Superuser Master
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background:
                            u.role_name === 'Master'
                              ? '#fef3c7'
                              : u.role_name === 'Admin'
                              ? '#eff6ff'
                              : '#f0fdf4',
                          color:
                            u.role_name === 'Master'
                              ? '#92400e'
                              : u.role_name === 'Admin'
                              ? '#1d4ed8'
                              : '#15803d'
                        }}
                      >
                        {u.role_name}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', color: '#475569' }}>
                      {u.warehouse_name || 'Semua Gudang (Pusat)'}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '4px 10px',
                          borderRadius: '20px',
                          background: isActive ? '#ecfdf5' : '#fef2f2',
                          color: isActive ? '#059669' : '#dc2626',
                          border: `1px solid ${isActive ? '#a7f3d0' : '#fecaca'}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isActive ? '#059669' : '#dc2626'
                          }}
                        />
                        {isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      {isMasterAccount ? (
                        <span
                          style={{
                            fontSize: '11.5px',
                            color: '#94a3b8',
                            fontStyle: 'italic',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Lock size={12} />
                          Utama (Terkunci)
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u)}
                          disabled={togglingUserId === u.id}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            border: isActive ? '1px solid #fecaca' : '1px solid #a7f3d0',
                            backgroundColor: isActive ? '#fff5f5' : '#f0fdf4',
                            color: isActive ? '#b91c1c' : '#15803d',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {isActive ? (
                            <>
                              <UserX size={14} />
                              <span>Nonaktifkan</span>
                            </>
                          ) : (
                            <>
                              <UserCheck size={14} />
                              <span>Aktifkan Akun</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KelolaAksesVisibilitas;

