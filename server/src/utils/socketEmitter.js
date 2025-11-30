/**
 * Socket.IO Emitter Utility
 * Centralized place to emit socket events from controllers
 */

/**
 * Get Socket.IO instance from Express app
 */
export const getIO = (req) => {
  return req.app.get('io');
};

/**
 * Emit event to specific user's room
 * @param {Object} io - Socket.IO instance
 * @param {string} userId - User ID to emit to
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const emitToUser = (io, userId, event, data) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, data);
};

/**
 * Emit event to specific NGO's room
 * @param {Object} io - Socket.IO instance
 * @param {string} ngoId - NGO ID to emit to
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const emitToNGO = (io, ngoId, event, data) => {
  if (!io) return;
  io.to(`ngo:${ngoId}`).emit(event, data);
};

/**
 * Broadcast event to all connected clients
 * @param {Object} io - Socket.IO instance
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const broadcastEvent = (io, event, data) => {
  if (!io) return;
  io.emit(event, data);
};

/**
 * Emit event to specific users
 * @param {Object} io - Socket.IO instance
 * @param {string[]} userIds - Array of user IDs
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const emitToUsers = (io, userIds, event, data) => {
  if (!io || !userIds) return;
  userIds.forEach(userId => {
    emitToUser(io, userId, event, data);
  });
};

/**
 * Emit event to specific NGOs
 * @param {Object} io - Socket.IO instance
 * @param {string[]} ngoIds - Array of NGO IDs
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
export const emitToNGOs = (io, ngoIds, event, data) => {
  if (!io || !ngoIds) return;
  ngoIds.forEach(ngoId => {
    emitToNGO(io, ngoId, event, data);
  });
};

// ============================================
// EVENT SOCKET EMITTERS
// ============================================

/**
 * Emit when a new event is created
 */
export const emitEventCreated = (io, event) => {
  broadcastEvent(io, 'event:created', {
    _id: event._id,
    title: event.title,
    category: event.category,
    eventDate: event.eventDate,
    city: event.city,
    status: event.status,
  });
};

/**
 * Emit when an event is updated
 */
export const emitEventUpdated = (io, event) => {
  broadcastEvent(io, 'event:updated', {
    _id: event._id,
    title: event.title,
    category: event.category,
    eventDate: event.eventDate,
    status: event.status,
  });
};

/**
 * Emit when an event is deleted
 */
export const emitEventDeleted = (io, eventId) => {
  broadcastEvent(io, 'event:deleted', eventId);
};

/**
 * Emit when a user joins an event
 */
export const emitEventJoined = (io, userId, eventId, eventData) => {
  broadcastEvent(io, 'event:joined', {
    userId,
    eventId,
    registeredCount: eventData.registeredCount,
    capacity: eventData.capacity,
  });
};

/**
 * Emit when a user attends an event
 */
export const emitEventAttended = (io, userId, eventId) => {
  broadcastEvent(io, 'event:attended', {
    userId,
    eventId,
  });
};

// ============================================
// DONATION SOCKET EMITTERS
// ============================================

/**
 * Emit when a new donation is created
 */
export const emitDonationCreated = (io, donation) => {
  broadcastEvent(io, 'donation:created', {
    _id: donation._id,
    items: donation.items,
    location: donation.location,
    status: donation.status,
    donor: donation.donor,
  });
};

/**
 * Emit when a donation is updated
 */
export const emitDonationUpdated = (io, donation) => {
  broadcastEvent(io, 'donation:updated', {
    _id: donation._id,
    status: donation.status,
    assignedNGOs: donation.assignedNGOs,
  });
};

/**
 * Emit when a donation is accepted by an NGO
 */
export const emitDonationAccepted = (io, donation, ngoId) => {
  // Notify donor
  emitToUser(io, donation.donor.toString(), 'donation:accepted', {
    _id: donation._id,
    ngoId,
    status: 'accepted',
  });
  
  // Broadcast to all
  broadcastEvent(io, 'donation:accepted', {
    donationId: donation._id,
    ngoId,
  });
};

