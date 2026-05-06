import { getAll, getById, insert, update, remove } from '../data/db.js'

const TABLE = 'items'

export const getAll_    = (req, res) => res.json({ data: getAll(TABLE) })

export const getOne     = (req, res) => {
  const item = getById(TABLE, req.params.id)
  if (!item) return res.status(404).json({ error: 'Item tidak ditemukan' })
  res.json({ data: item })
}

export const create     = (req, res) => {
  const { name, description } = req.body
  if (!name) return res.status(400).json({ error: 'Name wajib diisi' })
  res.status(201).json({ data: insert(TABLE, { name, description }) })
}

export const updateItem = (req, res) => {
  const updated = update(TABLE, req.params.id, req.body)
  if (!updated) return res.status(404).json({ error: 'Item tidak ditemukan' })
  res.json({ data: updated })
}

export const removeItem = (req, res) => {
  const ok = remove(TABLE, req.params.id)
  if (!ok) return res.status(404).json({ error: 'Item tidak ditemukan' })
  res.json({ message: 'Item berhasil dihapus' })
}
