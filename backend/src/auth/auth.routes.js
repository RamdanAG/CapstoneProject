import { Router } from 'express'
import passport from 'passport'
import { register, login } from './auth.controller.js'

const router = Router()
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173'

// ── Manual ────────────────────────────────────────────
router.post('/register', register)
router.post('/login', login)

// ── Google OAuth ──────────────────────────────────────
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get('/google/callback',
  passport.authenticate('google', { failWithError: true }),
  // Sukses — sudah terdaftar
  (req, res) => res.redirect(FRONTEND),
  // Gagal — belum terdaftar
  (err, req, res, next) => {
    const info = err // passport melempar info di failWithError
    if (info?.needsRegister) {
      // Simpan data Google ke session sementara
      req.session.pendingGoogle = {
        googleId: info.googleId,
        name:     info.name,
        email:    info.email,
        avatar:   info.avatar,
      }
      const params = new URLSearchParams({
        source: 'google',
        name:   info.name  || '',
        email:  info.email || '',
        avatar: info.avatar|| '',
        googleId: info.googleId,
      })
      return res.redirect(`${FRONTEND}/register?${params}`)
    }
    res.redirect(`${FRONTEND}/login?error=google_failed`)
  }
)

// GET /auth/me
router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Belum login' })
  const { password: _, ...safeUser } = req.user
  res.json({ data: safeUser })
})

// POST /auth/logout
router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err)
    res.json({ message: 'Berhasil logout' })
  })
})

export default router
