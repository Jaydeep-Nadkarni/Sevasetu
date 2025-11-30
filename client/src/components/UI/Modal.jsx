import { useTheme } from '../../context/ThemeContext'
import { motion } from 'framer-motion'

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeButton = true,
  ...props
}) => {
  const { isDark } = useTheme()

  if (!isOpen) return null

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 20 },
    visible: { scale: 1, opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        variants={overlayVariants}
      />

      {/* Modal */}
      <motion.div
        className={`relative ${sizeStyles[size]} w-full mx-4 ${isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow-xl`}
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
        {...props}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 ${isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
          <h2 className="text-xl font-semibold">{title}</h2>
          {closeButton && (
            <button
              onClick={onClose}
              className={`text-2xl leading-none font-bold ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}
            >
              ×
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className={`px-6 py-4 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
