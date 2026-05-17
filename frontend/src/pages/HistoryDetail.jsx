import ReviewCard from '../components/ReviewCard'
import SummaryBar from '../components/SummaryBar'
import { useState } from 'react'

export default function HistoryDetail({ item, onBack }) {
  const [filter, setFilter] = useState('all')
  const [page, setPage]     = useState(1)
  const PER_PAGE = 10

  const filtered = item.reviews?.filter(r => {
    if (filter === 'positive')   return r.sentiment === 'positive'
    if (filter === 'negative')   return r.sentiment === 'negative'
    if (filter === 'suspicious') return r.is_suspicious
    return true
  }) ?? []

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE)

  return (
    <div style={{ padding: '32px 40px' }}>

      {/* Back */}
      <button onClick={onBack} style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--blue)', fontSize: 13, fontWeight: 600, marginBottom: 24, padding: 0
      }}>
        ← Kembali ke History
      </button>

      {/* Header */}
      <div style={{ background: 'var(--sidebar)', borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: .5, marginBottom: 6 }}>URL PRODUK</p>
        <a href={item.url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#93c5fd', wordBreak: 'break-all' }}>
          🔗 {item.url}
        </a>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 8 }}>
          Dianalisis pada {new Date(item.scraped_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
        </p>
      </div>

      {/* Summary */}
      <SummaryBar summary={{
        total:      item.total,
        positive:   item.positive,
        negative:   item.total - item.positive,
        suspicious: item.suspicious,
        avg_trust:  item.avg_trust,
      }} />

      {/* Result cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { title: 'Fake Review Detection', value: `${item.suspicious} Mencurigakan`, sub: `dari ${item.total} ulasan`, color: 'var(--warning)' },
          { title: 'Sentiment Analysis',    value: `${Math.round(item.positive/item.total*100)}% Positif`, sub: `${item.total-item.positive} negatif`, color: 'var(--positive)' },
          { title: 'Trust Score',           value: `${Math.round(item.avg_trust*100)}/100`, sub: 'rata-rata produk', color: 'var(--blue)' },
        ].map(s => (
          <div key={s.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid ${s.color}`, borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: .5, marginBottom: 8 }}>{s.title.toUpperCase()}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter + Reviews */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Semua Ulasan</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[
            { k:'all',        l:`Semua (${item.total})` },
            { k:'positive',   l:`Positif (${item.positive})` },
            { k:'negative',   l:`Negatif (${item.total - item.positive})` },
            { k:'suspicious', l:`Mencurigakan (${item.suspicious})` },
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
          <PBtn label="← Prev" disabled={page===1}           onClick={() => setPage(p=>p-1)} />
          {Array.from({length:Math.min(totalPages,5)},(_,i)=>i+1).map(n=>(
            <PBtn key={n} label={n} active={page===n} onClick={()=>setPage(n)} />
          ))}
          {totalPages>5 && <span style={{color:'var(--muted)',fontSize:12,alignSelf:'center'}}>...</span>}
          <PBtn label="Next →" disabled={page===totalPages} onClick={() => setPage(p=>p+1)} />
        </div>
      )}
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
