import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import { sendMessage, getChatHistory, clearChatHistory } from '../controllers/chatController.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()

// Rate limiting: 20 requests per 15 minutes
const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  }
})

router.use(protect)
router.post('/message', chatLimiter, sendMessage)
router.get('/history', getChatHistory)
router.delete('/history', clearChatHistory)

export default router
