// AnalyticsChart.jsx — tanpa library, pure CSS + SVG

// ── Warna ─────────────────────────────────────────────────────
const C = {
  positive:   '#16a34a',
  negative:   '#dc2626',
  suspicious: '#d97706',
  trust:      '#2563eb',
  muted:      '#64748b',
  border:     '#e2e8f0',
  bg:         '#f8fafc',
}

// ── Card wrapper ───────────────────────────────────────────────
function Card({ title, children }) {
  return (
    <div style={{ background:'#fff', border:`1px solid ${C.border}`, borderRadius:14, padding:'16px 20px' }}>
      <p style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:.5, marginBottom:14 }}>
        {title.toUpperCase()}
      </p>
      {children}
    </div>
  )
}

// ── 1. Bar chart horizontal ────────────────────────────────────
function HBar({ label, value, max, color, suffix='' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
        <span style={{ color:'#0f172a' }}>{label}</span>
        <span style={{ fontWeight:700, color }}>{value}{suffix}</span>
      </div>
      <div style={{ height:8, background:C.bg, borderRadius:99, overflow:'hidden', border:`1px solid ${C.border}` }}>
        <div style={{ height:'100%', width:`${pct}%`, background:color, borderRadius:99, transition:'width .6s ease' }} />
      </div>
    </div>
  )
}