/**
 * Emit when a donation is cancelled
 */
export const emitDonationCancelled = (io, donationId, reason) => {
  broadcastEvent(io, 'donation:cancelled', {
    donationId,
    reason,
  });
};

// ============================================
// HELP REQUEST SOCKET EMITTERS
// ============================================

/**
 * Emit when a new help request is created
 */
export const emitHelpRequestCreated = (io, helpRequest) => {
  broadcastEvent(io, 'help-request:created', {
    _id: helpRequest._id,
    title: helpRequest.title,
    category: helpRequest.category,
    urgency: helpRequest.urgency,
    location: helpRequest.location,
    status: helpRequest.status,
  });
};

/**
 * Emit when a help request is updated
 */
export const emitHelpRequestUpdated = (io, helpRequest) => {
  broadcastEvent(io, 'help-request:updated', {
    _id: helpRequest._id,
    status: helpRequest.status,
    updatedAt: helpRequest.updatedAt,
  });
};

/**
 * Emit when a help request is deleted
 */
export const emitHelpRequestDeleted = (io, helpRequestId) => {
  broadcastEvent(io, 'help-request:deleted', helpRequestId);
};

// ============================================
// CERTIFICATE SOCKET EMITTERS
// ============================================

/**
 * Emit when a user earns a certificate
 */
export const emitCertificateEarned = (io, userId, certificate) => {
  emitToUser(io, userId, 'certificate:earned', {
    _id: certificate._id,
    title: certificate.title,
    certificateNumber: certificate.certificateNumber,
    issueDate: certificate.issueDate,
  });
  
  // Also broadcast for leaderboard updates
  broadcastEvent(io, 'leaderboard:updated');
};

// ============================================
// GAMIFICATION SOCKET EMITTERS
// ============================================

/**
 * Emit when a user earns points
 */
export const emitPointsEarned = (io, userId, data) => {
  emitToUser(io, userId, 'points:earned', {
    userId,
    pointsEarned: data.pointsEarned,
    totalPoints: data.totalPoints,
    level: data.level,
    newLevel: data.newLevel,
    levelUp: data.levelUp,
    source: data.source, // 'donation', 'event', 'help', 'volunteer', etc.
  });
  
  // Broadcast for leaderboard update
  if (data.levelUp) {
    broadcastEvent(io, 'leaderboard:updated');
  }
};

/**
 * Emit when a user earns a badge
 */
export const emitBadgeEarned = (io, userId, badge) => {
  emitToUser(io, userId, 'badge:earned', {
    _id: badge._id,
    name: badge.name,
    icon: badge.icon,
    category: badge.category,
    description: badge.description,
  });
};

// ============================================
// NOTIFICATION SOCKET EMITTERS
// ============================================

/**
 * Emit general notification
 */
export const emitNotification = (io, userId, notification) => {
  emitToUser(io, userId, 'notification', {
    _id: notification._id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  });
};

/**
 * Emit when activity is recorded
 */
export const emitActivityRecorded = (io, activity) => {
  broadcastEvent(io, 'activity:new', {
    userId: activity.userId,
    type: activity.type,
    description: activity.description,
    timestamp: activity.timestamp,
  });
};

// ============================================
// HELPER EXPORTS
// ============================================

export default {
  getIO,
  emitToUser,
  emitToNGO,
  broadcastEvent,
  emitToUsers,
  emitToNGOs,
  // Events
  emitEventCreated,
  emitEventUpdated,
  emitEventDeleted,
  emitEventJoined,
  emitEventAttended,
  // Donations
  emitDonationCreated,
  emitDonationUpdated,
  emitDonationAccepted,
  emitDonationCancelled,
  // Help Requests
  emitHelpRequestCreated,
  emitHelpRequestUpdated,
  emitHelpRequestDeleted,
  // Certificates
  emitCertificateEarned,
  // Gamification
  emitPointsEarned,
  emitBadgeEarned,
  // Notifications
  emitNotification,
  emitActivityRecorded,
};
