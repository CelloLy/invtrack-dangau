import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  X, 
  AlertTriangle, 
  Send, 
  Phone, 
  MessageSquare, 
  Check, 
  ExternalLink,
  Package
} from 'lucide-react';

export const generateWaRejectMessage = (pr, reason) => {
  if (!pr) return '';
  const itemsText = pr.items && pr.items.length > 0
    ? pr.items.map((i, idx) => `${idx + 1}. ${i.item_name} (${parseFloat(i.quantity)} ${i.unit_name || 'Unit'})`).join('\n')
    : `- ${pr.notes || 'Pengajuan persediaan'}`;

  const prNum = pr.pr_number || pr.req_id || '-';
  const pemohon = pr.role || pr.requester_name || 'Petugas Gudang';
  const gudang = pr.warehouse_name || 'Gudang Dangau';
  const tanggal = pr.date || '-';

  return `*PEMBERITAHUAN PENOLAKAN PERMINTAAN PEMBELIAN*
_Dangau Kubu Raya - Sistem Inventori Dangau_
------------------------------------------------
Yth. *${pemohon}*
Lokasi Gudang: *${gudang}*

Dengan ini kami informasikan bahwa pengajuan pembelian barang berikut:
*No. Dokumen:* ${prNum}
*Tanggal:* ${tanggal}

*Rincian Barang yang Diajukan:*
${itemsText}

*Status:* *DITOLAK*
*Alasan Penolakan:*
"${reason || 'Stok masih mencukupi atau koordinasikan kembali dengan bagian Accounting.'}"

Catatan: Mohon berkoordinasi kembali dengan Admin Accounting jika membutuhkan informasi lebih lanjut.

Terima kasih.
_Admin Accounting - Dangau Kubu Raya_`;
};

const QUICK_REASONS = [
  'Stok masih tersedia di gudang lain',
  'Anggaran pengadaan belum disetujui',
  'Spesifikasi barang tidak sesuai',
  'Kuantitas melebihi batas kebutuhan',
  'Ditunda untuk pengadaan periode berikutnya'
];

