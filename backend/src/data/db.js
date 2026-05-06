import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_PATH = path.join(__dirname, 'data.json')

const DEFAULT_DATA = {
  items: [
    { id: 1, name: 'Item Pertama', description: 'Contoh data' },
    { id: 2, name: 'Item Kedua', description: 'Contoh data 2' },
  ],
  // tambah tabel baru di sini, contoh:
  // users: [],
  // products: [],
}

function load() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(DEFAULT_DATA, null, 2))
    return structuredClone(DEFAULT_DATA)
  }
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'))
}

function save(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2))
}

export function getAll(table) {
  return load()[table] ?? []
}

export function getById(table, id) {
  return getAll(table).find(r => r.id === Number(id)) ?? null
}

export function insert(table, record) {
  const data = load()
  if (!data[table]) data[table] = []
  const newId = data[table].length > 0 ? Math.max(...data[table].map(r => r.id)) + 1 : 1
  const newRecord = { id: newId, ...record }
  data[table].push(newRecord)
  save(data)
  return newRecord
}

export function update(table, id, changes) {
  const data = load()
  const idx = data[table]?.findIndex(r => r.id === Number(id))
  if (idx == null || idx === -1) return null
  data[table][idx] = { ...data[table][idx], ...changes }
  save(data)
  return data[table][idx]
}

export function remove(table, id) {
  const data = load()
  const idx = data[table]?.findIndex(r => r.id === Number(id))
  if (idx == null || idx === -1) return false
  data[table].splice(idx, 1)
  save(data)
  return true
}
