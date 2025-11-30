import Notification from '../models/Notification.js'
import User from '../models/User.js'
import { sendEmail } from './emailService.js'

/**
 * Create and send a notification (Socket + DB + Email)
 * @param {Object} io - Socket.IO instance
 * @param {Object} params - Notification parameters
 * @param {string} params.recipientId - User ID to receive notification
 * @param {string} params.type - Type of notification
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message
 * @param {Object} [params.data] - Additional data
 * @param {string} [params.emailTemplate] - Email template name to trigger email
 * @param {Object} [params.emailData] - Specific data for email template
 */
export const sendNotification = async (io, { recipientId, type, title, message, data = {}, emailTemplate, emailData }) => {
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
    if (io) {
      io.to(`user:${recipientId}`).emit('notification', notification)
    }

    // 3. Send Email (Async)
    if (emailTemplate) {
      // Fetch user to get email and preferences
      const user = await User.findById(recipientId).select('email firstName preferences')
      
      if (user && user.preferences?.emailNotifications) {
        // Check specific email type preferences if implemented
        // For now, we assume if emailTemplate is passed, it's important enough or checked by caller
        
        // Merge data: emailData > data > user info
        const templateData = {
          name: user.firstName,
          ...data,
          ...emailData
        }

        // Send email without awaiting to not block response
        sendEmail(user.email, title, emailTemplate, templateData).catch(err => 
          console.error(`Failed to send email to ${user.email}:`, err)
        )
      }
    }

    return notification
  } catch (error) {
    console.error('Error sending notification:', error)
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
