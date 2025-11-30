// Authentication utilities
export const setToken = (token) => {
  localStorage.setItem('token', token)
}

export const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem('token', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

export const getToken = () => {
  return localStorage.getItem('token')
}

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken')
}

export const removeToken = () => {
  localStorage.removeItem('token')
}

export const removeTokens = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refreshToken')
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode token:', error)
    return null
  }
}

export const isTokenExpired = (token) => {
  if (!token) return true
  const decoded = decodeToken(token)
  if (!decoded || !decoded.exp) return true
  const expirationTime = decoded.exp * 1000 // Convert to milliseconds
  return Date.now() >= expirationTime
}

