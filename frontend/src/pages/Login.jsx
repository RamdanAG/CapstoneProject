import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/login', form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Masuk</h1>
        <p className="text-sm text-gray-500 mb-6">Belum punya akun? <Link to="/register" className="text-blue-600 hover:underline">Daftar</Link></p>

        {params.get('error') === 'google_failed' && (
          <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2 mb-4">Login Google gagal, coba lagi.</p>
        )}
        {error && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email" placeholder="Email" required
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <input
            type="password" placeholder="Password" required
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          <button
            type="submit" disabled={loading}
            className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <div className="flex items-center gap-2 my-4">
          <hr className="flex-1 border-gray-200" />
          <span className="text-xs text-gray-400">atau</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <a
          href="http://localhost:3000/auth/google"
          className="flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50"
        >
          <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
          Lanjutkan dengan Google
        </a>
      </div>
    </div>
  )
}
