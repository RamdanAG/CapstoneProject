import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import itemRoutes from './routes/item.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/items', itemRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'API is running 🚀' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
