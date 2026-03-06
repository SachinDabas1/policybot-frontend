import { useState, useEffect } from 'react'
import axios from 'axios'

const VEHICLE_COLORS = {
  TW: { bg: 'rgba(16,185,129,0.08)', text: '#059669', border: 'rgba(16,185,129,0.2)' },
  CAR: { bg: 'rgba(37,99,235,0.08)', text: '#2563eb', border: 'rgba(37,99,235,0.2)' },
  GCV: { bg: 'rgba(245,158,11,0.08)', text: '#d97706', border: 'rgba(245,158,11,0.2)' },
  PCV: { bg: 'rgba(139,92,246,0.08)', text: '#7c3aed', border: 'rgba(139,92,246,0.2)' },
  MISC: { bg: 'rgba(239,68,68,0.08)', text: '#dc2626', border: 'rgba(239,68,68,0.2)' },
}

function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0)
  const exp = new Date(dateStr); exp.setHours(0,0,0,0)
  return Math.ceil((exp - today) / (1000*60*60*24))
}

export default function ExpiryReminder() {
  const [policies, setPolicies] = useState([])
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    axios.get('/api/policies/expiring')
      .then(res => {
        if (res.data.count > 0) {
          setPolicies(res.data.data)
          // Auto-open after 1.5s if not dismissed today
          const lastDismissed = localStorage.getItem('pb_expiry_dismissed')
          const today = new Date().toDateString()
          if (lastDismissed !== today) {
            setTimeout(() => setOpen(true), 1500)
          }
        }
      })
      .catch(() => {})
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('pb_expiry_dismissed', new Date().toDateString())
    setDismissed(true)
    setOpen(false)
  }

  if (policies.length === 0) return null

  const fmt = d => new Date(d).toLocaleDateString('en-IN')

  return (
    <>
      {/* Bell button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 999,
            width: 52, height: 52, borderRadius: '50%', border: 'none',
            background: 'linear-gradient(145deg, #f59e0b, #d97706)',
            color: '#fff', fontSize: '22px', cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(245,158,11,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          title={`${policies.length} policies expiring soon!`}
        >
          🔔
          <span style={{
            position: 'absolute', top: 4, right: 4, width: 18, height: 18,
            borderRadius: '50%', background: '#ef4444', border: '2px solid white',
            fontSize: '10px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{policies.length}</span>
        </button>
      )}

      {/* Modal overlay */}
      {open && (
        <div
          onClick={e => e.target === e.currentTarget && setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15,23,42,0.25)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{
            width: '100%', maxWidth: '520px',
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.98)',
            borderRadius: '22px', overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(15,23,42,0.18), 0 4px 16px rgba(15,23,42,0.08)',
            animation: 'fadeUp 0.3s ease',
          }}>
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.06))',
              borderBottom: '1px solid rgba(245,158,11,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '12px',
                  background: 'linear-gradient(145deg, #f59e0b, #d97706)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.35)',
                }}>⏰</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text)' }}>
                    Policies Expiring Soon
                  </div>
                  <div style={{ fontSize: '12px', color: '#d97706', fontFamily: 'var(--font-mono)' }}>
                    {policies.length} {policies.length === 1 ? 'policy' : 'policies'} expire within 15 days
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{
                width: 32, height: 32, borderRadius: '8px', border: 'none',
                background: 'rgba(15,23,42,0.06)', color: 'var(--text2)',
                cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            {/* List */}
            <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {policies.map(p => {
                const days = daysUntil(p.policyEndDate)
                const c = VEHICLE_COLORS[p.vehicleType] || VEHICLE_COLORS.MISC
                const urgency = days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#d97706'
                return (
                  <div key={p._id} style={{
                    background: 'rgba(255,255,255,0.8)',
                    border: `1px solid ${days <= 3 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.18)'}`,
                    borderRadius: '13px', padding: '14px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.customerName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                        {p.policyNumber} · {p.registrationNumber}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ padding: '2px 7px', borderRadius: '5px', fontSize: '10px', fontWeight: 800, background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontFamily: 'var(--font-mono)' }}>{p.vehicleType}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text2)' }}>Expires: {fmt(p.policyEndDate)}</span>
                      </div>
                    </div>
                    <div style={{
                      textAlign: 'center', flexShrink: 0,
                      background: days <= 3 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
                      border: `1px solid ${days <= 3 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                      borderRadius: '10px', padding: '8px 12px',
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: urgency, lineHeight: 1 }}>{days}</div>
                      <div style={{ fontSize: '10px', color: urgency, fontWeight: 600 }}>days left</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 24px', borderTop: '1px solid rgba(199,210,254,0.3)',
              display: 'flex', gap: '10px', justifyContent: 'flex-end',
            }}>
              <button onClick={handleDismiss} style={{
                padding: '9px 20px', borderRadius: '10px',
                border: '1.5px solid rgba(199,210,254,0.6)',
                background: 'rgba(255,255,255,0.8)', color: 'var(--text2)',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
              }}>Dismiss for today</button>
              <button onClick={() => setOpen(false)} style={{
                padding: '9px 20px', borderRadius: '10px', border: 'none',
                background: 'linear-gradient(145deg, #3b82f6, #2563eb)', color: '#fff',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              }}>View Dashboard</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
