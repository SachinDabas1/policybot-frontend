import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const VEHICLE_COLORS = {
  TW: { bg: 'rgba(16,185,129,0.08)', text: '#059669', border: 'rgba(16,185,129,0.2)', dot: '#10b981' },
  CAR: { bg: 'rgba(37,99,235,0.08)', text: '#2563eb', border: 'rgba(37,99,235,0.2)', dot: '#3b82f6' },
  GCV: { bg: 'rgba(245,158,11,0.08)', text: '#d97706', border: 'rgba(245,158,11,0.2)', dot: '#f59e0b' },
  PCV: { bg: 'rgba(139,92,246,0.08)', text: '#7c3aed', border: 'rgba(139,92,246,0.2)', dot: '#8b5cf6' },
  MISC: { bg: 'rgba(239,68,68,0.08)', text: '#dc2626', border: 'rgba(239,68,68,0.2)', dot: '#ef4444' },
}
const glass = { background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.95)', borderRadius: '16px', boxShadow: '0 4px 20px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,1)' }

export default function AdminDashboard({ isAdmin = false }) {
  const now = new Date()
  const [tab, setTab] = useState('policies') // policies | expiring
  const [policies, setPolicies] = useState([])
  const [expiring, setExpiring] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [exportLoading, setExportLoading] = useState(false)
  const [editPolicy, setEditPolicy] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)

  const fetchStats = async () => {
    try { const r = await axios.get('/api/policies/stats'); setStats(r.data.data) } catch {}
  }
  const fetchExpiring = async () => {
    try { const r = await axios.get('/api/policies/expiring'); setExpiring(r.data.data) } catch {}
  }
  const fetchPolicies = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10, month: selectedMonth, year: selectedYear }
      if (search) params.search = search
      if (vehicleFilter) params.vehicleType = vehicleFilter
      const r = await axios.get('/api/policies', { params })
      setPolicies(r.data.data); setTotalPages(r.data.totalPages); setTotal(r.data.total)
    } catch {}
    finally { setLoading(false) }
  }, [page, search, vehicleFilter, selectedMonth, selectedYear])

  useEffect(() => { fetchStats(); fetchExpiring() }, [])
  useEffect(() => { fetchPolicies() }, [fetchPolicies])

  const handleExport = async () => {
    setExportLoading(true)
    try {
      const params = { month: selectedMonth, year: selectedYear }
      if (vehicleFilter) params.vehicleType = vehicleFilter
      const r = await axios.get('/api/policies/export/excel', { params, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([r.data]))
      const link = document.createElement('a'); link.href = url
      link.setAttribute('download', `policies_${MONTHS[selectedMonth-1]}_${selectedYear}.xlsx`)
      document.body.appendChild(link); link.click(); link.remove()
    } catch { alert('Export failed or no data for this month') }
    finally { setExportLoading(false) }
  }

  const openEdit = (p) => {
    setEditPolicy(p)
    setEditForm({
      customerName: p.customerName, number: p.number,
      registrationNumber: p.registrationNumber, policyNumber: p.policyNumber,
      policyStartDate: p.policyStartDate?.split('T')[0],
      policyEndDate: p.policyEndDate?.split('T')[0],
      vehicleType: p.vehicleType, premium: p.premium,
    })
  }

  const handleEditSave = async () => {
    setEditLoading(true)
    try {
      await axios.put(`/api/policies/${editPolicy._id}`, { ...editForm, premium: Number(editForm.premium) })
      setEditPolicy(null)
      fetchPolicies(); fetchStats()
    } catch (e) { alert(e.response?.data?.message || 'Update failed') }
    finally { setEditLoading(false) }
  }

  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN') : '—'
  const fmtC = n => `₹${Number(n).toLocaleString('en-IN')}`

  const daysLeft = d => {
    const today = new Date(); today.setHours(0,0,0,0)
    const exp = new Date(d); exp.setHours(0,0,0,0)
    return Math.ceil((exp - today) / 86400000)
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px 20px' }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.03em' }}>Policy <span style={{ color: 'var(--accent)' }}>Dashboard</span></h1>
            <p style={{ color: 'var(--text3)', fontSize: '13px', fontFamily: 'var(--font-mono)', marginTop: '3px' }}>{total} records · {MONTHS[selectedMonth-1]} {selectedYear}</p>
          </div>
          {isAdmin && <button onClick={handleExport} disabled={exportLoading} style={{
            padding: '10px 22px', borderRadius: '12px',
            border: exportLoading ? '1.5px solid rgba(199,210,254,0.5)' : 'none',
            background: exportLoading ? 'rgba(241,245,249,0.9)' : 'linear-gradient(145deg, #3b82f6, #2563eb)',
            color: exportLoading ? 'var(--text3)' : '#fff',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px',
            cursor: exportLoading ? 'not-allowed' : 'pointer',
            boxShadow: exportLoading ? 'none' : '0 4px 14px rgba(37,99,235,0.3)', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            {exportLoading ? '⏳' : '↓'} {exportLoading ? 'Exporting...' : `Export ${MONTHS[selectedMonth-1]} Excel`}
          </button>}
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <StatCard icon="📋" label="Total Policies" value={stats.totalPolicies} />
            <StatCard icon="📅" label={`${stats.currentMonthName} Policies`} value={stats.thisMonthCount} accent />
            <StatCard icon="💰" label="This Month Premium" value={fmtC(stats.thisMonthPremium)} />
            <StatCard icon="⏰" label="Expiring in 15 Days" value={stats.expiringSoon} warn={stats.expiringSoon > 0} onClick={() => setTab('expiring')} />
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '3px', background: 'rgba(241,245,249,0.9)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(199,210,254,0.5)', marginBottom: '16px', width: 'fit-content' }}>
          {[{ id: 'policies', label: '📋 All Policies' }, { id: 'expiring', label: `⏰ Expiring Soon ${expiring.length > 0 ? `(${expiring.length})` : ''}` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '7px 18px', borderRadius: '9px', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', transition: 'all 0.2s',
              background: tab === t.id ? 'linear-gradient(145deg, #3b82f6, #2563eb)' : 'transparent',
              color: tab === t.id ? '#fff' : 'var(--text2)',
              boxShadow: tab === t.id ? '0 4px 12px rgba(37,99,235,0.28)' : 'none',
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'expiring' ? (
          // ─── EXPIRING TAB ───────────────────────────────────────────
          <div style={{ ...glass, overflow: 'hidden' }}>
            {expiring.length === 0 ? (
              <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                🎉 No policies expiring in the next 15 days
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(199,210,254,0.4)', background: 'rgba(245,158,11,0.04)' }}>
                      {['Customer','Policy No.','Reg. No.','Type','Expiry Date','Days Left','Premium','Action'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontWeight: 500, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expiring.map(p => {
                      const days = daysLeft(p.policyEndDate)
                      const c = VEHICLE_COLORS[p.vehicleType] || VEHICLE_COLORS.MISC
                      const urgColor = days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#d97706'
                      return (
                        <tr key={p._id} style={{ borderBottom: '1px solid rgba(199,210,254,0.25)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.04)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '14px' }}>{p.customerName}</td>
                          <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{p.policyNumber}</td>
                          <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>{p.registrationNumber}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontFamily: 'var(--font-mono)' }}>{p.vehicleType}</span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: urgColor, fontWeight: 700 }}>{fmt(p.policyEndDate)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 800, background: days <= 3 ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', color: urgColor, border: `1px solid ${urgColor}33` }}>{days}d</span>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 800, color: 'var(--accent)' }}>{fmtC(p.premium)}</td>
                          <td style={{ padding: '12px 16px' }}>
                            {isAdmin && <button onClick={() => openEdit(p)} style={{ padding: '5px 12px', borderRadius: '7px', border: '1.5px solid rgba(37,99,235,0.25)', background: 'rgba(219,234,254,0.5)', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>✎ Edit</button>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          // ─── POLICIES TAB ──────────────────────────────────────────
          <>
            {/* Month/Year + Filters */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <select value={selectedMonth} onChange={e => { setSelectedMonth(Number(e.target.value)); setPage(1) }}
                style={{ padding: '10px 14px', borderRadius: '11px', border: '1.5px solid rgba(199,210,254,0.6)', background: 'rgba(255,255,255,0.9)', color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, outline: 'none', cursor: 'pointer' }}>
                {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
              </select>
              <select value={selectedYear} onChange={e => { setSelectedYear(Number(e.target.value)); setPage(1) }}
                style={{ padding: '10px 14px', borderRadius: '11px', border: '1.5px solid rgba(199,210,254,0.6)', background: 'rgba(255,255,255,0.9)', color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, outline: 'none', cursor: 'pointer' }}>
                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="🔍  Search name, policy no, reg no..."
                style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '11px', border: '1.5px solid rgba(199,210,254,0.6)', background: 'rgba(255,255,255,0.9)', color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '13px', outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(199,210,254,0.6)'; e.target.style.boxShadow = 'none' }}
              />
              <select value={vehicleFilter} onChange={e => { setVehicleFilter(e.target.value); setPage(1) }}
                style={{ padding: '10px 14px', borderRadius: '11px', border: '1.5px solid rgba(199,210,254,0.6)', background: 'rgba(255,255,255,0.9)', color: vehicleFilter ? 'var(--accent)' : 'var(--text2)', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                <option value="">All Types</option>
                {['TW','CAR','GCV','PCV','MISC'].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* Table */}
            <div style={{ ...glass, overflow: 'hidden', marginBottom: '16px' }}>
              {loading ? (
                <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                  <div style={{ width: 28, height: 28, border: '2px solid var(--text4)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 14px' }} />
                  Loading...
                </div>
              ) : policies.length === 0 ? (
                <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>No policies found for {MONTHS[selectedMonth-1]} {selectedYear}</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(199,210,254,0.4)', background: 'rgba(241,245,249,0.6)' }}>
                        {['Customer','Number','Reg. No.','Policy No.','Type','Start','End','Premium','Action'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontWeight: 500, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h.toUpperCase()}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {policies.map(p => {
                        const c = VEHICLE_COLORS[p.vehicleType] || VEHICLE_COLORS.MISC
                        return (
                          <tr key={p._id} style={{ borderBottom: '1px solid rgba(199,210,254,0.25)', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(219,234,254,0.2)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                            <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 700 }}>{p.customerName}</td>
                            <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>{p.number}</td>
                            <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>{p.registrationNumber}</td>
                            <td style={{ padding: '12px 16px', fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>{p.policyNumber}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontFamily: 'var(--font-mono)' }}>{p.vehicleType}</span>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>{fmt(p.policyStartDate)}</td>
                            <td style={{ padding: '12px 16px', fontSize: '12px', color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>{fmt(p.policyEndDate)}</td>
                            <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 800, color: 'var(--accent)' }}>{fmtC(p.premium)}</td>
                            <td style={{ padding: '12px 16px' }}>
                              {isAdmin && <button onClick={() => openEdit(p)} style={{ padding: '5px 12px', borderRadius: '7px', border: '1.5px solid rgba(37,99,235,0.25)', background: 'rgba(219,234,254,0.5)', color: 'var(--accent)', cursor: 'pointer', fontSize: '12px', fontWeight: 700, transition: 'all 0.15s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.borderColor = 'var(--accent)' }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(219,234,254,0.5)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.25)' }}
                              >✎ Edit</button>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                <PBtn onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>← Prev</PBtn>
                <span style={{ fontSize: '13px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', padding: '0 12px' }}>{page} / {totalPages}</span>
                <PBtn onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}>Next →</PBtn>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editPolicy && (
        <div onClick={e => e.target === e.currentTarget && setEditPolicy(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ width: '100%', maxWidth: '520px', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.98)', borderRadius: '22px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(15,23,42,0.16)', animation: 'fadeUp 0.3s ease' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(199,210,254,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '16px' }}>Edit Policy</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{editPolicy.policyNumber}</div>
              </div>
              <button onClick={() => setEditPolicy(null)} style={{ width: 32, height: 32, borderRadius: '8px', border: 'none', background: 'rgba(15,23,42,0.06)', color: 'var(--text2)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxHeight: '60vh', overflowY: 'auto' }}>
              {[
                { key: 'customerName', label: 'Customer Name', type: 'text' },
                { key: 'number', label: 'Contact Number', type: 'tel' },
                { key: 'registrationNumber', label: 'Registration No.', type: 'text' },
                { key: 'policyNumber', label: 'Policy Number', type: 'text' },
                { key: 'policyStartDate', label: 'Start Date', type: 'date' },
                { key: 'policyEndDate', label: 'End Date', type: 'date' },
                { key: 'premium', label: 'Premium (₹)', type: 'number' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.key === 'customerName' ? 'span 2' : 'span 1' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: '5px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{f.label.toUpperCase()}</label>
                  <input type={f.type} value={editForm[f.key] || ''} onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid rgba(199,210,254,0.7)', background: 'rgba(248,250,255,0.9)', color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '13px', outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(199,210,254,0.7)'}
                  />
                </div>
              ))}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: '5px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>VEHICLE TYPE</label>
                <select value={editForm.vehicleType || ''} onChange={e => setEditForm(prev => ({ ...prev, vehicleType: e.target.value }))}
                  style={{ width: '100%', padding: '10px 13px', borderRadius: '10px', border: '1.5px solid rgba(199,210,254,0.7)', background: 'rgba(248,250,255,0.9)', color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, outline: 'none', cursor: 'pointer' }}>
                  {['TW','CAR','GCV','PCV','MISC'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(199,210,254,0.3)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditPolicy(null)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid rgba(199,210,254,0.6)', background: 'transparent', color: 'var(--text2)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleEditSave} disabled={editLoading} style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: 'linear-gradient(145deg, #3b82f6, #2563eb)', color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', cursor: editLoading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {editLoading ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Saving...</> : '✓ Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, accent, warn, onClick }) {
  return (
    <div onClick={onClick} style={{ background: accent ? 'linear-gradient(145deg, rgba(37,99,235,0.06), rgba(79,70,229,0.04))' : 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: `1px solid ${accent ? 'rgba(37,99,235,0.2)' : warn ? 'rgba(245,158,11,0.22)' : 'rgba(255,255,255,0.95)'}`, borderRadius: '16px', padding: '18px 20px', boxShadow: '0 4px 20px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,1)', animation: 'fadeUp 0.4s ease', cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s' }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}>
      <div style={{ fontSize: '22px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', color: accent ? 'var(--accent)' : warn && value > 0 ? '#d97706' : 'var(--text)', marginBottom: '3px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{label}</div>
    </div>
  )
}

function PBtn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: '8px 18px', borderRadius: '10px', border: '1.5px solid rgba(199,210,254,0.6)', background: 'rgba(255,255,255,0.85)', color: disabled ? 'var(--text4)' : 'var(--text2)', cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)', fontSize: '13px', fontWeight: 700, boxShadow: '0 2px 8px rgba(15,23,42,0.05)' }}>
      {children}
    </button>
  )
}
