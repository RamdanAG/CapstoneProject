import { Router } from 'express'
import { getModelStatus } from '../ai/modelLoader.js'
import { analyzeReview, analyzeBatch } from '../ai/services/predict.service.js'

const router = Router()

// GET /api/ai/ping — status model
router.get('/ping', (req, res) => {
  const status = getModelStatus()
  res.json({ ok: status === 'ready', status, timestamp: new Date().toISOString() })
})

// POST /api/ai/analyze — analisis satu review
// body: { text: "...", rating: 4 }
router.post('/analyze', async (req, res) => {
  try {
    const { text, rating } = req.body
    if (!text) return res.status(400).json({ error: 'Field "text" wajib diisi' })
    const result = await analyzeReview(text, rating)
    res.json({ data: result })
  } catch (err) {
    res.status(503).json({ error: err.message })
  }
})

// POST /api/ai/analyze/batch — analisis banyak review
// body: { reviews: [{ text: "...", rating: 4 }, ...] }
router.post('/analyze/batch', async (req, res) => {
  try {
    const { reviews } = req.body
    if (!Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ error: 'Field "reviews" harus array dan tidak boleh kosong' })
    }
    if (reviews.length > 100) {
      return res.status(400).json({ error: 'Maksimal 100 review per request' })
    }
    const result = await analyzeBatch(reviews)
    res.json({ data: result })
  } catch (err) {
    res.status(503).json({ error: err.message })
  }
})

export default router
