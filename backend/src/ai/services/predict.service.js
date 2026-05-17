import { runPredict, getModelStatus } from '../modelLoader.js'

export async function analyzeReview(text, rating = 5) {
  const status = getModelStatus()
  if (status === 'loading') throw new Error('Model sedang loading, tunggu sebentar...')
  if (status === 'error')   throw new Error('Model gagal load. Cek file .keras di folder models/')
  if (status !== 'ready')   throw new Error('Model belum siap. Coba restart backend.')

  if (!text || text.trim().length === 0) throw new Error('Teks review tidak boleh kosong')
  if (text.trim().length < 3)            throw new Error('Teks review terlalu pendek')

  return await runPredict({ text, rating })
}

export async function analyzeBatch(reviews, onProgress) {
  const status = getModelStatus()
  if (status !== 'ready') throw new Error(`Model belum siap. Status: ${status}`)
  if (!reviews?.length)   throw new Error('Tidak ada review untuk dianalisis')

  const results = []
  for (let i = 0; i < reviews.length; i++) {
    const r = reviews[i]
    if (!r.text?.trim()) continue
    try {
      const out = await runPredict({ text: r.text, rating: r.rating ?? 5 })
      results.push(out)
    } catch {
      // skip review yang gagal, jangan crash semua
      results.push({ sentiment: 'unknown', confidence: 0, confidence_label: 'low',
        positive_score: 0, negative_score: 0, suspicious_score: 0,
        trust_score: 0, is_suspicious: false,
        message_clean: r.text, word_count: 0 })
    }
    onProgress?.(i + 1, reviews.length)
  }

  const valid      = results.filter(r => r.sentiment !== 'unknown')
  const positive   = valid.filter(r => r.sentiment === 'positive').length
  const suspicious = valid.filter(r => r.is_suspicious).length
  const avgTrust   = valid.length > 0
    ? valid.reduce((s, r) => s + r.trust_score, 0) / valid.length : 0

  return {
    total:     results.length,
    positive,
    negative:  results.length - positive,
    suspicious,
    avg_trust: Math.round(avgTrust * 100) / 100,
    reviews:   results,
  }
}
