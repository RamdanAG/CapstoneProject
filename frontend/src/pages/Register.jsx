import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

export default function Register() {
  const [params] = useSearchParams()
  const isGoogle = params.get('source') === 'google'

  const [form, setForm] = useState({
    name:     params.get('name')     || '',
    email:    params.get('email')    || '',
    avatar:   params.get('avatar')   || '',
    googleId: params.get('googleId') || '',
    password: '',
    confirm:  '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!isGoogle && form.password !== form.confirm) {
      return setError('Password tidak cocok')
    }

    setLoading(true)
    try {
      const payload = {
        name:   form.name,
        email:  form.email,
        avatar: form.avatar || undefined,
        ...(isGoogle
          ? { googleId: form.googleId }
          : { password: form.password }
        )
      }
      await api.post('/auth/register', payload)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-sm p-8">

        {isGoogle ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              {form.avatar && <img src={form.avatar} className="w-12 h-12 rounded-full" alt="" />}
              <div>
                <h1 className="text-xl font-bold text-gray-800">Lengkapi Pendaftaran</h1>
                <p className="text-xs text-gray-400">via Google Account</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Daftar</h1>
            <p className="text-sm text-gray-500 mb-6">Sudah punya akun? <Link to="/login" className="text-blue-600 hover:underline">Masuk</Link></p>
          </>
        )}

        {error && <p className="text-sm text-red-500 bg-red-50 rounded px-3 py-2 mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            placeholder="Nama lengkap" required
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <input
            type="email" placeholder="Email" required
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={form.email}
            readOnly={isGoogle}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />

          {/* Password hanya untuk registrasi manual */}
          {!isGoogle && (
            <>
              <input
                type="password" placeholder="Password" required
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              />
              <input
                type="password" placeholder="Konfirmasi password" required
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
              />
            </>
          )}

          <button
            type="submit" disabled={loading}
            className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 mt-1"
          >
            {loading ? 'Mendaftar...' : isGoogle ? 'Selesaikan Pendaftaran' : 'Daftar'}
          </button>
        </form>

        {/* Daftar via Google (hanya di halaman register manual) */}
        {!isGoogle && (
          <>
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
              Daftar dengan Google
            </a>
          </>
        )}
      </div>
    </div>
  )
}
