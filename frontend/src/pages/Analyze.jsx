import { useState } from 'react'
import api from '../services/api'
import ReviewCard from '../components/ReviewCard'

const S = {
  card: { background: 'var(--aris-card)', border: '1px solid var(--aris-border)', borderRadius: 14, padding: '20px 22px' },
  label: { fontSize: 12, color: 'var(--aris-muted)', letterSpacing: .5, marginBottom: 8, display: 'block' },
  btn: { width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: 'var(--aris-blue)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
}

export default function Analyze() {
  const [text, setText]     = useState('')
  const [rating, setRating] = useState(5)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setResult(null); setLoading(true)
    try {
      const res = await api.post('/api/analyze/text', { text, rating })
      setResult(res.data.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menganalisis.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 700 }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Analisis Manual</h1>
      <p style={{ fontSize: 13, color: 'var(--aris-muted)', marginBottom: 24 }}>Masukkan satu ulasan untuk dianalisis langsung.</p>

      <div style={{ ...S.card, marginBottom: 20 }}>
        <form onSubmit={handleSubmit}>
          <label style={S.label}>TEKS ULASAN</label>
          <textarea rows={5} placeholder="Tulis ulasan produk di sini..."
            style={{ width: '100%', background: 'var(--aris-bg)', border: '1px solid var(--aris-border)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: 'var(--aris-text)', outline: 'none', resize: 'none', marginBottom: 14 }}
            value={text} onChange={e => setText(e.target.value)} required
          />
          <label style={{ ...S.label, marginBottom: 10 }}>RATING</label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button" onClick={() => setRating(n)}
                style={{ fontSize: 22, background: 'none', border: 'none', cursor: 'pointer',
                  color: n <= rating ? 'var(--aris-warning)' : 'var(--aris-border)' }}>★</button>
            ))}
          </div>
          <button type="submit" disabled={loading} style={{ ...S.btn, opacity: loading ? .6 : 1 }}>
            {loading ? 'Menganalisis...' : 'Analisis'}
          </button>
        </form>
      </div>

      {error && <p style={{ color: 'var(--aris-negative)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
      {result && <ReviewCard review={{ ...result, rating }} />}
    </div>
  )
}
