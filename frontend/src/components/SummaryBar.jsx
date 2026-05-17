export default function SummaryBar({ summary }) {
  const total  = summary.total || 1
  const posPct = Math.round((summary.positive / total) * 100)
  const suspPct= Math.round((summary.suspicious / total) * 100)

  const stats = [
    { label: 'Total Review',     value: summary.total,     color: 'var(--blue)'     },
    { label: 'Sentimen Positif', value: `${posPct}%`,      color: 'var(--positive)' },
    { label: 'Sentimen Negatif', value: `${100-posPct}%`,  color: 'var(--negative)' },
    { label: 'Avg Trust Score',  value: summary.avg_trust, color: 'var(--warning)'  },
  ]

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 12 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderTop: `3px solid ${s.color}`, borderRadius: 12, padding: '14px 16px'
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: .5 }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
          <span>Distribusi Sentimen</span>
          {suspPct > 0 && <span style={{ color: 'var(--warning)' }}>⚠ {summary.suspicious} mencurigakan ({suspPct}%)</span>}
        </div>
        <div style={{ height: 8, borderRadius: 99, background: 'var(--border)', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${posPct}%`, background: 'var(--positive)', transition: 'width .6s' }} />
          <div style={{ flex: 1, background: 'var(--negative)' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 6 }}>
          <span style={{ color: 'var(--positive)' }}>● Positif {posPct}%</span>
          <span style={{ color: 'var(--negative)' }}>● Negatif {100-posPct}%</span>
        </div>
      </div>
    </div>
  )
}
