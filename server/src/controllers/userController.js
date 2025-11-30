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

/**
 * Get user's recent activity (donations, events, certificates, transactions)
 */
export const getUserActivity = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query
  const userId = req.user._id

  // Dynamically import models to avoid circular dependencies
  const { Donation, Event, Certificate, Transaction } = await import('../models/index.js')
  
  // Fetch different types of activities in parallel
  const [donations, events, certificates, transactions] = await Promise.all([
    // Recent donations made by user
    Donation.find({ donor: userId })
      .select('itemName ngo createdAt status')
      .populate('ngo', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    
    // Recent events attended/joined by user
    Event.find({ attendees: userId })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean(),
    
    // Recent certificates earned
    Certificate.find({ earnedBy: userId })
      .select('title createdAt')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    
    // Recent transactions/money donations
    Transaction.find({ user: userId })
      .select('amount ngo status createdAt')
      .populate('ngo', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
  ])

  // Transform and combine activities
  const activities = []

  // Add donations
  donations.forEach((donation) => {
    activities.push({
      _id: `donation-${donation._id}`,
      type: 'donation',
      description: `Donated ${donation.itemName || 'items'} to ${donation.ngo?.name || 'an NGO'}`,
      itemName: donation.itemName,
      ngoName: donation.ngo?.name,
      status: donation.status,
      createdAt: donation.createdAt,
    })
  })

  // Add events
  events.forEach((event) => {
    activities.push({
      _id: `event-${event._id}`,
      type: 'event_attended',
      description: `Attended event: ${event.title}`,
      eventName: event.title,
      createdAt: event.updatedAt,
    })
  })

  // Add certificates
  certificates.forEach((cert) => {
    activities.push({
      _id: `cert-${cert._id}`,
      type: 'certificate',
      description: `Earned certificate: ${cert.title}`,
      certificateName: cert.title,
      createdAt: cert.createdAt,
    })
  })

  // Add money donations/transactions
  transactions.forEach((transaction) => {
    activities.push({
      _id: `transaction-${transaction._id}`,
      type: 'money_donation',
      description: `Donated ₹${transaction.amount} to ${transaction.ngo?.name || 'an NGO'}`,
      amount: transaction.amount,
      ngoName: transaction.ngo?.name,
      status: transaction.status,
      createdAt: transaction.createdAt,
    })
  })

  // Sort by createdAt (newest first) and limit
  activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const limitedActivities = activities.slice(0, parseInt(limit))

  successResponse(
    res,
    { activities: limitedActivities },
    'User activities fetched successfully'
  )
})

