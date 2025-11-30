import { useTheme } from '../../context/ThemeContext'

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
  const { isDark } = useTheme()

  const bgStyles = isDark ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900 placeholder-gray-500'
  const borderStyles = error
    ? isDark
      ? 'border-2 border-red-500'
      : 'border-2 border-red-500'
    : isDark
      ? 'border border-gray-600 focus:border-primary'
      : 'border border-gray-300 focus:border-primary'
  const focusStyles = 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50'
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed' : ''

  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2 rounded-lg ${bgStyles} ${borderStyles} ${focusStyles} ${disabledStyles} transition ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
