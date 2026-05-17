export default function ReviewCard({ review }) {
  const isPos    = review.sentiment === 'positive'
  const accent   = isPos ? 'var(--positive)' : 'var(--negative)'
  const trustPct = Math.round(review.trust_score * 100)
  const confPct  = Math.round(review.confidence * 100)

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: '14px 16px',
      opacity: review.is_suspicious ? .8 : 1
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Badge color={accent} bg={isPos ? '#f0fdf4' : '#fef2f2'} label={isPos ? 'Positif' : 'Negatif'} />
          {review.is_suspicious && <Badge color="var(--warning)" bg="#fffbeb" label="⚠ Mencurigakan" />}
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--muted)', alignItems: 'center' }}>
          {review.author && <span>👤 {review.author}</span>}
          {review.date   && <span>{review.date}</span>}
          {review.rating && <Stars n={review.rating} />}
        </div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, marginBottom: 10 }}>{review.message_clean}</p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <Metric label="Confidence" value={`${confPct}%`} color={accent} />
        <MetricBar label="Trust" pct={trustPct} color="var(--blue)" />
        <Metric label="Kata" value={review.word_count} color="var(--muted)" />
      </div>
    </div>
  )
}

function Badge({ color, bg, label }) {
  return <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 99, background: bg, color, fontWeight: 600 }}>{label}</span>
}
function Metric({ label, value, color }) {
  return <div style={{ fontSize: 12 }}><span style={{ color: 'var(--muted)' }}>{label}: </span><span style={{ color, fontWeight: 600 }}>{value}</span></div>
}
function MetricBar({ label, pct, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
      <span style={{ color: 'var(--muted)' }}>{label}:</span>
      <div style={{ width: 60, height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color }} />
      </div>
      <span style={{ color, fontWeight: 600 }}>{pct}%</span>
    </div>
  )
}
function Stars({ n }) {
  return <span style={{ color: 'var(--warning)' }}>{'★'.repeat(Math.round(n))}{'☆'.repeat(5-Math.round(n))}</span>
}
