import { useTheme } from '../../context/ThemeContext'

export const Card = ({
  children,
  header,
  footer,
  className = '',
  hoverable = false,
  ...props
}) => {
  const { isDark } = useTheme()

  const baseStyles = 'rounded-lg overflow-hidden'
  const bgStyles = isDark ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
  const borderStyles = isDark ? 'border border-gray-700' : 'border border-gray-200'
  const hoverStyles = hoverable ? 'hover:shadow-lg transition-shadow duration-300' : ''
  const shadowStyles = 'shadow'

  return (
    <div className={`${baseStyles} ${bgStyles} ${borderStyles} ${shadowStyles} ${hoverStyles} ${className}`} {...props}>
      {header && (
        <div className={`px-6 py-4 ${isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'}`}>
          {typeof header === 'string' ? <h3 className="text-lg font-semibold">{header}</h3> : header}
        </div>
      )}

      <div className="px-6 py-4">{children}</div>

      {footer && (
        <div className={`px-6 py-4 ${isDark ? 'border-t border-gray-700' : 'border-t border-gray-200'}`}>
          {typeof footer === 'string' ? <p className="text-sm">{footer}</p> : footer}
        </div>
      )}
    </div>
  )
}
