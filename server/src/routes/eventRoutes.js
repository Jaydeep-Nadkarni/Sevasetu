import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import {
  createEvent,
  listEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getEventAttendees,
  scanQRCode,
  approveEvent,
  getPendingEvents,
  uploadEventImage,
} from '../controllers/eventController.js'
import { uploadSingle } from '../middleware/upload.js'

const router = express.Router()

// Public routes
router.get('/', listEvents)
router.get('/:id', getEventById)

// Protected routes - requires authentication
router.post('/', authenticate, uploadSingle('banner'), createEvent)
router.patch('/:id', authenticate, uploadSingle('banner'), updateEvent)
router.delete('/:id', authenticate, deleteEvent)

// Event registration
router.post('/:id/join', authenticate, joinEvent)
router.post('/:id/leave', authenticate, leaveEvent)

// Event attendees
router.get('/:id/attendees', authenticate, getEventAttendees)

// QR code attendance
router.post('/:id/scan', authenticate, scanQRCode)

// Image upload
router.post('/:id/upload-image', authenticate, uploadSingle('image'), uploadEventImage)

// Admin routes - requires admin role
router.post('/:id/approve', authenticate, authorize(['admin']), approveEvent)
router.get('/admin/pending', authenticate, authorize(['admin']), getPendingEvents)

export default router
