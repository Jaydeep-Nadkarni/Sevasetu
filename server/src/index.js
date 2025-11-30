import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import config from './config/config.js'
import connectDB from './config/db.js'

const app = express()

// Middleware
app.use(morgan('dev'))
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB
connectDB()

// Routes
app.get('/api/health', (req, res) => {
  res.json({
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    status: err.status || 500,
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    status: 404,
  })
})

const PORT = config.port

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`)
  console.log(`📍 Environment: ${config.nodeEnv}`)
  console.log(`🌐 CORS Origin: ${config.corsOrigin}\n`)
})

export default app
