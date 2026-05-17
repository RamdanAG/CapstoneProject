import { Router } from 'express'
import { getAll, insert, remove } from '../data/db.js'

const router = Router()

// GET /api/history — ambil semua history
router.get('/', (req, res) => {
  const history = getAll('history').reverse() // terbaru dulu
  res.json({ data: history })
})

// DELETE /api/history/:id — hapus satu
router.delete('/:id', (req, res) => {
  const ok = remove('history', req.params.id)
  if (!ok) return res.status(404).json({ error: 'Tidak ditemukan' })
  res.json({ message: 'Dihapus' })
})

export { router as historyRoutes }
