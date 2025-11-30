import express from 'express'
import {
  registerUser,
  registerNGO,
  login,
  verifyToken,
  refreshAccessToken,
  logout,
  getCurrentUser,
} from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import {
  validateUserRegistration,
  validateNGORegistration,
  validateLogin,
  handleValidationErrors,
} from '../middleware/validation.js'

const router = express.Router()

/**
 * POST /api/auth/register/user
 * Register a new user (user or admin role)
 */
router.post('/register/user', validateUserRegistration, handleValidationErrors, registerUser)

/**
 * POST /api/auth/register/ngo
 * Register a new NGO with its admin user
 */
router.post('/register/ngo', validateNGORegistration, handleValidationErrors, registerNGO)

/**
 * POST /api/auth/login
 * Login user with email and password
 */
router.post('/login', validateLogin, handleValidationErrors, login)

/**
 * POST /api/auth/verify-token
 * Verify JWT token validity
 */
router.post('/verify-token', authenticate, verifyToken)

/**
 * POST /api/auth/refresh-token
 * Refresh access token using refresh token
 */
router.post('/refresh-token', refreshAccessToken)

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authenticate, logout)

/**
 * GET /api/auth/me
 * Get current authenticated user details
 */
router.get('/me', authenticate, getCurrentUser)

export default router
