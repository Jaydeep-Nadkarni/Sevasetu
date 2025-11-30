import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getMyCertificates,
  verifyCertificate,
  getCertificateById
} from '../controllers/certificateController.js'

const router = express.Router()

// Public routes
router.get('/verify/:code', verifyCertificate)

// Protected routes
router.use(protect)
router.get('/my-certificates', getMyCertificates)
router.get('/:id', getCertificateById)

export default router
