import { useState, useEffect } from 'react'
import axios from '../api'

const glass = {
  background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.95)', borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,1)',
}

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try { const r = await axios.get('/api/auth/users'); setUsers(r.data.data) }
    catch { }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { setFormError('All fields are required'); return }
    if (form.password.length < 6) { setFormError('Password must be at least 6 characters'); return }
    setFormLoading(true); setFormError('')
    try {
      await axios.post('/api/auth/users', form)
      setForm({ name: '', email: '', password: '' })
      setShowAdd(false)
      fetchUsers()
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to create user')
    } finally { setFormLoading(false) }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"?`)) return
    try { await axios.delete(`/api/auth/users/${id}`); fetchUsers() }
    catch (e) { alert(e.response?.data?.message || 'Delete failed') }
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '22px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.03em' }}>
              User <span style={{ color: 'var(--accent)' }}>Management</span>
            </h1>
            <p style={{ color: 'var(--text3)', fontSize: '13px', fontFamily: 'var(--font-mono)', marginTop: '3px' }}>
              {users.length} total accounts
            </p>
          </div>
          <button onClick={() => { setShowAdd(true); setFormError('') }} style={{
            padding: '10px 22px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(145deg, #3b82f6, #2563eb)', color: '#fff',
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px',
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>+ Add New User</button>
        </div>

        {/* Users Table */}
        <div style={{ ...glass, overflow: 'hidden', marginBottom: '16px' }}>
          {loading ? (
            <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
              <div style={{ width: 28, height: 28, border: '2px solid var(--text4)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 14px' }} />
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>No users yet</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(199,210,254,0.4)', background: 'rgba(241,245,249,0.6)' }}>
                  {['USER', 'EMAIL', 'ROLE', 'CREATED', 'ACTION'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', fontWeight: 500, letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(199,210,254,0.25)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(219,234,254,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: u.role === 'admin' ? 'linear-gradient(145deg, #3b82f6, #4f46e5)' : 'linear-gradient(145deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: '#fff', fontWeight: 800, flexShrink: 0 }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text2)', fontFamily: 'var(--font-mono)' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '4px 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 800,
                        fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
                        background: u.role === 'admin' ? 'rgba(37,99,235,0.08)' : 'rgba(16,185,129,0.08)',
                        color: u.role === 'admin' ? '#2563eb' : '#059669',
                        border: u.role === 'admin' ? '1px solid rgba(37,99,235,0.2)' : '1px solid rgba(16,185,129,0.2)',
                      }}>{u.role.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.role !== 'admin' ? (
                        <button onClick={() => handleDelete(u._id, u.name)} style={{
                          padding: '5px 12px', borderRadius: '7px',
                          border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)',
                          color: 'var(--danger)', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                          transition: 'all 0.15s',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}
                        >✕ Remove</button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text4)', fontFamily: 'var(--font-mono)' }}>— PROTECTED —</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAdd && (
        <div onClick={e => e.target === e.currentTarget && setShowAdd(false)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(15,23,42,0.25)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ width: '100%', maxWidth: '440px', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.98)', borderRadius: '22px', overflow: 'hidden', boxShadow: '0 24px 80px rgba(15,23,42,0.16)', animation: 'fadeUp 0.3s ease' }}>

            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(199,210,254,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '17px' }}>Add New User</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>User will be able to login and add policies</div>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ width: 32, height: 32, borderRadius: '8px', border: 'none', background: 'rgba(15,23,42,0.06)', color: 'var(--text2)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            {/* Form */}
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[{ key: 'name', label: 'FULL NAME', type: 'text', placeholder: 'e.g. Rahul Sharma' },
                { key: 'email', label: 'EMAIL ADDRESS', type: 'email', placeholder: 'e.g. rahul@company.com' }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{f.label}</label>
                  <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                    onChange={e => { setForm(p => ({ ...p, [f.key]: e.target.value })); setFormError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '11px', border: '1.5px solid rgba(199,210,254,0.7)', background: 'rgba(248,250,255,0.9)', color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(199,210,254,0.7)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              ))}

              {/* Password */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPass ? 'text' : 'password'} value={form.password} placeholder="Min. 6 characters"
                    onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setFormError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    style={{ width: '100%', padding: '11px 40px 11px 14px', borderRadius: '11px', border: '1.5px solid rgba(199,210,254,0.7)', background: 'rgba(248,250,255,0.9)', color: 'var(--text)', fontFamily: 'var(--font-display)', fontSize: '14px', outline: 'none', transition: 'all 0.2s' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(199,210,254,0.7)'; e.target.style.boxShadow = 'none' }}
                  />
                  <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '15px', color: 'var(--text3)' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {formError && (
                <div style={{ padding: '9px 14px', borderRadius: '9px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', fontSize: '13px', color: 'var(--danger)', animation: 'fadeIn 0.2s ease' }}>⚠ {formError}</div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(199,210,254,0.3)', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowAdd(false)} style={{ padding: '10px 20px', borderRadius: '10px', border: '1.5px solid rgba(199,210,254,0.6)', background: 'transparent', color: 'var(--text2)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreate} disabled={formLoading} style={{
                padding: '10px 22px', borderRadius: '10px', border: 'none',
                background: formLoading ? 'rgba(199,210,254,0.5)' : 'linear-gradient(145deg, #3b82f6, #2563eb)', color: formLoading ? 'var(--text3)' : '#fff',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px',
                cursor: formLoading ? 'not-allowed' : 'pointer',
                boxShadow: formLoading ? 'none' : '0 4px 12px rgba(37,99,235,0.3)',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                {formLoading ? <><div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#aaa', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Creating...</> : '+ Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
