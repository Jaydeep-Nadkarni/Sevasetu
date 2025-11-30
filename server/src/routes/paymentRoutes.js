import express from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  createOrder,
  verifyPayment,
  getTransactionHistory,
  getFinancialReport,
  handleWebhook
} from '../controllers/paymentController.js'

const router = express.Router()

router.post('/create-order', authenticate, createOrder)
router.post('/verify', authenticate, verifyPayment)
router.get('/history', authenticate, getTransactionHistory)
router.get('/reports', authenticate, getFinancialReport)
router.post('/webhook', handleWebhook)

export default router
