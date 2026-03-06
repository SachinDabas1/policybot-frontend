import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter email and password'); return }
    setLoading(true); setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden',
      fontFamily: 'var(--font-display)',
    }}>
      {/* Orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 65%)', animation: 'orb1 18s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '550px', height: '550px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 65%)', animation: 'orb2 22s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '420px', margin: '20px',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(255,255,255,0.98)',
        borderRadius: '24px', padding: '40px 36px',
        boxShadow: '0 20px 60px rgba(37,99,235,0.12), 0 4px 16px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,1)',
        animation: 'fadeUp 0.5s ease',
        position: 'relative', zIndex: 1,
      }}>
        {/* Shimmer top */}
        <div style={{
          height: '3px', borderRadius: '3px', marginBottom: '28px',
          background: 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #3b82f6)',
          backgroundSize: '200% 100%', animation: 'shimmer 2.5s linear infinite',
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '14px',
            background: 'linear-gradient(145deg, #3b82f6, #2563eb, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
            boxShadow: '0 6px 18px rgba(37,99,235,0.4)',
          }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '22px', letterSpacing: '-0.03em' }}>
              Policy<span style={{ color: 'var(--accent)' }}>Bot</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>ADMIN PORTAL</div>
          </div>
        </div>

        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', color: 'var(--text)' }}>Welcome back</h2>
        <p style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '24px' }}>Sign in to access the dashboard</p>

        {/* Email */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>EMAIL</label>
          <input
            type="email" value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="admin@example.com"
            style={{
              width: '100%', padding: '12px 16px', borderRadius: '12px',
              border: '1.5px solid rgba(199,210,254,0.7)',
              background: 'rgba(255,255,255,0.9)', color: 'var(--text)',
              fontFamily: 'var(--font-display)', fontSize: '14px', outline: 'none',
              boxShadow: '0 1px 4px rgba(15,23,42,0.04)', transition: 'all 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(199,210,254,0.7)'; e.target.style.boxShadow = '0 1px 4px rgba(15,23,42,0.04)' }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text2)', display: 'block', marginBottom: '6px', letterSpacing: '0.03em' }}>PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••••"
              style={{
                width: '100%', padding: '12px 44px 12px 16px', borderRadius: '12px',
                border: `1.5px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(199,210,254,0.7)'}`,
                background: 'rgba(255,255,255,0.9)', color: 'var(--text)',
                fontFamily: 'var(--font-display)', fontSize: '14px', outline: 'none',
                boxShadow: '0 1px 4px rgba(15,23,42,0.04)', transition: 'all 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)' }}
              onBlur={e => { e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(199,210,254,0.7)'; e.target.style.boxShadow = '0 1px 4px rgba(15,23,42,0.04)' }}
            />
            <button onClick={() => setShowPass(!showPass)} style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text3)',
            }}>{showPass ? '🙈' : '👁️'}</button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: '16px', padding: '10px 14px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '13px', color: 'var(--danger)', animation: 'fadeIn 0.2s ease',
          }}>⚠ {error}</div>
        )}

        {/* Login Button */}
        <button onClick={handleLogin} disabled={loading} style={{
          width: '100%', padding: '13px', borderRadius: '13px', border: 'none',
          background: loading ? 'rgba(199,210,254,0.5)' : 'linear-gradient(145deg, #3b82f6, #2563eb)',
          color: loading ? 'var(--text3)' : '#fff',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          boxShadow: loading ? 'none' : '0 6px 20px rgba(37,99,235,0.35)',
          transition: 'all 0.2s',
        }}>
          {loading ? (
            <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} /> Signing in...</>
          ) : '→ Sign In'}
        </button>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          Admin access only · PolicyBot v2.0
        </div>
      </div>
    </div>
  )
}
