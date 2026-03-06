import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import ChatBot from './pages/ChatBot'
import AdminDashboard from './pages/AdminDashboard'
import UserManagement from './pages/UserManagement'
import ExpiryReminder from './components/ExpiryReminder'

function AppInner() {
  const { user, logout, loading, isAdmin } = useAuth()
  const [page, setPage] = useState('chat')

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--font-display)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(199,210,254,0.6)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 14px' }} />
        <div style={{ color: 'var(--text3)', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>Loading PolicyBot...</div>
      </div>
    </div>
  )

  if (!user) return <Login />

  // Tabs available based on role
  const tabs = [
    { id: 'chat', icon: '💬', label: 'Chat' },
    { id: 'admin', icon: '📊', label: 'Dashboard' },
    ...(isAdmin ? [{ id: 'users', icon: '👥', label: 'Users' }] : []),
  ]

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      {/* Orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-8%', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 65%)', animation: 'orb1 20s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)', animation: 'orb2 25s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 28px', height: '62px',
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(24px) saturate(200%)', WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        borderBottom: '1px solid rgba(255,255,255,0.95)',
        boxShadow: '0 1px 0 rgba(199,210,254,0.6), 0 4px 24px rgba(15,23,42,0.06)',
        position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
          <div style={{ width: 38, height: 38, borderRadius: '11px', background: 'linear-gradient(145deg, #3b82f6, #2563eb, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 4px 14px rgba(37,99,235,0.4)' }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.03em' }}>Policy<span style={{ color: 'var(--accent)' }}>Bot</span></div>
            <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>INSURANCE ASSISTANT</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '3px', background: 'rgba(241,245,249,0.9)', padding: '4px', borderRadius: '13px', border: '1px solid rgba(199,210,254,0.55)', boxShadow: 'inset 0 1px 4px rgba(15,23,42,0.05)' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setPage(tab.id)} style={{
              padding: '7px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', transition: 'all 0.22s ease',
              display: 'flex', alignItems: 'center', gap: '6px',
              background: page === tab.id ? 'linear-gradient(145deg, #3b82f6, #2563eb)' : 'transparent',
              color: page === tab.id ? '#fff' : 'var(--text2)',
              boxShadow: page === tab.id ? '0 4px 14px rgba(37,99,235,0.32)' : 'none',
            }}>{tab.icon} {tab.label}</button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '5px 14px', borderRadius: '20px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)', fontSize: '11px', color: '#059669', fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.7)' }} />
            LIVE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(145deg, #3b82f6, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#fff', fontWeight: 800 }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>{user.name}</div>
              <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>{isAdmin ? 'ADMIN' : 'USER'}</div>
            </div>
          </div>
          <button onClick={logout} style={{ padding: '6px 14px', borderRadius: '8px', border: '1.5px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: 'var(--danger)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
        {page === 'chat' && <ChatBot />}
        {page === 'admin' && <AdminDashboard isAdmin={isAdmin} />}
        {page === 'users' && isAdmin && <UserManagement />}
      </div>

      <ExpiryReminder />
    </div>
  )
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>
}