// ── 2. Sentimen per rating ─────────────────────────────────────
function SentimentByRating({ reviews }) {
  const data = [1,2,3,4,5].map(r => {
    const group = reviews.filter(rv => Math.round(rv.rating) === r)
    const pos   = group.filter(rv => rv.sentiment === 'positive').length
    const neg   = group.filter(rv => rv.sentiment === 'negative').length
    return { rating: r, pos, neg, total: group.length }
  }).filter(d => d.total > 0)

  const maxTotal = Math.max(...data.map(d => d.total), 1)

  return (
    <Card title="Sentimen per Rating">
      {data.map(d => (
        <div key={d.rating} style={{ marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <span style={{ fontSize:12, minWidth:40 }}>{'★'.repeat(d.rating)}</span>
            <span style={{ fontSize:11, color:C.muted }}>{d.total} ulasan</span>
          </div>
          <div style={{ display:'flex', height:10, borderRadius:99, overflow:'hidden', background:C.bg, border:`1px solid ${C.border}` }}>
            <div style={{ width:`${Math.round(d.pos/maxTotal*100)}%`, background:C.positive, transition:'width .6s' }} />
            <div style={{ width:`${Math.round(d.neg/maxTotal*100)}%`, background:C.negative, transition:'width .6s' }} />
          </div>
          <div style={{ display:'flex', gap:10, fontSize:10, color:C.muted, marginTop:3 }}>
            <span style={{ color:C.positive }}>+{d.pos}</span>
            <span style={{ color:C.negative }}>-{d.neg}</span>
          </div>
        </div>
      ))}
    </Card>
  )
}

// ── 3. Donut SVG sentimen ──────────────────────────────────────
function Donut({ summary }) {
  const total   = summary.total || 1
  const posPct  = summary.positive / total
  const negPct  = summary.negative / total
  const suspPct = summary.suspicious / total

  const R = 60, CX = 80, CY = 80
  const circ = 2 * Math.PI * R

  const segments = [
    { pct: posPct,  color: C.positive,   label: 'Positif'      },
    { pct: negPct,  color: C.negative,   label: 'Negatif'      },
    { pct: suspPct, color: C.suspicious, label: 'Mencurigakan' },
  ].filter(s => s.pct > 0)

  let offset = 0
  const arcs = segments.map(s => {
    const dash   = s.pct * circ
    const gap    = circ - dash
    const rotate = offset * 360 - 90
    offset += s.pct
    return { ...s, dash, gap, rotate }
  })

  return (
    <Card title="Distribusi Sentimen">
      <div style={{ display:'flex', alignItems:'center', gap:20 }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <svg width={160} height={160}>
            {arcs.map((a, i) => (
              <circle key={i} cx={CX} cy={CY} r={R}
                fill="none" stroke={a.color} strokeWidth={20}
                strokeDasharray={`${a.dash} ${a.gap}`}
                strokeDashoffset={0}
                transform={`rotate(${a.rotate} ${CX} ${CY})`}
                style={{ transition:'stroke-dasharray .6s' }}
              />
            ))}
            {/* Hole */}
            <circle cx={CX} cy={CY} r={45} fill="#fff" />
            <text x={CX} y={CY-6} textAnchor="middle" fontSize={18} fontWeight={700} fill={C.positive}>
              {Math.round(posPct*100)}%
            </text>
            <text x={CX} y={CY+12} textAnchor="middle" fontSize={10} fill={C.muted}>Positif</text>
          </svg>
        </div>
        <div style={{ flex:1 }}>
          {segments.map(s => (
            <div key={s.label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <span style={{ width:10, height:10, borderRadius:'50%', background:s.color, flexShrink:0 }} />
              <span style={{ fontSize:12, color:'#0f172a', flex:1 }}>{s.label}</span>
              <span style={{ fontSize:12, fontWeight:700, color:s.color }}>
                {Math.round(s.pct*100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// ── 4. Trust score distribution ────────────────────────────────
function TrustDist({ reviews }) {
  const buckets = [
    { label:'0–20%',   min:0,   max:0.2,  color:'#dc2626' },
    { label:'20–40%',  min:0.2, max:0.4,  color:'#f97316' },
    { label:'40–60%',  min:0.4, max:0.6,  color:'#d97706' },
    { label:'60–80%',  min:0.6, max:0.8,  color:'#65a30d' },
    { label:'80–100%', min:0.8, max:1.01, color:'#16a34a' },
  ].map(b => ({
    ...b,
    count: reviews.filter(r => r.trust_score >= b.min && r.trust_score < b.max).length
  }))

  const max = Math.max(...buckets.map(b => b.count), 1)

  return (
    <Card title="Distribusi Trust Score">
      {buckets.map(b => (
        <HBar key={b.label} label={b.label} value={b.count} max={max} color={b.color} suffix=" ulasan" />
      ))}
    </Card>
  )
}

// ── 5. Confidence level ────────────────────────────────────────
function ConfidenceBar({ reviews }) {
  const total  = reviews.length || 1
  const high   = reviews.filter(r => r.confidence_label === 'high').length
  const medium = reviews.filter(r => r.confidence_label === 'medium').length
  const low    = reviews.filter(r => r.confidence_label === 'low').length

  return (
    <Card title="Confidence Model">
      <HBar label="High ✓"   value={high}   max={total} color={C.positive}   suffix={` (${Math.round(high/total*100)}%)`} />
      <HBar label="Medium ~"  value={medium} max={total} color={C.suspicious} suffix={` (${Math.round(medium/total*100)}%)`} />
      <HBar label="Low ✗"    value={low}    max={total} color={C.negative}   suffix={` (${Math.round(low/total*100)}%)`} />
      <p style={{ fontSize:11, color:C.muted, marginTop:8 }}>
        Rata-rata confidence: <strong>{Math.round(reviews.reduce((s,r)=>s+r.confidence,0)/total*100)}%</strong>
      </p>
    </Card>
  )
}

// ── 6. Kata sering di review mencurigakan ─────────────────────
function SuspiciousWords({ reviews }) {
  const susp = reviews.filter(r => r.is_suspicious)
  if (!susp.length) return null

  const wordCount = {}
  susp.forEach(r => {
    ;(r.message_clean || '').split(' ').forEach(w => {
      if (w.length > 3) wordCount[w] = (wordCount[w] || 0) + 1
    })
  })

  const data = Object.entries(wordCount)
    .sort((a,b) => b[1]-a[1]).slice(0,8)
    .map(([word,count]) => ({ word, count }))

  if (!data.length) return null
  const max = data[0].count

  return (
    <Card title={`Kata Sering di ${susp.length} Review Mencurigakan`}>
      {data.map(d => (
        <HBar key={d.word} label={d.word} value={d.count} max={max} color={C.suspicious} suffix="×" />
      ))}
    </Card>
  )
}

// ── Main export ────────────────────────────────────────────────
export default function AnalyticsChart({ summary, reviews }) {
  if (!reviews?.length) return null

  return (
    <div style={{ marginBottom:24 }}>
      <h2 style={{ fontSize:16, fontWeight:700, marginBottom:16, color:'#0f172a' }}>Visualisasi</h2>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }} className="chart-grid-2">
        <Donut summary={summary} />
        <ConfidenceBar reviews={reviews} />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }} className="chart-grid-2">
        <SentimentByRating reviews={reviews} />
        <TrustDist reviews={reviews} />
      </div>
      <SuspiciousWords reviews={reviews} />
    </div>
  )
}
