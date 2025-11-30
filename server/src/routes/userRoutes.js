// Example Route
import express from 'express'
import { getUsers, getUserById, updateUser, deleteUser, getLeaderboard, getUserProgress, getUserActivity } from '../controllers/userController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Leaderboard & Progress
router.get('/leaderboard', getLeaderboard)
router.get('/progress', authenticate, getUserProgress)

// Recent Activity
router.get('/activity', authenticate, getUserActivity)

// Get all users (admin only)
router.get('/', authenticate, authorize('admin'), getUsers)

// Get user by ID
router.get('/:id', authenticate, getUserById)

// Update user
router.put('/:id', authenticate, updateUser)

// Delete user (admin only)
router.delete('/:id', authenticate, authorize('admin'), deleteUser)

export default router
