import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { uploadMultiple } from '../middleware/upload.js'
import {
  createHelpRequest,
  listHelpRequests,
  getHelpRequestById,
  claimHelpRequest,
  addComment,
  updateStatus,
} from '../controllers/helpRequestController.js'

const router = express.Router()

// Public/Protected routes
router.get('/', listHelpRequests) // Public can see public requests, auth users see more
router.get('/:id', authenticate, getHelpRequestById) // Details might be restricted

// Protected routes
router.post('/', authenticate, uploadMultiple('images', 5), createHelpRequest)
router.post('/:id/claim', authenticate, authorize(['ngo_admin']), claimHelpRequest)
router.post('/:id/comment', authenticate, addComment)
router.patch('/:id/status', authenticate, updateStatus)

export default router
