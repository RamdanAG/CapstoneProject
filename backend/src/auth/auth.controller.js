import bcrypt from 'bcrypt'
import { getAll, insert } from '../data/db.js'

// POST /auth/register — manual atau lanjutan Google
export async function register(req, res) {
  try {
    const { name, email, password, googleId, avatar } = req.body

    if (!name || !email) return res.status(400).json({ error: 'Name dan email wajib diisi' })
    if (!googleId && !password) return res.status(400).json({ error: 'Password wajib diisi' })

    const users = getAll('users')

    // Cek email sudah ada
    if (users.find(u => u.email === email)) {
      return res.status(409).json({ error: 'Email sudah terdaftar' })
    }

    // Kalau dari Google, validasi googleId cocok dengan session
    if (googleId) {
      const pending = req.session.pendingGoogle
      if (!pending || pending.googleId !== googleId) {
        return res.status(403).json({ error: 'Data Google tidak valid' })
      }
      req.session.pendingGoogle = null
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null

    const newUser = insert('users', {
      name,
      email,
      password: hashedPassword,
      googleId: googleId || null,
      avatar:   avatar || null,
      role:     'user',
    })

    // Auto login setelah register
    req.login(newUser, err => {
      if (err) return res.status(500).json({ error: 'Gagal login setelah register' })
      const { password: _, ...safeUser } = newUser
      res.status(201).json({ data: safeUser })
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// POST /auth/login — manual
export async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email dan password wajib diisi' })

    const users = getAll('users')
    const user = users.find(u => u.email === email)

    if (!user) return res.status(401).json({ error: 'Email belum terdaftar' })
    if (!user.password) return res.status(401).json({ error: 'Akun ini terdaftar via Google, silakan login dengan Google' })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Password salah' })

    req.login(user, err => {
      if (err) return res.status(500).json({ error: 'Gagal login' })
      const { password: _, ...safeUser } = user
      res.json({ data: safeUser })
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
