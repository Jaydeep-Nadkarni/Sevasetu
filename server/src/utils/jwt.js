import jwt from 'jsonwebtoken'
import config from '../config/config.js'

export const generateToken = (id, expiresIn = config.jwtExpire) => {
  return jwt.sign({ id }, config.jwtSecret, { expiresIn })
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
