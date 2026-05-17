import passport from 'passport'
import { getAll } from '../data/db.js'

// Google OAuth diaktifkan hanya kalau GOOGLE_CLIENT_ID sudah diisi di .env
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const { Strategy: GoogleStrategy } = await import('passport-google-oauth20')

  passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
  }, (accessToken, refreshToken, profile, done) => {
    const users   = getAll('users')
    const existing = users.find(u => u.googleId === profile.id)

    if (existing) return done(null, existing)

    return done(null, false, {
      needsRegister: true,
      googleId:  profile.id,
      name:      profile.displayName,
      email:     profile.emails?.[0]?.value,
      avatar:    profile.photos?.[0]?.value,
    })
  }))
} else {
  console.warn('⚠️  GOOGLE_CLIENT_ID tidak ditemukan — Google OAuth dinonaktifkan')
}

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
  const user = getAll('users').find(u => u.id === id)
  done(null, user ?? false)
})

export default passport
