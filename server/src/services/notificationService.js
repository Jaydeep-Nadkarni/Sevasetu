import Notification from '../models/Notification.js'

/**
 * Create and send a notification
 * @param {Object} io - Socket.IO instance
 * @param {Object} params - Notification parameters
 * @param {string} params.recipientId - User ID to receive notification
 * @param {string} params.type - Type of notification
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {Object} [params.data] - Additional data
 */
export const sendNotification = async (io, { recipientId, type, title, message, data = {} }) => {
  try {
    // 1. Save to Database
    const notification = await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      data,
    })

    // 2. Emit via Socket.IO
    // We emit to the room `user:{userId}` which the client joins upon connection
    if (io) {
      io.to(`user:${recipientId}`).emit('notification', notification)
    }

    return notification
  } catch (error) {
    console.error('Error sending notification:', error)
    // We don't throw here to prevent blocking the main flow if notification fails
    return null
  }
}

/**
 * Send a broadcast notification to all users (or a specific group if needed)
 * @param {Object} io - Socket.IO instance
 * @param {Object} params - Notification parameters
 */
export const sendBroadcastNotification = async (io, { title, message, data = {} }) => {
    // This is a simplified version. For a real app, you might want to batch insert into DB
    // or only store "system" notifications that are fetched on load.
    // For now, we'll just emit to all connected clients.
    
    if (io) {
        io.emit('notification', {
            type: 'general',
            title,
            message,
            data,
            createdAt: new Date(),
            isRead: false // Virtual status for broadcast
        })
    }
}
