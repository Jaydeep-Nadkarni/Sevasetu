import { motion } from 'framer-motion'

const buttonVariants = {
  // Solid variants
  primary: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl dark:shadow-blue-900/30',
  secondary: 'bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl dark:shadow-emerald-900/30',
  danger: 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl dark:shadow-red-900/30',
  warning: 'bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg hover:shadow-xl dark:shadow-amber-900/30',
  success: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl dark:shadow-green-900/30',
  
  // Outline variants
  outline: 'border-2 border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10',
  'outline-danger': 'border-2 border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10',
  'outline-secondary': 'border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
  
  // Ghost variants
  ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
  'ghost-danger': 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10',
  'ghost-secondary': 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
  
  // Soft variants
  soft: 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/20',
  'soft-danger': 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-500/20',
  'soft-secondary': 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20',
}

const buttonSizes = {
  xs: 'px-2 py-1 text-xs rounded-md',
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-6 py-3 text-lg rounded-xl',
  xl: 'px-8 py-4 text-lg rounded-xl',
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  type = 'button',
  className = '',
  icon: Icon = null,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}) => {
  const baseStyles = `
    relative inline-flex items-center justify-center gap-2 font-semibold
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    dark:focus:ring-offset-gray-900 dark:focus:ring-blue-400
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
  `.trim()
  
  const variantStyles = buttonVariants[variant] || buttonVariants.primary
  const sizeStyles = buttonSizes[size] || buttonSizes.md
  const widthStyles = fullWidth ? 'w-full' : ''
  const disabledStyles = disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''

  const iconElement = Icon ? (
    <Icon className="w-4 h-4" aria-hidden="true" />
  ) : null

  return (
    <motion.button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${widthStyles} ${disabledStyles} ${className}`}
      whileHover={!disabled && !isLoading ? { scale: 1.02, translateY: -2 } : {}}
      whileTap={!disabled && !isLoading ? { scale: 0.98, translateY: 0 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {isLoading && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full opacity-60" />
        </motion.div>
      )}
      <span className={isLoading ? 'invisible' : 'visible'}>
        {iconPosition === 'left' && iconElement}
        {children}
        {iconPosition === 'right' && iconElement}
      </span>
    </motion.button>
  )
}
