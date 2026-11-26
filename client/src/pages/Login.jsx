import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Box,
  User,
  Mail,
  Lock,
  Key,
  Eye,
  EyeOff,
  ChevronDown,
  Info,
  ArrowRight,
  Briefcase
} from 'lucide-react';

const Login = () => {
  const [mode, setMode] = useState('login');
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [email, setEmail] = useState('accounting@dangau.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [requestedRoleVal, setRequestedRoleVal] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    if (role === 'Master') {
      setEmail('master@dangau.com');
    } else if (role === 'Admin') {
      setEmail('accounting@dangau.com');
    } else if (role === 'Petugas Gudang') {
      setEmail('gudang@dangau.com');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    setRequestSuccess(true);
    setTimeout(() => {
      setRequestSuccess(false);
      setMode('login');
    }, 2000);
  };

  if (mode === 'request') {
    return (
      <div className="login-request-container">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 16px',
            background: '#0a0907',
            borderRadius: '12px',
            border: '1.5px solid rgba(212, 175, 55, 0.55)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
            marginBottom: '14px'
          }}>
            <img
              src="/logo-dangau.jpg"
              alt="Logo Dangau"
              style={{ height: '36px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <h1 className="login-brand-title">Inventori Dangau</h1>
          <p className="login-brand-subtitle">Sistem Manajemen Logistik & Gudang</p>
        </div>

        <div className="login-request-card">
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
            Request System Access
          </h2>
          <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '20px', lineHeight: 1.4 }}>
            Please provide your details to request an account. Access must be approved by an administrator.
          </p>

          {requestSuccess && (
            <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '10px 14px', borderRadius: '6px', fontSize: '12.5px', marginBottom: '16px' }}>
              Access request submitted successfully! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleRequestSubmit}>
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="input-label-sm">FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="login-input"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <User size={15} className="input-inner-icon" />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="input-label-sm">WORK EMAIL</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="login-input"
                  placeholder="john.doe@company.com"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  required
                />
                <Mail size={15} className="input-inner-icon" />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="input-label-sm">TEMPORARY PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  required
                />
                <Lock size={15} className="input-inner-icon" />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="input-label-sm">REQUESTED SYSTEM ROLE</label>
              <div style={{ position: 'relative' }}>
                <select
                  className="login-input"
                  style={{ appearance: 'none', cursor: 'pointer' }}
                  value={requestedRoleVal}
                  onChange={(e) => setRequestedRoleVal(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a role...</option>
                  <option value="Admin">Admin / Accounting Supervisor</option>
                  <option value="Master">Master / Executive Owner</option>
                  <option value="Petugas Gudang">Petugas Gudang / Operator</option>
                </select>
                <Briefcase size={15} className="input-inner-icon" />
                <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              </div>
            </div>

            <button type="submit" className="login-btn-dark">
              <span>Submit Request</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12.5px', color: '#64748b' }}>
          Already have an account?{' '}
          <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
            Log in here.
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="split-login-container">
      <div className="split-login-left">
        <div className="split-left-overlay" />
        <div className="split-left-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <div style={{
            padding: '32px 40px',
            borderRadius: '24px',
            background: '#0a0907',
            border: '2px solid rgba(212, 175, 55, 0.55)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(212, 175, 55, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '420px',
            width: '85%'
          }}>
            <img
              src="/logo-dangau.jpg"
              alt="Logo Dangau Hotel"
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
        </div>
      </div>

      <div className="split-login-right">
        <div className="split-form-wrapper">
          <div className="mobile-logo-wrap" style={{ display: 'none', marginBottom: '20px', textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex',
              padding: '8px 16px',
              background: '#0a0907',
              borderRadius: '12px',
              border: '1.5px solid rgba(212, 175, 55, 0.55)'
            }}>
              <img src="/logo-dangau.jpg" alt="Logo Dangau" style={{ height: '32px', width: 'auto' }} />
            </div>
          </div>
          <h2 className="split-form-title">Inventori Dangau</h2>
          <p className="split-form-subtitle">
            System Login • Authenticate to access warehouse management tools.
          </p>

          {error && (
            <div className="login-error-box">
              {error}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="input-label-sm">SYSTEM ROLE</label>
              <div style={{ position: 'relative' }}>
                <select
                  className="login-input"
                  style={{ appearance: 'none', cursor: 'pointer' }}
                  value={selectedRole}
                  onChange={handleRoleChange}
                >
                  <option value="Admin">Admin / Accounting Supervisor</option>
                  <option value="Master">Master / Executive Owner (Read-Only)</option>
                  <option value="Petugas Gudang">Petugas Gudang / Warehouse Staff</option>
                </select>
                <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '18px' }}>
              <label className="input-label-sm">EMAIL OR EMPLOYEE ID</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="login-input"
                  placeholder="e.g. WH-1042 or user@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <User size={15} className="input-inner-icon" />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="input-label-sm" style={{ marginBottom: 0 }}>ACCESS TOKEN / PASSWORD</label>
                <button
                  type="button"
                  onClick={() => alert('Demo Password: password123')}
                  style={{ background: 'none', border: 'none', fontSize: '11px', fontWeight: 600, color: '#2563eb', cursor: 'pointer' }}
                >
                  Reset Token?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Key size={15} className="input-inner-icon" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="restricted-info-box">
              <Info size={16} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                This is a restricted access system. All activities are logged and monitored for security and compliance purposes.
              </span>
            </div>

            <button type="submit" className="login-btn-dark" disabled={loading}>
              <span>{loading ? 'Authenticating...' : 'Authenticate'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
            <span>v2.4.1 (Stable)</span>
            <button
              onClick={() => setMode('request')}
              style={{ background: 'none', border: 'none', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              Request Access
            </button>
            <span style={{ cursor: 'pointer' }} onClick={() => alert('Contact System Admin: admin@dangau.com')}>Support Desk</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
