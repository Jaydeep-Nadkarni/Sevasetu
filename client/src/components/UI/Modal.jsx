import { motion, AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeButton = true,
  closeOnBackdropClick = true,
  ...props
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Add blur to elements outside modal
      document.documentElement.style.pointerEvents = 'auto'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-[95vw]',
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const modalVariants = {
    hidden: { 
      scale: 0.9, 
      opacity: 0, 
      y: 20,
    },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
        duration: 0.3,
      }
    },
    exit: { 
      scale: 0.9, 
      opacity: 0, 
      y: 20,
      transition: { duration: 0.2 }
    }
  }

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      onClose()
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleBackdropClick}
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            className={`
              relative ${sizeStyles[size]} w-full 
              bg-white dark:bg-gray-800 
              text-gray-900 dark:text-gray-100
              rounded-2xl shadow-2xl overflow-hidden flex flex-col 
              max-h-[90vh] sm:max-h-[95vh]
              border border-gray-200/50 dark:border-gray-700/50
            `}
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            {/* Header */}
            <motion.div 
              className="flex items-center justify-between px-6 py-4 sm:px-8 sm:py-5 border-b border-gray-200/50 dark:border-gray-700/50 shrink-0 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
              initial={false}
            >
              <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent line-clamp-1">
                {title}
              </h2>
              {closeButton && (
                <motion.button
                  onClick={onClose}
                  className="ml-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              )}
            </motion.div>

            {/* Body */}
            <motion.div 
              className="px-6 py-4 sm:px-8 sm:py-6 overflow-y-auto flex-1 custom-scrollbar"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {children}
            </motion.div>

            {/* Footer */}
            {footer && (
              <motion.div 
                className="px-6 py-4 sm:px-8 sm:py-5 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm shrink-0"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                {footer}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
