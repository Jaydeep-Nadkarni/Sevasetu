/**
 * SOCKET.IO INTEGRATION GUIDE FOR CONTROLLERS
 * 
 * This guide shows how to integrate Socket.IO emitters in your controllers
 * to ensure real-time updates across all connected clients.
 */

// ============================================
// INSTALLATION INSTRUCTION
// ============================================

/**
 * 1. Import the socket emitter utilities at the top of each controller file:
 * 
 * import {
 *   getIO,
 *   emitEventCreated,
 *   emitEventUpdated,
 *   emitEventDeleted,
 *   // ... add other emitters as needed
 * } from '../utils/socketEmitter.js'
 */

// ============================================
// EVENT CONTROLLER INTEGRATION EXAMPLES
// ============================================

/**
 * Example: In createEvent controller (eventController.js)
 * 
 * After saving the event, add this before the response:
 * 
 *   const event = await Event.create(eventData)
 *   
 *   // Emit socket event for real-time update
 *   const io = getIO(req)
 *   emitEventCreated(io, event)
 *   
 *   res.status(201).json({ success: true, event })
 */

/**
 * Example: In updateEvent controller
 * 
 * After updating the event, add this before the response:
 * 
 *   const event = await Event.findByIdAndUpdate(eventId, updateData, { new: true })
 *   
 *   // Emit socket event for real-time update
 *   const io = getIO(req)
 *   emitEventUpdated(io, event)
 *   
 *   res.json({ success: true, event })
 */

/**
 * Example: In deleteEvent controller
 * 
 * After deleting the event, add this before the response:
 * 
 *   await Event.findByIdAndDelete(eventId)
 *   
 *   // Emit socket event for real-time update
 *   const io = getIO(req)
 *   emitEventDeleted(io, eventId)
 *   
 *   res.json({ success: true, message: 'Event deleted' })
 */

/**
 * Example: In joinEvent controller
 * 
 * After user joins event, add this:
 * 
 *   const event = await Event.findByIdAndUpdate(
 *     eventId,
 *     { $push: { registeredUsers: userId } },
 *     { new: true }
 *   )
 *   
 *   // Emit socket event
 *   const io = getIO(req)
 *   emitEventJoined(io, req.user._id, eventId, {
 *     registeredCount: event.registeredCount,
 *     capacity: event.capacity
 *   })
 *   
 *   res.json({ success: true, event })
 */

/**
 * Example: In attendEvent controller (mark attendance)
 * 
 *   const attendance = await Attendance.create({ userId, eventId })
 *   
 *   // Emit socket event
 *   const io = getIO(req)
 *   emitEventAttended(io, req.user._id, eventId)
 *   
 *   res.json({ success: true, attendance })
 */

// ============================================
// DONATION CONTROLLER INTEGRATION EXAMPLES
// ============================================

/**
 * Example: In createItemDonation controller
 * 
 * After creating donation:
 * 
 *   const donation = await ItemDonation.create(donationData)
 *   
 *   // Emit socket event
 *   const io = getIO(req)
 *   emitDonationCreated(io, donation)
 *   
 *   res.status(201).json({ success: true, donation })
 */

/**
 * Example: In updateDonation controller
 * 
 * After updating donation:
 * 
 *   const donation = await ItemDonation.findByIdAndUpdate(
 *     donationId,
 *     updateData,
 *     { new: true }
 *   )
 *   
 *   // Emit socket event
 *   const io = getIO(req)
 *   emitDonationUpdated(io, donation)
 *   
 *   res.json({ success: true, donation })
 */

/**
 * Example: In acceptDonation controller (NGO accepting donation)
 * 
 * After NGO accepts donation:
 * 
 *   const donation = await ItemDonation.findByIdAndUpdate(
 *     donationId,
 *     { $push: { 'assignedNGOs': { ngo: ngoId, status: 'accepted' } } },
 *     { new: true }
 *   )
 *   
 *   // Emit socket events
 *   const io = getIO(req)
 *   emitDonationAccepted(io, donation, req.user.ngo)
 *   
 *   res.json({ success: true, donation })
 */

/**
 * Example: In cancelDonation controller
 * 
 * After cancelling donation:
 * 
 *   await ItemDonation.findByIdAndUpdate(donationId, { status: 'cancelled' })
 *   
 *   // Emit socket event
 *   const io = getIO(req)
 *   emitDonationCancelled(io, donationId, reason)
 *   
 *   res.json({ success: true, message: 'Donation cancelled' })
 */

// ============================================
// HELP REQUEST CONTROLLER INTEGRATION EXAMPLES
// ============================================

/**
 * Example: In createHelpRequest controller
 * 
 * After creating help request:
 * 
 *   const helpRequest = await HelpRequest.create(helpRequestData)
 *   
 *   // Emit socket event
 *   const io = getIO(req)
 *   emitHelpRequestCreated(io, helpRequest)
 *   
 *   res.status(201).json({ success: true, helpRequest })
 */

