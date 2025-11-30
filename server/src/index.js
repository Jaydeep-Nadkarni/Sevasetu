import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import config from './config/config.js'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import donationRoutes from './routes/donationRoutes.js'
import eventRoutes from './routes/eventRoutes.js'
import attendanceRoutes from './routes/attendance.js'
import helpRequestRoutes from './routes/helpRequestRoutes.js'
import ngoRoutes from './routes/ngoRoutes.js'
import certificateRoutes from './routes/certificateRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import recommendationRoutes from './routes/recommendationRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: config.corsOrigin,
    credentials: true,
  },
})

// Store io instance in app for use in controllers
app.set('io', io)

// Socket.IO connection handling
io.on('connection', socket => {
  console.log(`📱 New client connected: ${socket.id}`)

  // User joins their own room for personal notifications
  socket.on('user:join', userId => {
    socket.join(`user:${userId}`)
    console.log(`✅ User ${userId} joined their notification room`)
  })

  // NGO joins their room
  socket.on('ngo:join', ngoId => {
    socket.join(`ngo:${ngoId}`)
    console.log(`✅ NGO ${ngoId} joined their notification room`)
  })

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`)
  })
})

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

// Auth routes
app.use('/api/auth', authRoutes)

// Upload routes
app.use('/api/upload', uploadRoutes)

// Donation routes
app.use('/api/donations', donationRoutes)

// Event routes
app.use('/api/events', eventRoutes)

// Attendance routes
app.use('/api/attendance', attendanceRoutes)

// Help Request routes
app.use('/api/help-requests', helpRequestRoutes)

// NGO routes
app.use('/api/ngos', ngoRoutes)

// Certificate routes
app.use('/api/certificates', certificateRoutes)

// Payment routes
app.use('/api/payment', paymentRoutes)

// Chat routes
app.use('/api/chat', chatRoutes)

// Recommendation routes
app.use('/api/recommendations', recommendationRoutes)

// Notification routes
app.use('/api/notifications', notificationRoutes)

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

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`)
  console.log(`📍 Environment: ${config.nodeEnv}`)
  console.log(`🌐 CORS Origin: ${config.corsOrigin}`)
  console.log(`🔌 WebSocket enabled for real-time notifications\n`)
})

export default app
