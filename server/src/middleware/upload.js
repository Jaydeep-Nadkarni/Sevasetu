import multer from 'multer'
import path from 'path'

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB for images
  video: 50 * 1024 * 1024, // 50MB for videos
  document: 10 * 1024 * 1024, // 10MB for documents
}

// Allowed MIME types
const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

// Allowed file extensions
const ALLOWED_EXTENSIONS = {
  image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  video: ['.mp4', '.mpeg', '.mov', '.avi'],
  document: ['.pdf', '.doc', '.docx'],
}

/**
 * Validate file type and size
 * @param {Object} file - File object from multer
 * @param {string} fileType - Type of file (image, video, document)
 * @returns {Object} - Validation result
 */
const validateFile = (file, fileType = 'image') => {
  const errors = []

  if (!file) {
    return { valid: false, errors: ['No file provided'] }
  }

  // Check file size
  const maxSize = FILE_SIZE_LIMITS[fileType] || FILE_SIZE_LIMITS.image
  if (file.size > maxSize) {
    errors.push(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`)
  }

  // Check MIME type
  const allowedMimes = ALLOWED_MIME_TYPES[fileType] || ALLOWED_MIME_TYPES.image
  if (!allowedMimes.includes(file.mimetype)) {
    errors.push(`Invalid file type. Allowed types: ${allowedMimes.join(', ')}`)
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase()
  const allowedExts = ALLOWED_EXTENSIONS[fileType] || ALLOWED_EXTENSIONS.image
  if (!allowedExts.includes(ext)) {
    errors.push(`Invalid file extension. Allowed: ${allowedExts.join(', ')}`)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Storage configuration for multer
 * Files are stored in memory and then uploaded to Cloudinary
 */
const storage = multer.memoryStorage()

/**
 * File filter for multer
 */
const fileFilter = (req, file, cb) => {
  const fileType = req.body?.fileType || 'image'
  const validation = validateFile(file, fileType)

  if (!validation.valid) {
    const error = new Error(validation.errors.join('; '))
    error.statusCode = 400
    error.errors = validation.errors
    return cb(error)
  }

  cb(null, true)
}

/**
 * Create multer upload middleware
 * @param {Object} options - Multer options
 * @returns {Object} - Multer middleware
 */
export const createUploadMiddleware = (options = {}) => {
  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: FILE_SIZE_LIMITS[options.fileType] || FILE_SIZE_LIMITS.image,
    },
  })
}

/**
 * Single file upload middleware
 */
export const uploadSingle = (fieldName = 'file') => {
  return createUploadMiddleware().single(fieldName)
}

/**
 * Multiple file upload middleware
 */
export const uploadMultiple = (fieldName = 'files', maxFiles = 5) => {
  return createUploadMiddleware().array(fieldName, maxFiles)
}

/**
 * Mixed file upload middleware
 */
export const uploadMixed = (fields = []) => {
  return createUploadMiddleware().fields(fields)
}

/**
 * Middleware to validate uploaded file
 */
export const validateUploadedFile = (req, res, next) => {
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    })
  }

  // If single file
  if (req.file) {
    const fileType = req.body?.fileType || 'image'
    const validation = validateFile(req.file, fileType)
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'File validation failed',
        errors: validation.errors,
      })
    }
  }

  // If multiple files
  if (req.files) {
    const fileType = req.body?.fileType || 'image'
    for (const file of Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) {
      const validation = validateFile(file, fileType)
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: 'File validation failed',
          errors: validation.errors,
        })
      }
    }
  }

  next()
}

export default {
  validateFile,
  uploadSingle,
  uploadMultiple,
  uploadMixed,
  validateUploadedFile,
  createUploadMiddleware,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
}
