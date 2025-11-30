import jwt from 'jsonwebtoken'
import config from '../config/config.js'

export const generateToken = (user, expiresIn = config.jwtExpire) => {
  const payload = {
    id: user._id,
    role: user.role,
    email: user.email,
  }
  return jwt.sign(payload, config.jwtSecret, { expiresIn })
}

export const generateRefreshToken = (user, expiresIn = '30d') => {
  const payload = {
    id: user._id,
    type: 'refresh',
  }
  return jwt.sign(payload, config.jwtSecret, { expiresIn })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret)
  } catch (error) {
    return null
  }
}

export const decodeToken = (token) => {
  return jwt.decode(token)
}
