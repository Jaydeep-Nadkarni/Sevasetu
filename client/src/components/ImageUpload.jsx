import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { Button } from './Button'
import api from '../../utils/api'

/**
 * ImageUpload Component
 * Features:
 * - Drag and drop support
 * - File preview
 * - Progress tracking
 * - Error handling
 * - Delete functionality
 * - Dark mode support
 */
export const ImageUpload = ({
  onUpload,
  onDelete,
  currentImageUrl,
  accept = 'image/*',
  maxSize = 5242880, // 5MB
  disabled = false,
}) => {
  const { isDark } = useTheme()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(currentImageUrl || null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [publicId, setPublicId] = useState(null)
  const fileInputRef = useRef(null)

  // Update preview when currentImageUrl changes
  useEffect(() => {
    if (currentImageUrl && !preview) {
      setPreview(currentImageUrl)
    }
  }, [currentImageUrl, preview])

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    setError(null)

    if (!selectedFile) return

    // Validate file size
    if (selectedFile.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB`)
      return
    }

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target.result)
    }
    reader.readAsDataURL(selectedFile)
  }

  // Handle file input change
  const handleFileInputChange = (e) => {
    const selectedFile = e.target.files?.[0]
    handleFileSelect(selectedFile)
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const droppedFile = e.dataTransfer.files?.[0]
    handleFileSelect(droppedFile)
  }

  // Handle file upload
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setIsLoading(true)
    setError(null)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return 90
          return prev + Math.random() * 30
        })
      }, 200)

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      clearInterval(progressInterval)
      setProgress(100)

      const { data } = response.data
      setPublicId(data.publicId)
      setPreview(data.url)

      // Call callback
      if (onUpload) {
        onUpload({
          url: data.url,
          publicId: data.publicId,
          thumbnail: data.thumbnail,
          size: data.size,
        })
      }

      // Reset form after 1 second
      setTimeout(() => {
        setFile(null)
        setProgress(0)
      }, 1000)
    } catch (err) {
      console.error('Upload error:', err)
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to upload image. Please try again.'
      )
      setProgress(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!publicId) {
      setPreview(null)
      setFile(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await api.delete('/upload', {
        data: { publicId },
      })

      setPreview(null)
      setFile(null)
      setPublicId(null)

      if (onDelete) {
        onDelete()
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to delete image. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? isDark
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-blue-500 bg-blue-50'
              : isDark
                ? 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => !disabled && !isLoading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInputChange}
            disabled={disabled || isLoading}
            className="hidden"
          />

          {!preview ? (
            <div className="space-y-3">
              <div className="text-4xl">📸</div>
              <div>
                <p
                  className={`text-lg font-semibold ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  Drag and drop your image
                </p>
                <p
                  className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  or click to browse
                </p>
              </div>
              <p
                className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}
              >
                Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`w-24 h-24 mx-auto rounded-lg overflow-hidden border ${
                  isDark ? 'border-gray-600' : 'border-gray-300'
                }`}
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <p
                className={`text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {file?.name || 'Image selected'}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Progress Bar */}
      <AnimatePresence>
        {isLoading && progress > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className={`h-2 rounded-full overflow-hidden ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p
              className={`text-xs font-medium text-right ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {Math.round(progress)}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-500/10 dark:border-red-500/50"
          >
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {preview && !isLoading && (
          <>
            {file && !publicId ? (
              <>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleUpload}
                  disabled={disabled || isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                    setError(null)
                  }}
                  disabled={disabled || isLoading}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isLoading}
                  className="flex-1"
                >
                  Change
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleDelete}
                  disabled={disabled || isLoading}
                >
                  Delete
                </Button>
              </>
            )}
          </>
        )}
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {!isLoading && file && progress === 100 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-lg bg-green-50 border border-green-200 dark:bg-green-500/10 dark:border-green-500/50"
          >
            <p className="text-sm text-green-600 dark:text-green-400">
              ✅ Image uploaded successfully!
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ImageUpload