const RejectPRModal = ({ isOpen, onClose, prItem, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [phone, setPhone] = useState('+62 812-5509-8112');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (prItem) {
      setReason('');
      setPhone(prItem.requester_phone || '+62 812-5509-8112');
      setErrorMsg(null);
    }
  }, [prItem]);

  if (!isOpen || !prItem) return null;

  const prNum = prItem.pr_number || prItem.req_id || '-';
  const previewText = generateWaRejectMessage(prItem, reason);

  const cleanPhoneNumber = (rawPhone) => {
    let clean = (rawPhone || '6281255098112').replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (!clean.startsWith('62')) {
      clean = '62' + clean;
    }
    return clean;
  };

  const handleExecuteReject = async (sendWhatsApp = false) => {
    try {
      setSubmitting(true);
      setErrorMsg(null);

      const finalReason = reason.trim() || 'Ditolak oleh Admin Accounting';
      const prId = prItem.id;

      // 1. Simpan penolakan ke Database PostgreSQL
      await api.put(`/purchase-requests/${prId}/reject`, {
        rejection_reason: finalReason
      });

      // 2. Jika opsi kirim WA dipilih, buka API WhatsApp di tab baru
      if (sendWhatsApp) {
        const destPhone = cleanPhoneNumber(phone);
        const encoded = encodeURIComponent(previewText);
        const waUrl = `https://api.whatsapp.com/send?phone=${destPhone}&text=${encoded}`;
        window.open(waUrl, '_blank');
      }

      if (onSuccess) {
        onSuccess({
          prId,
          prNum,
          reason: finalReason,
          sentWa: sendWhatsApp,
          phone: cleanPhoneNumber(phone)
        });
      }

      onClose();
    } catch (err) {
      console.error('Gagal memproses penolakan PR:', err);
      const msg = err.response?.data?.message || err.message || 'Gagal menolak permohonan.';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '680px', 
          border: '1.5px solid #fca5a5', 
          borderRadius: '12px',
          padding: '0',
          overflow: 'hidden',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Header Modal */}
        <div 
          style={{ 
            padding: '16px 22px', 
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            borderBottom: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              backgroundColor: '#fee2e2',
              border: '1px solid #f87171',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626'
            }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#991b1b', margin: 0 }}>
                Penolakan Pengajuan & Kirim Pesan WhatsApp
              </h3>
              <div style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '2px' }}>
                Tolak Permintaan Pembelian <strong>{prNum}</strong> dan berikan alasan ke pemohon via WA
              </div>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={submitting}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '22px', 
              cursor: 'pointer', 
              color: '#991b1b' 
            }}
          >
            &times;
          </button>
        </div>

        {/* Body Modal */}
        <div style={{ padding: '20px 22px', maxHeight: '78vh', overflowY: 'auto' }}>
          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              marginBottom: '14px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              fontSize: '12.5px',
              borderRadius: '6px',
              border: '1px solid #fecaca'
            }}>
              {errorMsg}
            </div>
          )}

          {/* Ringkasan Dokumen */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            padding: '12px 14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>No. Dokumen PR</div>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>{prNum}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Pemohon / Gudang</div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                {prItem.role || prItem.requester_name || 'Petugas Gudang'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{prItem.warehouse_name || 'Gudang Dangau'}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Item Barang</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                {prItem.items && prItem.items.length > 0 ? (
                  <span>{prItem.items.map(i => `${i.item_name} (${parseFloat(i.quantity)})`).join(', ')}</span>
                ) : (
                  <span>{prItem.notes || '1 Item Barang'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Form Input Alasan Penolakan */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Alasan Penolakan <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              rows="3"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Stok masih mencukupi di Gudang White House, mohon lakukan mutasi internal terlebih dahulu."
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '12.5px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
            {/* Quick chips presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: '#64748b', alignSelf: 'center' }}>Pilihan Cepat:</span>
              {QUICK_REASONS.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(r)}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    backgroundColor: reason === r ? '#e2e8f0' : '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '4px',
                    color: '#334155',
                    cursor: 'pointer',
                    fontWeight: reason === r ? 700 : 500
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Form Input No WA Penerima */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              Nomor WhatsApp Penerima (Petugas Stock / Gudang)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                backgroundColor: '#f8fafc',
                flex: 1
              }}>
                <Phone size={14} color="#16a34a" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812-5509-8112"
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '13px',
                    width: '100%',
                    fontWeight: 600,
                    color: '#0f172a'
                  }}
                />
              </div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Format: 08xx atau 628xx
              </span>
            </div>
          </div>

          {/* Live Preview Pesan WhatsApp */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <MessageSquare size={14} color="#16a34a" />
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                Pratinjau Format Pesan WhatsApp
              </label>
            </div>
            <div style={{
              backgroundColor: '#eefbe8',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '12px 14px',
              fontSize: '12px',
              color: '#14532d',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
              fontFamily: 'monospace'
            }}>
              {previewText}
            </div>
          </div>
        </div>

        {/* Footer Aksi Modal */}
        <div 
          style={{ 
            padding: '14px 22px', 
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            style={{
              padding: '8px 16px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Batal
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Tolak Tanpa WA */}
            <button
              type="button"
              onClick={() => handleExecuteReject(false)}
              disabled={submitting}
              style={{
                padding: '8px 14px',
                border: '1px solid #fca5a5',
                borderRadius: '6px',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
              title="Tolak di sistem database saja"
            >
              {submitting ? 'Memproses...' : 'Tolak Saja (Tanpa WA)'}
            </button>

            {/* Tolak & Buka Pesan WhatsApp */}
            <button
              type="button"
              onClick={() => handleExecuteReject(true)}
              disabled={submitting}
              style={{
                padding: '8px 18px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
              }}
              title="Tolak pengajuan dan buka chat WhatsApp langsung ke petugas"
            >
              <Send size={14} />
              <span>{submitting ? 'Menyimpan...' : 'Tolak & Kirim WA'}</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectPRModal;
