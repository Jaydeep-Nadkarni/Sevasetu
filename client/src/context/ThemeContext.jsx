import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(undefined)

// Design System Constants
export const COLORS = {
  // Primary
  primary: '#3b82f6', // blue
  'primary-dark': '#1e40af',
  'primary-light': '#93c5fd',
  
  // Secondary
  secondary: '#10b981', // emerald
  'secondary-dark': '#047857',
  'secondary-light': '#6ee7b7',
  
  // Accents
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  info: '#06b6d4',
  
  // Neutral (light mode)
  white: '#ffffff',
  'gray-50': '#f9fafb',
  'gray-100': '#f3f4f6',
  'gray-200': '#e5e7eb',
  'gray-300': '#d1d5db',
  'gray-400': '#9ca3af',
  'gray-500': '#6b7280',
  'gray-600': '#4b5563',
  'gray-700': '#374151',
  'gray-800': '#1f2937',
  'gray-900': '#111827',
  
  // Neutral (dark mode)
  'dark-bg': '#0f172a',
  'dark-surface': '#1e293b',
  'dark-surface-2': '#334155',
}

export const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
}

export const TYPOGRAPHY = {
  // Font sizes
  'text-xs': '0.75rem',
  'text-sm': '0.875rem',
  'text-base': '1rem',
  'text-lg': '1.125rem',
  'text-xl': '1.25rem',
  'text-2xl': '1.5rem',
  'text-3xl': '1.875rem',
  'text-4xl': '2.25rem',
  
  // Font weights
  'font-light': 300,
  'font-normal': 400,
  'font-medium': 500,
  'font-semibold': 600,
  'font-bold': 700,
  
  // Line heights
  'leading-tight': 1.25,
  'leading-snug': 1.375,
  'leading-normal': 1.5,
  'leading-relaxed': 1.625,
  'leading-loose': 2,
}

export const SHADOWS = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
}

export const ANIMATIONS = {
  // Transitions
  'duration-75': 75,
  'duration-100': 100,
  'duration-150': 150,
  'duration-200': 200,
  'duration-300': 300,
  'duration-500': 500,
  
  // Easing functions
  'ease-linear': 'linear',
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
}

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage for saved preference
    const saved = localStorage.getItem('theme-mode')
    if (saved) {
      return saved === 'dark'
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('font-size')
    return saved || 'normal' // 'small' | 'normal' | 'large'
  })

  useEffect(() => {
    // Update localStorage
    localStorage.setItem('theme-mode', isDark ? 'dark' : 'light')
    localStorage.setItem('font-size', fontSize)

    // Update document class
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Update font size
    document.documentElement.style.fontSize = {
      small: '14px',
      normal: '16px',
      large: '18px',
    }[fontSize]
  }, [isDark, fontSize])

  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  const setFontSizePreference = (size) => {
    if (['small', 'normal', 'large'].includes(size)) {
      setFontSize(size)
    }
  }

  const value = {
    isDark,
    toggleTheme,
    fontSize,
    setFontSizePreference,
    // Design system exports
    colors: COLORS,
    spacing: SPACING,
    typography: TYPOGRAPHY,
    shadows: SHADOWS,
    animations: ANIMATIONS,
    breakpoints: BREAKPOINTS,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
