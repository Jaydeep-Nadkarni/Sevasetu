import QRAttendance from '../models/QRAttendance.js'
import Event from '../models/Event.js'
import User from '../models/User.js'
import { addPoints, calculateDonationPoints } from '../utils/pointsSystem.js'
import { sendNotification } from '../services/notificationService.js'

// === MARK ATTENDANCE ===
export const markAttendance = async (req, res) => {
  try {
    const { qrData, eventId } = req.body
    const scannedBy = req.user._id
    const userRole = req.user.role

    // 1. Validate Event and Authorization
    const event = await Event.findById(eventId)
    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Only creator or admin can scan
    const isCreator = event.createdBy.toString() === scannedBy.toString()
    const isAdmin = userRole === 'admin' || userRole === 'ngo_admin' // Allow any NGO admin to scan for now, or restrict to owner

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to scan QR codes for this event' })
    }

    // 2. Find QR Record
    const qrRecord = await QRAttendance.findOne({ qrCode: qrData, event: eventId })
    if (!qrRecord) {
      return res.status(404).json({ message: 'Invalid QR code for this event' })
    }

    // 3. Duplicate Scan Prevention
    if (qrRecord.status === 'checked_in' || qrRecord.status === 'verified') {
      // Already scanned
      await qrRecord.populate('participant', 'name email profilePicture')
      return res.status(200).json({
        message: 'Already checked in',
        alreadyScanned: true,
        qrRecord,
        participant: qrRecord.participant,
      })
    }

    // 4. Update QR Record
    qrRecord.status = 'checked_in'
    qrRecord.checkInTime = new Date()
    qrRecord.verifiedBy = scannedBy
    qrRecord.isVerified = true
    await qrRecord.save()

    // 5. Update Event Registration
    const registration = event.registered.find(
      reg => reg.qrCode && reg.qrCode.toString() === qrRecord._id.toString()
    )
    if (registration) {
      registration.status = 'attended'
    }
    await event.save()

    // 6. Update User Points & Level
    const user = await User.findById(qrRecord.participant)
    let pointsResult = { pointsAdded: 0, levelUp: false, newLevel: user?.level }

    if (user) {
      // Calculate points
      const points = calculateDonationPoints('event')
      
      // Add points and handle progression
      pointsResult = await addPoints(user._id, points, 'event')
      
      // Update volunteer hours
      user.volunteerHours = (user.volunteerHours || 0) + (event.duration || 0)
      await user.save()
    }

    // 7. Send Notifications (Async)
    if (user) {
      const io = req.app.get('io')
      
      // Send Attendance Confirmation
      await sendNotification(io, {
        recipientId: user._id,
        type: 'event_update',
        title: 'Attendance Confirmed',
        message: `Thanks for attending ${event.title}! You earned ${pointsResult.pointsAdded} points.`,
        data: {
          eventId: event._id,
          pointsEarned: pointsResult.pointsAdded,
          levelUp: pointsResult.levelUp
        },
        emailTemplate: 'attendance_confirmation',
        emailData: {
          eventName: event.title,
          eventDate: new Date(event.eventDate).toLocaleDateString(),
          pointsEarned: pointsResult.pointsAdded,
          totalPoints: pointsResult.totalPoints
        }
      })

      // Send Certificate Email if earned
      if (pointsResult.newCertificate) {
        await sendNotification(io, {
          recipientId: user._id,
          type: 'certificate_earned',
          title: 'New Certificate Earned!',
          message: `Congratulations! You've earned a new certificate: ${pointsResult.newCertificate.title}`,
          data: {
            certificateId: pointsResult.newCertificate._id,
            certificateUrl: pointsResult.newCertificate.certificateUrl
          },
          emailTemplate: 'certificate_issued',
          emailData: {
            recipientName: user.firstName,
            certificateTitle: pointsResult.newCertificate.title,
            issueDate: new Date().toLocaleDateString(),
            certificateUrl: pointsResult.newCertificate.certificateUrl || '#'
          }
        })
      }
    }

    // 8. Emit Socket Event
    const io = req.app.get('io')
    if (io) {
      io.to(`event:${eventId}`).emit('attendance:update', {
        message: `Attendance marked for ${user ? user.name : 'User'}`,
        participantId: user._id,
        status: 'checked_in',
        pointsEarned: pointsResult.pointsAdded,
        levelUp: pointsResult.levelUp
      })
    }

    // Return success
    res.json({
      message: 'Attendance marked successfully',
      pointsEarned: pointsResult.pointsAdded,
      levelUp: pointsResult.levelUp,
      newLevel: pointsResult.newLevel,
      participant: {
        _id: user._id,
        name: user.name || `${user.firstName} ${user.lastName}`,
        email: user.email,
        profilePicture: user.profilePicture || user.avatar,
      },
    })

  } catch (error) {
    console.error('Error marking attendance:', error)
    res.status(500).json({ message: error.message })
  }
}

// === GET ATTENDANCE HISTORY ===
export const getAttendanceHistory = async (req, res) => {
  try {
    const userId = req.user._id
    const userRole = req.user.role
    const { type } = req.query // 'user' or 'organizer'

    let query = {}

    if (type === 'organizer' && (userRole === 'ngo_admin' || userRole === 'admin')) {
      // Get attendance for events created by this user/NGO
      // First find events created by user
      const events = await Event.find({ createdBy: userId }).select('_id')
      const eventIds = events.map(e => e._id)
      
      query = { event: { $in: eventIds }, status: 'checked_in' }
    } else {
      // Default: Get attendance for the user themselves
      query = { participant: userId, status: 'checked_in' }
    }

    const history = await QRAttendance.find(query)
      .populate('event', 'title eventDate location images')
      .populate('participant', 'name email avatar')
      .sort({ checkInTime: -1 })

    res.json({ history })

  } catch (error) {
    console.error('Error fetching attendance history:', error)
    res.status(500).json({ message: error.message })
  }
}

// === VERIFY QR (Read-only check) ===
export const verifyQR = async (req, res) => {
  try {
    const { qrData } = req.body
    
    const qrRecord = await QRAttendance.findOne({ qrCode: qrData })
      .populate('participant', 'name email avatar level points')
      .populate('event', 'title eventDate')

    if (!qrRecord) {
      return res.status(404).json({ valid: false, message: 'Invalid QR Code' })
    }

    res.json({
      valid: true,
      qrRecord,
      participant: qrRecord.participant,
      event: qrRecord.event,
      status: qrRecord.status
    })

  } catch (error) {
    console.error('Error verifying QR:', error)
    res.status(500).json({ message: error.message })
  }
}
