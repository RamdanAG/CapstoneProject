/**
 * Middleware proteksi route — pasang di route yang butuh login
 * Contoh: router.get('/secret', requireAuth, handler)
 */
export function requireAuth(req, res, next) {
  if (req.isAuthenticated()) return next()
  res.status(401).json({ error: 'Unauthorized — silakan login dulu' })
}

// Khusus role admin
export function requireAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user?.role === 'admin') return next()
  res.status(403).json({ error: 'Forbidden — hanya admin' })
}
