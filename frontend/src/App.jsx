import { useEffect, useRef, useState } from 'react'
import Sidebar from './components/Sidebar'
import SummaryBar from './components/SummaryBar'
import ReviewCard from './components/ReviewCard'
import HistoryDetail from './pages/HistoryDetail'
import api from './services/api'
import AnalyticsChart from './components/AnalyticsChart'

const LIMIT_OPTIONS = [25, 50, 100, 200, 500, 'Semua']
const card  = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px', marginBottom: 24 }
const inp   = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: 'var(--text)', outline: 'none' }
const lbl   = { fontSize: 11, color: 'var(--muted)', letterSpacing: .5, marginBottom: 8, display: 'block', fontWeight: 600 }

export default function App() {
  const [active, setActive]           = useState('dashboard')
  const [url, setUrl]                 = useState('')
  const [limit, setLimit]             = useState(25)
  const [custom, setCustom]           = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')
  const [result, setResult]           = useState(null)
  const [filter, setFilter]           = useState('all')
  const [progress, setProgress]       = useState({ pct: 0, message: '', step: '' })
  const [page, setPage]               = useState(1)
  const [manualText, setManualText]   = useState('')
  const [manualRating, setManualRating] = useState(5)
  const [manualResult, setManualResult] = useState(null)
  const [history, setHistory]         = useState([])
  const [historyItem, setHistoryItem] = useState(null)
  const [historyView, setHistoryView]   = useState(null)
  const esRef   = useRef(null)
  const PER_PAGE = 10

  const effectiveLimit = limit === 'Semua' ? 99999 : (custom !== '' ? Number(custom) : limit)

  // Fetch history
  useEffect(() => {
    api.get('/api/history').then(r => setHistory(r.data.data)).catch(() => {})
  }, [result])

  // Track active section on scroll
  useEffect(() => {
    const sections = ['dashboard','analysis','results','reviews','history']
    const handler = () => {
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= 120) { setActive(id); break }
      }
    }
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleAnalyze = (e) => {
    e.preventDefault()
    setError(''); setResult(null); setHistoryItem(null); setPage(1)
    setLoading(true); setProgress({ pct: 0, message: 'Memulai...', step: 'start' })
    if (esRef.current) esRef.current.close()

    const params = new URLSearchParams({ url, limit: effectiveLimit })
    const es = new EventSource(`/api/analyze/url/stream?${params}`)
    esRef.current = es

    es.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.error) { setError(msg.error); setLoading(false); es.close(); return }
      if (msg.step === 'done') {
        setResult(msg.data); setLoading(false)
        setProgress({ pct: 100, message: 'Selesai!', step: 'done' })
        setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 300)
        es.close(); return
      }
      setProgress({ pct: msg.progress ?? 0, message: msg.message ?? '', step: msg.step ?? '' })
    }
    es.onerror = () => { setError('Koneksi terputus.'); setLoading(false); es.close() }
  }

  const handleManual = async (e) => {
    e.preventDefault(); setManualResult(null)
    try {
      const res = await api.post('/api/analyze/text', { text: manualText, rating: manualRating })
      setManualResult(res.data.data)
    } catch (err) { setError(err.response?.data?.error || 'Gagal.') }
  }

  const deleteHistory = async (id) => {
    await api.delete(`/api/history/${id}`).catch(() => {})
    setHistory(h => h.filter(x => x.id !== id))
    if (historyItem?.id === id) setHistoryItem(null)
  }

  // Active result: dari analisis baru atau dari history yang diklik
  const activeResult = historyItem || result
  const filtered = activeResult?.reviews?.filter(r => {
    if (filter === 'positive')   return r.sentiment === 'positive'
    if (filter === 'negative')   return r.sentiment === 'negative'
    if (filter === 'suspicious') return r.is_suspicious
    return true
  }) ?? []
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar active={active} />
      <main className='main-wrapper' style={{ flex: 1 }}>
        {historyView && (
          <HistoryDetail item={historyView} onBack={() => setHistoryView(null)} />
        )}
        <div className='main-content' style={{ display: historyView ? 'none' : 'block', padding: '32px 40px' }}>

        {/* DASHBOARD */}
        <section id="dashboard" style={{ marginBottom: 32 }}>
          <div style={{ ...card, background: 'var(--sidebar)', marginBottom: 24 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Selamat datang di ARIS!</h1>
            <p style={{ fontSize: 13, color: 'var(--sidebar-text)' }}>Mulai analisis ulasan produk dan temukan mana yang benar-benar bisa Anda percaya.</p>
          </div>
          {activeResult
            ? <SummaryBar summary={activeResult.summary} />
            : (
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {[
                  { label: 'Total Review', color: 'var(--blue)'     },
                  { label: 'Avg Rating',   color: 'var(--warning)'  },
                  { label: 'Sentimen',     color: 'var(--positive)' },
                  { label: 'Trust Score',  color: 'var(--red)'      },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid ${s.color}`, borderRadius: 12, padding: '14px 16px' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: s.color, marginBottom: 4 }}>—</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: .5 }}>{s.label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            )
          }
        </section>

        {/* ANALYSIS */}
        <section id="analysis" style={{ marginBottom: 32, scrollMarginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Review Analysis</h2>
          <div style={card}>
            <form onSubmit={handleAnalyze}>
              <label style={lbl}>URL PRODUK TOKOPEDIA</label>
              <input type="url" placeholder="https://www.tokopedia.com/..." style={{ ...inp, marginBottom: 16 }}
                value={url} onChange={e => setUrl(e.target.value)} required />
              <label style={{ ...lbl, marginBottom: 10 }}>JUMLAH ULASAN</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {LIMIT_OPTIONS.map(n => (
                  <button key={n} type="button" onClick={() => { setLimit(n); setCustom('') }}
                    style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
                      background: limit===n && custom==='' ? 'var(--blue)' : '#f1f5f9',
                      color: limit===n && custom==='' ? '#fff' : 'var(--muted)' }}>{n}</button>
                ))}
                <input type="number" min="1" placeholder="Custom..." value={custom}
                  onChange={e => { setCustom(e.target.value); if (e.target.value) setLimit(null) }}
                  style={{ ...inp, width: 100, padding: '6px 12px', fontSize: 12 }} />
              </div>
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: 'var(--red)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? .6 : 1 }}>
                {loading ? 'Menganalisis...' : 'Analysis'}
              </button>
            </form>

            {loading && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--muted)' }}>{progress.message}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--blue)' }}>{progress.pct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--border)', overflow: 'hidden', marginBottom: 10 }}>
                  <div style={{ height: '100%', background: 'var(--red)', width: `${progress.pct}%`, borderRadius: 99, transition: 'width .5s ease' }} />
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
                  {[['scraping','Scraping',0],['analyzing','Analisis',50],['done','Selesai',95]].map(([k,l,t]) => (
                    <div key={k} style={{ display:'flex', alignItems:'center', gap:5,
                      color: progress.pct>=t+5 ? 'var(--positive)' : progress.step===k ? 'var(--text)' : 'var(--border)' }}>
                      <span>{progress.pct>=t+5 ? '✓' : progress.step===k ? '◉' : '○'}</span>{l}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {error && <p style={{ marginTop: 14, fontSize: 13, color: 'var(--negative)', background: '#fef2f2', padding: '10px 14px', borderRadius: 8 }}>{error}</p>}
          </div>

          {/* Manual */}
          <div style={card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Analisis Manual</h3>
            <form onSubmit={handleManual}>
              <textarea rows={3} placeholder="Tulis satu ulasan..." value={manualText} onChange={e => setManualText(e.target.value)}
                style={{ ...inp, resize: 'none', marginBottom: 12 }} required />
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button" onClick={() => setManualRating(n)}
                    style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer',
                      color: n<=manualRating ? 'var(--warning)' : 'var(--border)' }}>★</button>
                ))}
              </div>
              <button type="submit" style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Analisis
              </button>
            </form>
            {manualResult && <div style={{ marginTop: 14 }}><ReviewCard review={{ ...manualResult, rating: manualRating }} /></div>}
          </div>
        </section>

        {/* RESULTS */}
        {activeResult && (
          <section id="results" style={{ marginBottom: 32, scrollMarginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Result</h2>
              {historyItem && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)', background: '#f1f5f9', padding: '4px 10px', borderRadius: 99 }}>
                    📎 {historyItem.url.slice(0, 50)}...
                  </span>
                  <button onClick={() => setHistoryItem(null)}
                    style={{ fontSize: 11, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>✕ Tutup</button>
                </div>
              )}
            </div>
            <div className="result-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
              {[
                { title: 'Fake Review Detection', value: `${activeResult.summary.suspicious} Mencurigakan`, sub: `dari ${activeResult.summary.total} ulasan`, color: 'var(--warning)' },
                { title: 'Sentiment Analysis', value: `${Math.round(activeResult.summary.positive/activeResult.summary.total*100)}% Positif`, sub: `${activeResult.summary.negative} negatif`, color: 'var(--positive)' },
                { title: 'Trust Score', value: `${Math.round(activeResult.summary.avg_trust*100)}/100`, sub: 'rata-rata produk', color: 'var(--blue)' },
              ].map(s => (
                <div key={s.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid ${s.color}`, borderRadius: 12, padding: '16px 18px' }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: .5, marginBottom: 8 }}>{s.title.toUpperCase()}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </section>
        )}
        {activeResult && (
          <AnalyticsChart
            summary={activeResult.summary}
            reviews={activeResult.reviews}
          />
        )}

        {/* REVIEWS */}
        {activeResult && (
          <section id="reviews" style={{ marginBottom: 32, scrollMarginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Semua Ulasan</h2>
              <div className="filter-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { k:'all',        l:`Semua (${activeResult.summary.total})` },
                  { k:'positive',   l:`Positif (${activeResult.summary.positive})` },
                  { k:'negative',   l:`Negatif (${activeResult.summary.negative})` },
                  { k:'suspicious', l:`Mencurigakan (${activeResult.summary.suspicious})` },
                ].map(f => (
                  <button key={f.k} onClick={() => { setFilter(f.k); setPage(1) }}
                    style={{ padding:'5px 12px', borderRadius:99, fontSize:11, fontWeight:600, cursor:'pointer', border:'none',
                      background: filter===f.k ? 'var(--sidebar)' : '#f1f5f9',
                      color: filter===f.k ? '#fff' : 'var(--muted)' }}>{f.l}</button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
              {paginated.length === 0
                ? <p style={{ textAlign:'center', color:'var(--muted)', padding:'32px 0', fontSize:13 }}>Tidak ada ulasan.</p>
                : paginated.map((r,i) => <ReviewCard key={i} review={r} />)
              }
            </div>
            {totalPages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', gap:6 }}>
                <PBtn label="← Prev" disabled={page===1}            onClick={() => setPage(p=>p-1)} />
                {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(n=>(
                  <PBtn key={n} label={n} active={page===n} onClick={()=>setPage(n)} />
                ))}
                {totalPages>5 && <span style={{color:'var(--muted)',fontSize:12,alignSelf:'center'}}>...</span>}
                <PBtn label="Next →" disabled={page===totalPages}   onClick={() => setPage(p=>p+1)} />
              </div>
            )}
          </section>
        )}

        {/* HISTORY */}
        <section id="history" style={{ marginBottom: 32, scrollMarginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>History</h2>
          {history.length === 0
            ? (
              <div style={{ ...card, textAlign:'center', color:'var(--muted)', padding:'40px' }}>
                <p style={{ fontSize: 13 }}>Belum ada riwayat analisis.</p>
              </div>
            ) : (
              <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
                {/* Header tabel */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 80px 80px 80px 90px 64px', gap:12, padding:'10px 16px', background:'var(--bg)', fontSize:11, fontWeight:700, color:'var(--muted)', letterSpacing:.5, borderBottom:'1px solid var(--border)' }}>
                  <span>URL PRODUK</span>
                  <span>TOTAL</span>
                  <span>POSITIF</span>
                  <span>TRUST</span>
                  <span>TANGGAL</span>
                  <span></span>
                </div>
                {history.map(h => (
                  <div key={h.id} style={{ display:'grid', gridTemplateColumns:'1fr 80px 80px 80px 90px 64px', gap:12, padding:'12px 16px', fontSize:13, borderBottom:'1px solid var(--border)', alignItems:'center',
                    background: historyItem?.id===h.id ? '#eff6ff' : 'transparent', transition:'background .15s' }}>
                    {/* URL — klik untuk load */}
                    <button onClick={() => { setHistoryView(h); window.scrollTo(0,0) }}
                      style={{ background:'none', border:'none', cursor:'pointer', textAlign:'left', color:'var(--blue)', fontSize:12, padding:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}
                      title={h.url}>
                      🔗 {h.url.replace('https://www.tokopedia.com/','').slice(0,45)}...
                    </button>
                    <span style={{ color:'var(--text)', fontWeight:600 }}>{h.total}</span>
                    <span style={{ color:'var(--positive)', fontWeight:600 }}>
                      {Math.round(h.positive/h.total*100)}%
                    </span>
                    <span style={{ color:'var(--blue)', fontWeight:600 }}>{Math.round(h.avg_trust*100)}/100</span>
                    <span style={{ color:'var(--muted)', fontSize:11 }}>
                      {new Date(h.scraped_at).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}
                    </span>
                    <button onClick={() => deleteHistory(h.id)}
                      style={{ fontSize:11, color:'var(--negative)', background:'#fef2f2', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer' }}>
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            )
          }
        </section>

        {/* Footer */}
        <div style={{ marginTop: 48, padding:'24px 0', borderTop:'1px solid var(--border)', textAlign:'center' }}>
          <p style={{ fontSize:16, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Terima kasih sudah mencoba ARIS!</p>
          <p style={{ fontSize:13, color:'var(--muted)' }}>Semoga membantu Anda mengambil keputusan yang lebih cerdas dan terpercaya.</p>
        </div>
        </div>
      </main>
    </div>
  )
}

function PBtn({ label, onClick, active, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ padding:'6px 12px', borderRadius:8, fontSize:12, fontWeight:600, cursor:disabled?'not-allowed':'pointer',
        border:'none', background:active?'var(--sidebar)':'#f1f5f9',
        color:active?'#fff':disabled?'var(--border)':'var(--muted)', opacity:disabled?.5:1 }}>{label}</button>
  )
}
