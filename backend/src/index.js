import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import session from 'express-session'
import passport from './auth/passport.js'
import itemRoutes from './routes/item.routes.js'
import aiRoutes from './routes/ai.routes.js'
import authRoutes from './auth/auth.routes.js'
import { loadModel } from './ai/modelLoader.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// CORS — izinkan frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // penting untuk session/cookie
}))

app.use(express.json())

// Session — wajib sebelum passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'ganti-ini-dengan-secret-panjang',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
  }
}))

// Passport
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/auth', authRoutes)
app.use('/api/items', itemRoutes)
app.use('/api/ai', aiRoutes)

app.get('/', (req, res) => res.json({ message: 'API is running 🚀' }))
app.use((req, res) => res.status(404).json({ error: 'Route not found' }))
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

loadModel().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
})
