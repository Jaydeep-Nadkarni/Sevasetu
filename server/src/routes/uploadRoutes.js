import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { uploadSingle, uploadMultiple, validateUploadedFile } from '../middleware/upload.js'
import {
  uploadImage_handler,
  uploadImages_handler,
  deleteImage_handler,
  getImageUrl_handler,
  resizeImage_handler,
} from '../controllers/uploadController.js'

const router = express.Router()

/**
 * POST /api/upload
 * Upload single image
 * Body: form-data with 'file' field
 * Auth: Required
 */
router.post(
  '/',
  authenticate,
  uploadSingle('file'),
  validateUploadedFile,
  uploadImage_handler
)

/**
 * POST /api/upload/multiple
 * Upload multiple images
 * Body: form-data with 'files' field
 * Auth: Required
 * Max files: 5
 */
router.post(
  '/multiple',
  authenticate,
  uploadMultiple('files', 5),
  validateUploadedFile,
  uploadImages_handler
)

/**
 * DELETE /api/upload
 * Delete image from Cloudinary
 * Body: { publicId: string }
 * Auth: Required
 */
router.delete('/', authenticate, deleteImage_handler)

/**
 * GET /api/upload/url/:publicId
 * Get optimized image URL with transformations
 * Query: quality, width, height, format
 * Auth: Not required (public URLs)
 */
router.get('/url/:publicId', getImageUrl_handler)

/**
 * POST /api/upload/resize
 * Resize image and get new URL
 * Body: { publicId, width, height, quality, crop }
 * Auth: Required
 */
router.post('/resize', authenticate, resizeImage_handler)

export default router
