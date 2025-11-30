// Example Controller
import User from '../models/User.js'
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js'
import { LEVELS } from '../config/gamification.js'

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password')
  successResponse(res, users, 'Users fetched successfully')
})

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')

  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  successResponse(res, user, 'User fetched successfully')
})

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select('-password')

  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  successResponse(res, user, 'User updated successfully')
})

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id)

  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  successResponse(res, null, 'User deleted successfully')
})

export const getLeaderboard = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query
  const users = await User.find({ role: 'user' })
    .sort({ points: -1 })
    .limit(parseInt(limit))
    .select('firstName lastName avatar points level badges')
    .populate('badges', 'name icon')
  
  successResponse(res, users, 'Leaderboard fetched successfully')
})

export const getUserProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('points level badges volunteerHours')
    .populate('badges')
    
  if (!user) return errorResponse(res, 'User not found', 404)

  // Calculate next level progress
  const currentLevel = LEVELS.find(l => l.level === user.level) || LEVELS[0]
  const nextLevel = LEVELS.find(l => l.level === user.level + 1)
  
  let progress = 0
  let pointsToNext = 0
  
  if (nextLevel) {
    const pointsInLevel = nextLevel.minPoints - currentLevel.minPoints
    const userPointsInLevel = user.points - currentLevel.minPoints
    progress = Math.min(100, Math.max(0, (userPointsInLevel / pointsInLevel) * 100))
    pointsToNext = nextLevel.minPoints - user.points
  } else {
    progress = 100 // Max level
  }

  successResponse(res, {
    ...user.toObject(),
    currentLevelName: currentLevel.name,
    nextLevel,
    progress,
    pointsToNext
  }, 'User progress fetched')
})
