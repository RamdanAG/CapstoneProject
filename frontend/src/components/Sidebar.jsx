import { useState } from 'react'

const NAV = [
  { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
  { id: 'analysis',  icon: '◎', label: 'Analysis'  },
  { id: 'results',   icon: '◈', label: 'Results'   },
  { id: 'reviews',   icon: '≡', label: 'Reviews'   },
  { id: 'history',   icon: '◷', label: 'History'   },
]

export default function Sidebar({ active }) {
  const [open, setOpen] = useState(false)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  return (
    <>
      {/* Mobile top bar */}
      <div style={{
        display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
        background: 'var(--sidebar)', padding: '12px 16px',
        justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,.08)',
        className: 'mobile-bar'
      }} className="mobile-topbar">
        <img src="/logo.png" alt="ARIS" style={{ height: 32, objectFit: 'contain' }} />
        <button onClick={() => setOpen(o => !o)} style={{
          background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', lineHeight: 1
        }}>{open ? '✕' : '☰'}</button>
      </div>

      {/* Overlay mobile */}
      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 18
        }} className="mobile-overlay" />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`} style={{
        width: 220, minHeight: '100vh', background: 'var(--sidebar)',
        borderRight: '1px solid rgba(255,255,255,.05)',
        display: 'flex', flexDirection: 'column', padding: '24px 0',
        position: 'fixed', top: 0, left: 0, zIndex: 19,
        transition: 'transform .25s ease'
      }}>
        <div style={{ padding: '0 20px 28px', borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 16 }}>
          <img src="/logo.png" alt="ARIS" style={{ height: 100, objectFit: 'contain' }} />
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
          {NAV.map(({ id, icon, label }) => {
            const isActive = active === id
            return (
              <button key={id} onClick={() => scrollTo(id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : 'var(--sidebar-text)',
                background: isActive ? 'var(--red)' : 'transparent', transition: 'all .15s'
              }}>
                <span style={{ fontSize: 15, opacity: isActive ? 1 : .7 }}>{icon}</span>
                {label}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '16px 20px 0', fontSize: 10, color: 'rgba(255,255,255,.25)', lineHeight: 1.7 }}>
          © 2025 ARIS<br />Built with DBS Foundation
        </div>
      </aside>
    </>
  )
}
