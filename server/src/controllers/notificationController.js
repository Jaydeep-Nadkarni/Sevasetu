import Notification from '../models/Notification.js'
import { asyncHandler, successResponse } from '../utils/helpers.js'

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit

  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)

  const total = await Notification.countDocuments({ recipient: req.user._id })
  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false })

  successResponse(res, {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
    unreadCount
  }, 'Notifications fetched successfully')
})

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  )

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' })
  }

  successResponse(res, notification, 'Notification marked as read')
})

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true }
  )

  successResponse(res, null, 'All notifications marked as read')
})
