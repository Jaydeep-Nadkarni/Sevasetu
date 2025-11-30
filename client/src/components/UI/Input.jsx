import { motion } from 'framer-motion'
import { useState } from 'react'

export const Input = ({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  required = false,
  hint,
  leftIcon: LeftIcon = null,
  rightIcon: RightIcon = null,
  floatingLabel = false,
  className = '',
  size = 'md',
  variant = 'default',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = value || isFocused

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg',
  }

  const variantStyles = {
    default: 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
    filled: 'bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
    flushed: 'bg-transparent border-b-2 rounded-none px-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
  }

  const borderStyles = error
    ? 'border-2 border-red-500 focus:border-red-600'
    : variant === 'flushed'
    ? `border-0 border-b-2 border-gray-300 dark:border-gray-600 focus:border-b-2 ${isFocused ? 'border-blue-500 dark:border-blue-400' : 'focus:border-blue-500 dark:focus:border-blue-400'}`
    : 'border border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900'

  const focusStyles = 'focus:outline-none transition-all duration-200'
  const disabledStyles = disabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''

  const handleFocus = (e) => {
    setIsFocused(true)
    onFocus?.(e)
  }

  const handleBlur = (e) => {
    setIsFocused(false)
    onBlur?.(e)
  }

  return (
    <div className="w-full">
      {label && !floatingLabel && (
        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <motion.div
        className="relative"
        initial={false}
        animate={error && !isFocused ? { x: [0, -8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {/* Floating Label */}
        {floatingLabel && label && (
          <motion.label
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 pointer-events-none font-medium origin-left"
            animate={hasValue ? { scale: 0.85, y: -24 } : { scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </motion.label>
        )}

        {/* Left Icon */}
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
            <LeftIcon className="w-5 h-5" aria-hidden="true" />
          </div>
        )}

        {/* Input */}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={`
            w-full ${sizeStyles[size]} rounded-lg
            ${variantStyles[variant]}
            ${borderStyles}
            ${focusStyles}
            ${disabledStyles}
            ${LeftIcon ? 'pl-10' : ''}
            ${RightIcon ? 'pr-10' : ''}
            transition-colors duration-200
            ${className}
          `}
          {...props}
        />

        {/* Right Icon */}
        {RightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
            <RightIcon className="w-5 h-5" aria-hidden="true" />
          </div>
        )}
      </motion.div>

      {/* Hint Text */}
      {hint && !error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-gray-500 dark:text-gray-400 mt-1.5"
        >
          {hint}
        </motion.p>
      )}

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 dark:text-red-400 mt-1.5 font-medium flex items-center gap-1"
        >
          <span>⚠️</span>
          {error}
        </motion.p>
      )}
    </div>
  )
}
