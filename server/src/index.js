import express from 'express'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import compression from 'compression'
import config from './config/config.js'
import connectDB from './config/db.js'
import logger from './utils/logger.js'
import AppError from './utils/AppError.js'
import { errorHandler } from './middleware/errorMiddleware.js'
import {
  limiter,
  securityHeaders,
  mongoSanitization,
  xssSanitization,
  corsConfig,
} from './middleware/security.js'

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
io.on('connection', (socket) => {
  logger.info(`📱 New client connected: ${socket.id}`)

  // User joins their own room for personal notifications
  socket.on('user:join', (userId) => {
    socket.join(`user:${userId}`)
    logger.info(`✅ User ${userId} joined their notification room`)
  })

  // NGO joins their room
  socket.on('ngo:join', (ngoId) => {
    socket.join(`ngo:${ngoId}`)
    logger.info(`✅ NGO ${ngoId} joined their notification room`)
  })

  socket.on('disconnect', () => {
    logger.info(`❌ Client disconnected: ${socket.id}`)
  })
})

// Global Middleware
app.use(securityHeaders) // Helmet
app.use(corsConfig) // CORS
app.use(express.json({ limit: '10kb' })) // Body parser, reading data from body into req.body
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(mongoSanitization) // Data sanitization against NoSQL query injection
app.use(xssSanitization) // Data sanitization against XSS
app.use(compression()) // Compress all responses

// Logging
const morganFormat = ':method :url :status :response-time ms'
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(' ')[0],
          url: message.split(' ')[1],
          status: message.split(' ')[2],
          responseTime: message.split(' ')[3],
        }
        logger.http(JSON.stringify(logObject))
      },
    },
  }),
)

// Rate limiting for API routes
app.use('/api', limiter)

// Connect to MongoDB
connectDB()

// Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/donations', donationRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/help-requests', helpRequestRoutes)
app.use('/api/ngos', ngoRoutes)
app.use('/api/certificates', certificateRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/notifications', notificationRoutes)

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

// Global Error Handling Middleware
app.use(errorHandler)

const PORT = config.port

httpServer.listen(PORT, () => {
  logger.info(`\n🚀 Server running on port ${PORT}`)
  logger.info(`📍 Environment: ${config.nodeEnv}`)
  logger.info(`🌐 CORS Origin: ${config.corsOrigin}`)
  logger.info(`🔌 WebSocket enabled for real-time notifications\n`)
})

export default app
