let items = [
  { id: 1, name: 'Item Pertama', description: 'Contoh data' },
  { id: 2, name: 'Item Kedua', description: 'Contoh data 2' },
]
let nextId = 3

export const getAll = (req, res) => res.json({ data: items })

export const getOne = (req, res) => {
  const item = items.find(i => i.id === Number(req.params.id))
  if (!item) return res.status(404).json({ error: 'Item tidak ditemukan' })
  res.json({ data: item })
}

export const create = (req, res) => {
  const { name, description } = req.body
  if (!name) return res.status(400).json({ error: 'Name wajib diisi' })
  const newItem = { id: nextId++, name, description }
  items.push(newItem)
  res.status(201).json({ data: newItem })
}

export const update = (req, res) => {
  const idx = items.findIndex(i => i.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Item tidak ditemukan' })
  items[idx] = { ...items[idx], ...req.body }
  res.json({ data: items[idx] })
}

export const remove = (req, res) => {
  const idx = items.findIndex(i => i.id === Number(req.params.id))
  if (idx === -1) return res.status(404).json({ error: 'Item tidak ditemukan' })
  items.splice(idx, 1)
  res.json({ message: 'Item berhasil dihapus' })
}
