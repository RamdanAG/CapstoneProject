import { useEffect, useState } from 'react'
import api from '../services/api'

export default function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me', { withCredentials: true })
      .then(res => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = () => {
    window.location.href = 'http://localhost:3000/auth/google'
  }

  const logout = async () => {
    await api.post('/auth/logout', {}, { withCredentials: true })
    setUser(null)
  }

  return { user, loading, login, logout }
}
