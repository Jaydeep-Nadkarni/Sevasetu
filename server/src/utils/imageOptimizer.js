import sharp from 'sharp'

/**
 * Optimize image buffer using sharp
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Optimization options
 * @returns {Promise<Buffer>} - Optimized image buffer
 */
export const optimizeImage = async (buffer, options = {}) => {
  const { width = 800, quality = 80, format = 'jpeg' } = options

  let pipeline = sharp(buffer)

  // Resize if width is provided
  if (width) {
    pipeline = pipeline.resize({ width, withoutEnlargement: true })
  }

  // Convert and compress
  if (format === 'jpeg' || format === 'jpg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true })
  } else if (format === 'png') {
    pipeline = pipeline.png({ quality, compressionLevel: 9 })
  } else if (format === 'webp') {
    pipeline = pipeline.webp({ quality })
  }

  return await pipeline.toBuffer()
}
