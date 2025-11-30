import express from 'express'
import { authenticate, authorize } from '../middleware/auth.js'
import { uploadSingle, validateUploadedFile } from '../middleware/upload.js'
import {
  createItemDonation,
  listDonations,
  getDonationById,
  updateDonationStatus,
  acceptDonation,
  rejectDonation,
  completePickup,
  getDonationsByNGO,
  getDonationsByDonor,
  searchDonations,
  cancelDonation,
  getAvailableDonations,
  getAssignedDonations,
} from '../controllers/donationController.js'

const router = express.Router()

/**
 * User routes - Create and view donations
 */

// POST /api/donations - Create new item donation
router.post('/', authenticate, uploadSingle('file'), validateUploadedFile, createItemDonation)

// GET /api/donations/my - Get user's donations
router.get('/my', authenticate, getDonationsByDonor)

// GET /api/donations/:id - Get specific donation
router.get('/:id', authenticate, getDonationById)

// PATCH /api/donations/:id/status - Update donation status (by donor)
router.patch('/:id/status', authenticate, updateDonationStatus)

// DELETE /api/donations/:id - Cancel donation (only if pending)
router.delete('/:id', authenticate, cancelDonation)

/**
 * NGO routes - Accept and manage donations
 */

// GET /api/donations/available - Get available donations for NGO (geospatial)
router.get('/available', authenticate, authorize('ngo_admin'), getAvailableDonations)

// GET /api/donations/assigned - Get donations assigned to NGO
router.get('/assigned', authenticate, authorize('ngo_admin'), getAssignedDonations)

// PATCH /api/donations/:id/accept - NGO accepts donation
router.patch('/:id/accept', authenticate, authorize('ngo_admin'), acceptDonation)

// PATCH /api/donations/:id/reject - NGO rejects donation
router.patch('/:id/reject', authenticate, authorize('ngo_admin'), rejectDonation)

// PATCH /api/donations/:id/complete - Mark pickup as complete
router.patch('/:id/complete', authenticate, authorize('ngo_admin'), completePickup)

// GET /api/donations/ngo/:ngoId - Get all donations for specific NGO
router.get('/ngo/:ngoId', authenticate, getDonationsByNGO)

/**
 * Search and filter routes
 */

// GET /api/donations - List all donations with filters
router.get('/', authenticate, listDonations)

// GET /api/donations/search - Advanced search
router.get('/search', authenticate, searchDonations)

export default router
