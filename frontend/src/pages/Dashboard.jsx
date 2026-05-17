import { useState, useRef } from 'react'
import ReviewCard from '../components/ReviewCard'
import SummaryBar from '../components/SummaryBar'

const LIMIT_OPTIONS = [25, 50, 100, 200, 500, 'Semua']

const S = {
  card: { background: 'var(--aris-card)', border: '1px solid var(--aris-border)', borderRadius: 14, padding: '20px 22px' },
  label: { fontSize: 12, color: 'var(--aris-muted)', letterSpacing: .5, marginBottom: 8, display: 'block' },
  input: {
    width: '100%', background: 'var(--aris-bg)', border: '1px solid var(--aris-border)',
    borderRadius: 10, padding: '10px 14px', fontSize: 14, color: 'var(--aris-text)',
    outline: 'none', transition: 'border .15s'
  },
  btn: {
    width: '100%', padding: '12px', borderRadius: 10, border: 'none',
    background: 'var(--aris-blue)', color: '#fff', fontWeight: 600,
    fontSize: 14, cursor: 'pointer', letterSpacing: .5, transition: 'opacity .15s'
  },
}

export default function Dashboard() {
  const [url, setUrl]             = useState('')
  const [limit, setLimit]         = useState(25)
  const [customLimit, setCustom]  = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [result, setResult]       = useState(null)
  const [filter, setFilter]       = useState('all')
  const [progress, setProgress]   = useState({ pct: 0, message: '', step: '' })
  const [page, setPage]           = useState(1)
  const esRef = useRef(null)

  const PER_PAGE = 10
  const effectiveLimit = limit === 'Semua' ? 99999 : (customLimit !== '' ? Number(customLimit) : limit)

  const handleAnalyze = (e) => {
    e.preventDefault()
    setError(''); setResult(null); setPage(1)
    setLoading(true)
    setProgress({ pct: 0, message: 'Memulai...', step: 'start' })
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
        es.close(); return
      }
      setProgress({ pct: msg.progress ?? 0, message: msg.message ?? '', step: msg.step ?? '' })
    }
    es.onerror = () => { setError('Koneksi terputus. Coba lagi.'); setLoading(false); es.close() }
  }

  const filtered = result?.reviews?.filter(r => {
    if (filter === 'positive')   return r.sentiment === 'positive'
    if (filter === 'negative')   return r.sentiment === 'negative'
    if (filter === 'suspicious') return r.is_suspicious
    return true
  }) ?? []

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900 }}>

      {/* Welcome */}
      <div style={{ ...S.card, marginBottom: 24, background: 'linear-gradient(135deg, #1a1a6e 0%, var(--aris-card) 100%)', textAlign: 'center', padding: '24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6, color: 'var(--aris-text)' }}>
          Selamat datang di ARIS!
        </h1>
        <p style={{ fontSize: 13, color: 'var(--aris-muted)' }}>
          Mulai analisis ulasan produk dan temukan mana yang benar-benar bisa Anda percaya.
        </p>
      </div>

      {/* Stats (kalau sudah ada hasil) */}
      {result && <SummaryBar summary={result.summary} />}

      {/* Review Analysis */}
      <div style={{ ...S.card, marginBottom: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, color: 'var(--aris-text)' }}>Review Analysis</h2>
        <form onSubmit={handleAnalyze}>
          <label style={S.label}>INPUT URL PRODUK TOKOPEDIA</label>
          <input
            type="url"
            placeholder="https://www.tokopedia.com/..."
            style={S.input}
            value={url}
            onChange={e => setUrl(e.target.value)}
            required
          />

          {/* Limit */}
          <div style={{ marginTop: 14, marginBottom: 16 }}>
            <label style={S.label}>JUMLAH ULASAN</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {LIMIT_OPTIONS.map(n => (
                <button key={n} type="button"
                  onClick={() => { setLimit(n); setCustom('') }}
                  style={{
                    padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all .15s',
                    background: limit === n && customLimit === '' ? 'var(--aris-blue)' : 'transparent',
                    border: `1px solid ${limit === n && customLimit === '' ? 'var(--aris-blue)' : 'var(--aris-border)'}`,
                    color: limit === n && customLimit === '' ? '#fff' : 'var(--aris-muted)',
                  }}>{n}</button>
              ))}
              <input
                type="number" min="1" placeholder="Custom..."
                style={{ ...S.input, width: 100, padding: '6px 12px', fontSize: 12 }}
                value={customLimit}
                onChange={e => { setCustom(e.target.value); if (e.target.value) setLimit(null) }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? .6 : 1 }}>
            {loading ? 'Menganalisis...' : 'Analysis'}
          </button>
        </form>
      </div>

      {/* Progress */}
      {loading && (
        <div style={{ ...S.card, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--aris-muted)' }}>{progress.message}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--aris-blue)' }}>{progress.pct}%</span>
          </div>
          {/* Bar */}
          <div style={{ height: 6, borderRadius: 99, background: 'var(--aris-bg)', overflow: 'hidden', marginBottom: 12 }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, var(--aris-blue), var(--aris-positive))',
              width: `${progress.pct}%`, transition: 'width .5s ease'
            }} />
          </div>
          {/* Steps */}
          <div style={{ display: 'flex', gap: 24, fontSize: 12 }}>
            {[
              { key: 'scraping',   label: 'Scraping',  threshold: 0  },
              { key: 'analyzing',  label: 'Analisis',  threshold: 50 },
              { key: 'done',       label: 'Selesai',   threshold: 95 },
            ].map(s => {
              const done   = progress.pct >= s.threshold + 5
              const active = progress.step === s.key
              return (
                <div key={s.key} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: done ? 'var(--aris-positive)' : active ? 'var(--aris-text)' : 'var(--aris-border)'
                }}>
                  <span style={{ fontSize: 14 }}>{done ? '✓' : active ? '◉' : '○'}</span>
                  <span>{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {error && (
        <div style={{ ...S.card, marginBottom: 24, borderLeft: '3px solid var(--aris-negative)', background: '#1a0a12' }}>
          <p style={{ fontSize: 13, color: 'var(--aris-negative)' }}>{error}</p>
        </div>
      )}

      {/* Result cards */}
      {result && (
        <div style={{ ...S.card, marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Result</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            <ResultBox
              title="Fake Review Detection"
              value={`${result.summary.suspicious} Mencurigakan`}
              sub={`dari ${result.summary.total} ulasan`}
              color="var(--aris-warning)"
            />
            <ResultBox
              title="Sentiment Analysis"
              value={`${Math.round(result.summary.positive / result.summary.total * 100)}% Positif`}
              sub={`${result.summary.negative} negatif`}
              color="var(--aris-positive)"
            />
            <ResultBox
              title="Trust Score"
              value={`${Math.round(result.summary.avg_trust * 100)}/100`}
              sub="rata-rata produk"
              color="var(--aris-blue)"
            />
          </div>
        </div>
      )}

      {/* History / Review list */}
      {result && (
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600 }}>Semua Ulasan</h2>
            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { k: 'all',        l: `Semua (${result.summary.total})` },
                { k: 'positive',   l: `Positif (${result.summary.positive})` },
                { k: 'negative',   l: `Negatif (${result.summary.negative})` },
                { k: 'suspicious', l: `Mencurigakan (${result.summary.suspicious})` },
              ].map(f => (
                <button key={f.k} onClick={() => { setFilter(f.k); setPage(1) }}
                  style={{
                    padding: '5px 12px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    background: filter === f.k ? 'var(--aris-blue)' : 'transparent',
                    border: `1px solid ${filter === f.k ? 'var(--aris-blue)' : 'var(--aris-border)'}`,
                    color: filter === f.k ? '#fff' : 'var(--aris-muted)',
                  }}>{f.l}</button>
              ))}
            </div>
          </div>

          {/* Review list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {paginated.length === 0
              ? <p style={{ textAlign: 'center', color: 'var(--aris-muted)', padding: '32px 0', fontSize: 13 }}>Tidak ada ulasan di kategori ini.</p>
              : paginated.map((r, i) => <ReviewCard key={i} review={r} />)
            }
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
              <PageBtn label="← Prev" disabled={page === 1}        onClick={() => setPage(p => p - 1)} />
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const n = i + 1
                return (
                  <PageBtn key={n} label={n} active={page === n} onClick={() => setPage(n)} />
                )
              })}
              {totalPages > 5 && <span style={{ color: 'var(--aris-muted)', fontSize: 12 }}>...</span>}
              <PageBtn label="Next →" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ResultBox({ title, value, sub, color }) {
  return (
    <div style={{
      background: 'var(--aris-bg)', border: '1px solid var(--aris-border)',
      borderTop: `3px solid ${color}`, borderRadius: 12, padding: '16px'
    }}>
      <div style={{ fontSize: 11, color: 'var(--aris-muted)', marginBottom: 8, letterSpacing: .5 }}>{title.toUpperCase()}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--aris-muted)' }}>{sub}</div>
    </div>
  )
}

function PageBtn({ label, onClick, active, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        background: active ? 'var(--aris-blue)' : 'transparent',
        border: `1px solid ${active ? 'var(--aris-blue)' : 'var(--aris-border)'}`,
        color: active ? '#fff' : disabled ? 'var(--aris-border)' : 'var(--aris-muted)',
        opacity: disabled ? .5 : 1,
      }}>{label}</button>
  )
}
