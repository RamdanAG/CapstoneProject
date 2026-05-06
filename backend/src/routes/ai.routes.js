import { Router } from 'express'
import { getModelStatus } from '../ai/modelLoader.js'
import { predict } from '../ai/services/predict.service.js'

const router = Router()

// GET /api/ai/ping
router.get('/ping', (req, res) => {
  const status = getModelStatus()
  res.json({
    ok: status === 'ready',
    status,
    timestamp: new Date().toISOString(),
  })
})

// POST /api/ai/predict
router.post('/predict', async (req, res) => {
  try {
    const { input } = req.body
    if (input === undefined) return res.status(400).json({ error: 'Field "input" wajib diisi' })
    const result = await predict(input)
    res.json({ data: result })
  } catch (err) {
    res.status(503).json({ error: err.message })
  }
})

export default router
