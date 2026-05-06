import { Router } from 'express'
import passport from 'passport'

const router = Router()

// 1. Redirect ke Google login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}))

// 2. Callback setelah login Google
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/failed' }),
  (req, res) => {
    // Login sukses — redirect ke frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173')
  }
)

// 3. Cek siapa yang sedang login
router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Belum login' })
  res.json({ data: req.user })
})

// 4. Logout
router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err)
    res.json({ message: 'Berhasil logout' })
  })
})

router.get('/failed', (req, res) => {
  res.status(401).json({ error: 'Login Google gagal' })
})

export default router
