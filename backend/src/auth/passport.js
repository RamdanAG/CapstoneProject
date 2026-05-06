import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { getAll, insert, update } from '../data/db.js'

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  const users = getAll('users')
  let user = users.find(u => u.googleId === profile.id)

  if (user) {
    user = update('users', user.id, {
      name:   profile.displayName,
      email:  profile.emails?.[0]?.value,
      avatar: profile.photos?.[0]?.value,
    })
  } else {
    user = insert('users', {
      googleId: profile.id,
      name:     profile.displayName,
      email:    profile.emails?.[0]?.value,
      avatar:   profile.photos?.[0]?.value,
      role:     'user',
    })
  }

  return done(null, user)
}))

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
  const user = getAll('users').find(u => u.id === id)
  done(null, user ?? false)
})

export default passport
