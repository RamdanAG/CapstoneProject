import { useState } from 'react'
import useFetch from '../hooks/useFetch'
import api from '../services/api'

export default function Home() {
  const { data, loading, error, refetch } = useFetch('/api/items')
  const [form, setForm] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) return
    setSubmitting(true)
    try {
      await api.post('/api/items', form)
      setForm({ name: '', description: '' })
      refetch()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/items/${id}`)
      refetch()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Items</h1>

      {/* Form tambah item */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col gap-3">
        <h2 className="font-semibold text-gray-700">Tambah Item</h2>
        <input
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Nama item"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        />
        <input
          className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Deskripsi (opsional)"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white rounded px-4 py-2 text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : 'Tambah'}
        </button>
      </form>

      {/* List item */}
      {loading && <p className="text-gray-400">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <ul className="flex flex-col gap-3">
        {data?.data?.map(item => (
          <li key={item.id} className="bg-white rounded-xl shadow px-4 py-3 flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{item.name}</p>
              {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
            </div>
            <button
              onClick={() => handleDelete(item.id)}
              className="text-red-400 hover:text-red-600 text-sm"
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
