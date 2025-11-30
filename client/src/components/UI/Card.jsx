import { motion } from 'framer-motion'

export const Card = ({
  children,
  header,
  footer,
  className = '',
  hoverable = false,
  ...props
}) => {
  const baseStyles = 'rounded-lg overflow-hidden'
  const bgStyles = 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
  const borderStyles = 'border border-gray-200 dark:border-gray-700'
  const hoverStyles = hoverable ? 'cursor-pointer' : ''
  const shadowStyles = 'shadow-sm dark:shadow-none'

  return (
    <motion.div 
      className={`${baseStyles} ${bgStyles} ${borderStyles} ${shadowStyles} ${hoverStyles} ${className}`}
      whileHover={hoverable ? { y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {typeof header === 'string' ? <h3 className="text-lg font-semibold">{header}</h3> : header}
        </div>
      )}

      <div className="px-6 py-4">{children}</div>

      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          {typeof footer === 'string' ? <p className="text-sm text-gray-500 dark:text-gray-400">{footer}</p> : footer}
        </div>
      )}
    </motion.div>
  )
}
