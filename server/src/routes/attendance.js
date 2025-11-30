import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import {
  markAttendance,
  getAttendanceHistory,
  verifyQR
} from '../controllers/attendanceController.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Mark attendance (scan)
router.post('/mark', markAttendance)

// Verify QR (check without marking)
router.post('/verify', verifyQR)

// Get history
router.get('/history', getAttendanceHistory)

export default router
