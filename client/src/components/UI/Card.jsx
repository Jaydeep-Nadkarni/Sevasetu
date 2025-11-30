import { motion } from 'framer-motion'

export const Card = ({
  children,
  header,
  footer,
  className = '',
  hoverable = false,
  interactive = false,
  variant = 'default',
  padding = 'md',
  borderless = false,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800/80 text-gray-900 dark:text-gray-50',
    gradient: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-50',
    outlined: 'bg-transparent border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-50',
    elevated: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50',
  }

  const paddingStyles = {
    none: 'px-0 py-0',
    sm: 'px-4 py-3',
    md: 'px-6 py-4',
    lg: 'px-8 py-6',
  }

  const baseStyles = 'rounded-2xl overflow-hidden transition-all duration-300'
  const bgStyles = variantStyles[variant] || variantStyles.default
  const borderStyles = borderless ? '' : 'border border-gray-200/50 dark:border-gray-700/50'
  const shadowStyles = variant === 'elevated' 
    ? 'shadow-lg dark:shadow-2xl' 
    : 'shadow-sm dark:shadow-sm hover:shadow-md dark:hover:shadow-lg'
  const contentPadding = paddingStyles[padding]
  
  const hoverClasses = hoverable || interactive
    ? 'cursor-pointer transform-gpu hover:shadow-lg dark:hover:shadow-2xl'
    : ''

  return (
    <motion.div 
      className={`${baseStyles} ${bgStyles} ${borderStyles} ${shadowStyles} ${hoverClasses} ${className}`}
      whileHover={hoverable || interactive ? { 
        y: -4, 
        transition: { duration: 0.2 } 
      } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {/* Header */}
      {header && (
        <motion.div 
          className={`${contentPadding} border-b border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm`}
          initial={false}
        >
          {typeof header === 'string' ? (
            <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              {header}
            </h3>
          ) : (
            header
          )}
        </motion.div>
      )}

      {/* Content */}
      <div className={`${contentPadding}`}>
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <motion.div 
          className={`${contentPadding} border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-sm`}
          initial={false}
        >
          {typeof footer === 'string' ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{footer}</p>
          ) : (
            footer
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
