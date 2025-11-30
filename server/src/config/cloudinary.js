import cloudinary from 'cloudinary'
import config from './config.js'

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
})

/**
 * Upload image to Cloudinary with optimization
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result with URL
 */
export const uploadImage = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        // Image optimization settings
        quality: options.quality || 80,
        width: options.width || 800,
        height: options.height,
        crop: options.crop || 'auto',
        fetch_format: options.format || 'auto',
        eager: [
          // Create thumbnail version
          { width: 200, height: 200, crop: 'thumb', gravity: 'face' },
        ],
        resource_type: options.resourceType || 'image',
        folder: options.folder || 'sevasetu',
        tags: options.tags || ['sevasetu'],
        // Use filename if provided
        public_id: options.publicId,
        // Enable overwrite
        overwrite: true,
        // Add timestamps
        timestamp: Math.floor(Date.now() / 1000),
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )

    uploadStream.end(fileBuffer)
  })
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteImage = (publicId) => {
  return cloudinary.v2.uploader.destroy(publicId)
}

/**
 * Get optimized image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, options = {}) => {
  return cloudinary.v2.url(publicId, {
    transformation: [
      {
        quality: options.quality || 80,
        fetch_format: options.format || 'auto',
        width: options.width,
        height: options.height,
        crop: options.crop || 'auto',
      },
    ],
  })
}

/**
 * Bulk delete images
 * @param {Array<string>} publicIds - Array of Cloudinary public IDs
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteImages = async (publicIds) => {
  return cloudinary.v2.api.delete_resources(publicIds)
}

/**
 * Get resource info
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Resource information
 */
export const getResourceInfo = (publicId) => {
  return cloudinary.v2.api.resource(publicId)
}

export default cloudinary.v2