/**
 * Example: In updateHelpRequest controller
 * 
 * After updating help request:
 * 
 *   const helpRequest = await HelpRequest.findByIdAndUpdate(
 *     helpRequestId,
 *     updateData,
 *     { new: true }
 *   )
 *   
 *   // Emit socket event
 *   const io = getIO(req)
 *   emitHelpRequestUpdated(io, helpRequest)
 *   
 *   res.json({ success: true, helpRequest })
 */

/**
 * Example: In deleteHelpRequest controller
 * 
 * After deleting help request:
 * 
 *   await HelpRequest.findByIdAndDelete(helpRequestId)
 *   
 *   // Emit socket event
 *   const io = getIO(req)
 *   emitHelpRequestDeleted(io, helpRequestId)
 *   
 *   res.json({ success: true, message: 'Help request deleted' })
 */

// ============================================
// CERTIFICATE CONTROLLER INTEGRATION EXAMPLES
// ============================================

/**
 * Example: In certificate earning trigger (could be in userController or a dedicated service)
 * 
 * When user earns a certificate:
 * 
 *   const certificate = await Certificate.create({
 *     user: userId,
 *     title: 'Event Attendee',
 *     ...certificateData
 *   })
 *   
 *   // Emit socket event to the user
 *   const io = getIO(req)
 *   emitCertificateEarned(io, userId, certificate)
 *   
 *   // Update user profile if needed
 *   await User.findByIdAndUpdate(userId, { $push: { certificates: certificate._id } })
 */

// ============================================
// GAMIFICATION CONTROLLER INTEGRATION EXAMPLES
// ============================================

/**
 * Example: When points are awarded (in pointsService or userController)
 * 
 * After calculating and saving points:
 * 
 *   const userStats = await addPoints(userId, pointsEarned, 'donation')
 *   
 *   // Emit socket event to user
 *   const io = getIO(req)
 *   emitPointsEarned(io, userId, {
 *     pointsEarned,
 *     totalPoints: userStats.totalPoints,
 *     level: userStats.currentLevel,
 *     newLevel: userStats.leveledUp ? userStats.newLevel : null,
 *     levelUp: userStats.leveledUp,
 *     source: 'donation' // or 'event', 'help', 'volunteer', etc.
 *   })
 */

/**
 * Example: When a badge is earned
 * 
 * After creating/awarding a badge:
 * 
 *   const badge = await Badge.findById(badgeId)
 *   await User.findByIdAndUpdate(userId, { $push: { badges: badge._id } })
 *   
 *   // Emit socket event
 *   const io = getIO(req)
 *   emitBadgeEarned(io, userId, badge)
 */

// ============================================
// NOTIFICATION INTEGRATION EXAMPLES
// ============================================

/**
 * Example: When sending any notification
 * 
 * After creating notification:
 * 
 *   const notification = await Notification.create({
 *     recipient: userId,
 *     message: 'Your donation was accepted!',
 *     ...notificationData
 *   })
 *   
 *   // Emit socket event
 *   const io = getIO(req)
 *   emitNotification(io, userId, notification)
 */

// ============================================
// SUMMARY: CHECKLIST FOR INTEGRATION
// ============================================

/**
 * For each controller that modifies data:
 * 
 * ✓ Import required emitter functions at the top
 * ✓ After successful create/update/delete operation:
 *   - Get IO instance: const io = getIO(req)
 *   - Call appropriate emit function: emitEventCreated(io, event)
 * ✓ Make sure to emit AFTER the database operation succeeds
 * ✓ Include all necessary data in the emitted event
 * ✓ Use broadcastEvent() for updates everyone should see
 * ✓ Use emitToUser() for personal updates
 * 
 * Controllers to update:
 * - eventController.js: create, update, delete, join, attend
 * - donationController.js: create, update, accept, cancel
 * - helpRequestController.js: create, update, delete
 * - certificateController.js: issueCertificate or wherever certs are created
 * - userController.js: addPoints, earnBadge functions
 * - attendanceController.js: mark attendance (emit event attended)
 * - notificationController.js: send notifications
 */

export const SOCKET_EVENTS = {
  // Events
  EVENT_CREATED: 'event:created',
  EVENT_UPDATED: 'event:updated',
  EVENT_DELETED: 'event:deleted',
  EVENT_JOINED: 'event:joined',
  EVENT_ATTENDED: 'event:attended',
  
  // Donations
  DONATION_CREATED: 'donation:created',
  DONATION_UPDATED: 'donation:updated',
  DONATION_ACCEPTED: 'donation:accepted',
  DONATION_CANCELLED: 'donation:cancelled',
  
  // Help Requests
  HELP_CREATED: 'help-request:created',
  HELP_UPDATED: 'help-request:updated',
  HELP_DELETED: 'help-request:deleted',
  
  // Certificates & Gamification
  CERTIFICATE_EARNED: 'certificate:earned',
  POINTS_EARNED: 'points:earned',
  BADGE_EARNED: 'badge:earned',
  LEADERBOARD_UPDATED: 'leaderboard:updated',
  
  // Notifications & Activity
  NOTIFICATION: 'notification',
  ACTIVITY_RECORDED: 'activity:new',
};
