import { useEffect, useState } from 'react'
import api from '../services/api'

export default function useAuth() {
  const [user, setUser] = useState(undefined) // undefined = masih loading
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/auth/me')
      .then(res => setUser(res.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await api.post('/auth/logout')
    setUser(null)
    window.location.href = '/login'
  }

  return { user, loading, logout }
}
