import { motion } from 'framer-motion'

export const Input = ({
  label,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const bgStyles = 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
  const borderStyles = error
    ? 'border-2 border-red-500'
    : 'border border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary'
  const focusStyles = 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 dark:focus:ring-opacity-50'
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : ''

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <motion.div
        initial={false}
        animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-2 rounded-lg ${bgStyles} ${borderStyles} ${focusStyles} ${disabledStyles} transition-colors duration-200 ${className}`}
          {...props}
        />
      </motion.div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
