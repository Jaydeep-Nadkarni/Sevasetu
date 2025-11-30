import { uploadImage, deleteImage, getOptimizedImageUrl } from '../config/cloudinary.js'
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js'
import { optimizeImage } from '../utils/imageOptimizer.js'

/**
 * Upload single image to Cloudinary
 */
export const uploadImage_handler = asyncHandler(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 'No file provided', 400)
  }

  try {
    const { fileType = 'image', folder = 'sevasetu', quality = 80, width = 800 } = req.body

    // Prepare upload options
    const uploadOptions = {
      quality: parseInt(quality),
      width: parseInt(width),
      folder: folder,
      tags: [fileType, 'sevasetu'],
      resourceType: fileType === 'video' ? 'video' : 'image',
    }

    let fileBuffer = req.file.buffer

    // Optimize image locally before upload if it's an image
    if (fileType === 'image' && req.file.mimetype.startsWith('image/')) {
      try {
        fileBuffer = await optimizeImage(req.file.buffer, {
          width: parseInt(width),
          quality: parseInt(quality),
          format: 'webp', // Convert to WebP for better compression
        })
      } catch (optError) {
        console.warn('Local optimization failed, proceeding with original file:', optError)
      }
    }

    // Upload to Cloudinary
    const result = await uploadImage(fileBuffer, uploadOptions)

    // Return success response with image details
    successResponse(
      res,
      {
        publicId: result.public_id,
        url: result.secure_url,
        thumbnail: result.eager?.[0]?.secure_url || result.secure_url,
        width: result.width,
        height: result.height,
        size: result.bytes,
        format: result.format,
        resourceType: result.resource_type,
      },
      'Image uploaded successfully',
      201
    )
  } catch (error) {
    console.error('Upload error:', error)
    errorResponse(res, 'Image upload failed: ' + error.message, 500)
  }
})

/**
 * Upload multiple images to Cloudinary
 */
export const uploadImages_handler = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return errorResponse(res, 'No files provided', 400)
  }

  try {
    const { fileType = 'image', folder = 'sevasetu', quality = 80, width = 800 } = req.body
    const uploadResults = []
    const errors = []

    for (const file of req.files) {
      try {
        const uploadOptions = {
          quality: parseInt(quality),
          width: parseInt(width),
          folder: folder,
          tags: [fileType, 'sevasetu'],
          resourceType: fileType === 'video' ? 'video' : 'image',
        }

        let fileBuffer = file.buffer

        // Optimize image locally before upload if it's an image
        if (fileType === 'image' && file.mimetype.startsWith('image/')) {
          try {
            fileBuffer = await optimizeImage(file.buffer, {
              width: parseInt(width),
              quality: parseInt(quality),
              format: 'webp',
            })
          } catch (optError) {
            console.warn('Local optimization failed, proceeding with original file:', optError)
          }
        }

        const result = await uploadImage(fileBuffer, uploadOptions)
        uploadResults.push({
          publicId: result.public_id,
          url: result.secure_url,
          thumbnail: result.eager?.[0]?.secure_url || result.secure_url,
          width: result.width,
          height: result.height,
          size: result.bytes,
          format: result.format,
        })
      } catch (fileError) {
        errors.push({
          filename: file.originalname,
          error: fileError.message,
        })
      }
    }

    if (uploadResults.length === 0) {
      return errorResponse(res, 'All uploads failed', 400)
    }

    successResponse(
      res,
      {
        uploaded: uploadResults,
        failed: errors,
        count: uploadResults.length,
      },
      `${uploadResults.length} images uploaded successfully`,
      201
    )
  } catch (error) {
    console.error('Batch upload error:', error)
    errorResponse(res, 'Batch upload failed: ' + error.message, 500)
  }
})

/**
 * Delete image from Cloudinary
 */
export const deleteImage_handler = asyncHandler(async (req, res) => {
  const { publicId } = req.body

  if (!publicId) {
    return errorResponse(res, 'Public ID is required', 400)
  }

  try {
    const result = await deleteImage(publicId)

    if (result.result === 'ok') {
      successResponse(res, null, 'Image deleted successfully')
    } else {
      errorResponse(res, 'Failed to delete image', 400)
    }
  } catch (error) {
    console.error('Delete error:', error)
    errorResponse(res, 'Image deletion failed: ' + error.message, 500)
  }
})

/**
 * Get optimized image URL
 */
export const getImageUrl_handler = asyncHandler(async (req, res) => {
  const { publicId, quality = 80, width, height, format = 'auto' } = req.query

  if (!publicId) {
    return errorResponse(res, 'Public ID is required', 400)
  }

  try {
    const url = getOptimizedImageUrl(publicId, {
      quality: parseInt(quality),
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      format,
    })

    successResponse(res, { url }, 'Image URL generated successfully')
  } catch (error) {
    console.error('URL generation error:', error)
    errorResponse(res, 'Failed to generate URL: ' + error.message, 500)
  }
})

/**
 * Resize image and get new URL
 */
export const resizeImage_handler = asyncHandler(async (req, res) => {
  const { publicId, width, height, quality = 80, crop = 'auto' } = req.body

  if (!publicId || !width || !height) {
    return errorResponse(res, 'PublicId, width, and height are required', 400)
  }

  try {
    const url = getOptimizedImageUrl(publicId, {
      width: parseInt(width),
      height: parseInt(height),
      quality: parseInt(quality),
      crop,
    })

    successResponse(res, { url }, 'Image resized successfully')
  } catch (error) {
    console.error('Resize error:', error)
    errorResponse(res, 'Image resize failed: ' + error.message, 500)
  }
})
