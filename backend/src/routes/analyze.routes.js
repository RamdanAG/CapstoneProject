import { Router } from 'express'
import { scrapeProduct } from '../scraper/scraper.service.js'
import { analyzeBatch, analyzeReview } from '../ai/services/predict.service.js'
import { insert } from '../data/db.js'

const router = Router()

router.get('/url/stream', async (req, res) => {
  const { url, limit = 50 } = req.query

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  const send = (data) => {
    try { res.write(`data: ${JSON.stringify(data)}\n\n`) } catch {}
  }

  try {
    if (!url) { send({ error: 'URL produk wajib diisi' }); return res.end() }
    if (!url.includes('tokopedia.com')) { send({ error: 'URL harus dari Tokopedia' }); return res.end() }

    send({ step: 'scraping', message: 'Mengambil ulasan dari Tokopedia...', progress: 5 })

    let rawReviews
    try {
      rawReviews = await scrapeProduct(url, Number(limit) || 99999, (scraped, total) => {
        const pct = total > 0 ? Math.round((scraped / total) * 50) : 5
        send({ step: 'scraping', message: `Scraping ${scraped} dari ${total} ulasan...`, progress: pct })
      })
    } catch (err) {
      send({ error: `Gagal scraping: ${err.message}` }); return res.end()
    }

    if (!rawReviews?.length) {
      send({ error: 'Tidak ada review yang berhasil di-scrape. Cek cookies Tokopedia.' })
      return res.end()
    }

    const reviews = rawReviews
      .map(r => ({
        text:         (r.message || r.message_clean || '').trim(),
        rating:       Number(r.rating) || 5,
        author:       r.username || r.user || '',
        date:         r.date || '',
        has_image:    r.has_image === true || r.has_image === 'True',
        is_anonymous: r.is_anonymous === true || r.is_anonymous === 'True',
      }))
      .filter(r => r.text.length > 2)

    if (!reviews.length) {
      send({ error: 'Semua review kosong setelah diproses.' }); return res.end()
    }

    send({ step: 'analyzing', message: `Menganalisis ${reviews.length} ulasan...`, progress: 55 })

    let result
    try {
      result = await analyzeBatch(reviews, (done, total) => {
        const pct = 55 + Math.round((done / total) * 40)
        send({ step: 'analyzing', message: `Menganalisis ${done} dari ${total}...`, progress: pct })
      })
    } catch (err) {
      send({ error: `Gagal analisis: ${err.message}` }); return res.end()
    }

    result.reviews = result.reviews.map((analysis, i) => ({
      ...analysis,
      author:       reviews[i]?.author || '',
      date:         reviews[i]?.date || '',
      rating:       reviews[i]?.rating || 5,
      has_image:    reviews[i]?.has_image || false,
      is_anonymous: reviews[i]?.is_anonymous || false,
    }))

    const finalData = {
      url, scraped_at: new Date().toISOString(),
      summary: { total: result.total, positive: result.positive, negative: result.negative, suspicious: result.suspicious, avg_trust: result.avg_trust },
      reviews: result.reviews,
    }

    try {
      insert('history', { url, scraped_at: finalData.scraped_at, total: result.total, positive: result.positive, negative: result.negative, suspicious: result.suspicious, avg_trust: result.avg_trust, reviews: result.reviews })
    } catch { /* history gagal simpan tidak perlu crash */ }

    send({ step: 'done', progress: 100, message: 'Selesai!', data: finalData })

  } catch (err) {
    send({ error: `Terjadi kesalahan: ${err.message}` })
  }
  res.end()
})

router.post('/text', async (req, res) => {
  try {
    const { text, rating = 5 } = req.body
    if (!text?.trim()) return res.status(400).json({ error: 'Text review tidak boleh kosong' })
    const result = await analyzeReview(text, rating)
    res.json({ data: result })
  } catch (err) {
    const status = err.message.includes('belum siap') || err.message.includes('loading') ? 503 : 500
    res.status(status).json({ error: err.message })
  }
})

export default router
