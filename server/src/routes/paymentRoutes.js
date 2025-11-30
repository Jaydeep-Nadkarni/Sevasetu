import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  createOrder,
  verifyPayment,
  getTransactionHistory,
  getFinancialReport,
  handleWebhook
} from '../controllers/paymentController.js'

const router = express.Router()

router.post('/create-order', protect, createOrder)
router.post('/verify', protect, verifyPayment)
router.get('/history', protect, getTransactionHistory)
router.get('/reports', protect, getFinancialReport)
router.post('/webhook', handleWebhook)

export default router
