import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import session from 'express-session'
import passport from './auth/passport.js'
import itemRoutes from './routes/item.routes.js'
import aiRoutes from './routes/ai.routes.js'
import authRoutes from './auth/auth.routes.js'
import analyzeRoutes from './routes/analyze.routes.js'
import { historyRoutes } from './routes/history.routes.js'
import { loadModel } from './ai/modelLoader.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET || 'ganti-ini',
  resave: false, saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 7*24*60*60*1000 }
}))
app.use(passport.initialize())
app.use(passport.session())

app.use('/auth',         authRoutes)
app.use('/api/items',    itemRoutes)
app.use('/api/ai',       aiRoutes)
app.use('/api/analyze',  analyzeRoutes)
app.use('/api/history',  historyRoutes)

app.get('/', (req, res) => res.json({ message: 'ARIS API 🚀' }))
app.use((req, res) => res.status(404).json({ error: 'Route not found' }))
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).json({ error: 'Internal server error' }) })

loadModel().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
})
