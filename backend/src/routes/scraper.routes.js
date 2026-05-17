import { Router } from 'express'
import { runScraper, runCleaner, parseCSV } from '../scraper/scraper.service.js'
import { analyzeBatch } from '../ai/services/predict.service.js'

const router = Router()

/**
 * POST /api/scrape
 * Scrape ulasan dari URL Tokopedia, langsung analisis pakai model ARIS
 *
 * body: { url: "https://tokopedia.com/...", limit: 50 }
 */
router.post('/', async (req, res) => {
  const { url, limit = 50 } = req.body

  if (!url) return res.status(400).json({ error: 'URL produk wajib diisi' })
  if (!url.includes('tokopedia.com')) return res.status(400).json({ error: 'URL harus dari Tokopedia' })
  if (limit > 500) return res.status(400).json({ error: 'Maksimal 500 ulasan per request' })

  try {
    // 1. Scraping
    res.setHeader('Content-Type', 'application/json')
    console.log(`📦 Start scraping: ${url}`)

    const csvPath = await runScraper(url, limit)
    const reviews = parseCSV(csvPath)

    if (reviews.length === 0) {
      return res.status(422).json({ error: 'Tidak ada ulasan yang berhasil di-scrape' })
    }

    console.log(`✅ Scraped ${reviews.length} reviews`)

    // 2. Analisis dengan model ARIS
    const payload = reviews.map(r => ({
      text:   r.message_clean || r.message || '',
      rating: Number(r.rating) || 5,
    })).filter(r => r.text.length > 0)

    const analysis = await analyzeBatch(payload)

    // 3. Gabungkan hasil scraping + hasil analisis
    const combined = reviews.map((r, i) => ({
      ...r,
      ...(analysis.reviews[i] || {}),
    }))

    res.json({
      data: {
        url,
        total_scraped: reviews.length,
        summary: {
          total:      analysis.total,
          positive:   analysis.positive,
          negative:   analysis.negative,
          suspicious: analysis.suspicious,
          avg_trust:  analysis.avg_trust,
        },
        reviews: combined,
      }
    })

  } catch (err) {
    console.error('Scrape error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/scrape/analyze-only
 * Kalau sudah ada data CSV, langsung analisis tanpa scraping ulang
 *
 * body: { reviews: [{ text: "...", rating: 4 }] }
 */
router.post('/analyze-only', async (req, res) => {
  const { reviews } = req.body

  if (!Array.isArray(reviews) || reviews.length === 0) {
    return res.status(400).json({ error: '"reviews" harus array dan tidak boleh kosong' })
  }

  try {
    const result = await analyzeBatch(reviews)
    res.json({ data: result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
