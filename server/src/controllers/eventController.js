import Event from '../models/Event.js'
import QRAttendance from '../models/QRAttendance.js'
import NGO from '../models/NGO.js'
import cloudinary from '../config/cloudinary.js'
import QRCode from 'qrcode'
import { sendNotification } from '../services/notificationService.js'
import { addPoints, calculateDonationPoints } from '../utils/pointsSystem.js'

// === CREATE EVENT ===
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      eventDate,
      eventTime,
      duration,
      location,
      city,
      state,
      zipcode,
      capacity,
      isVirtual,
      meetingLink,
      tags,
      entryFee,
      requirements,
      contactPersonName,
      contactPersonPhone,
      contactPersonEmail,
      coordinates,
    } = req.body

    const userId = req.user._id
    const userRole = req.user.role

    // Determine creator type and get organizer info
    let creatorType = 'individual'
    let ngo = null

    if (userRole === 'ngo_admin') {
      creatorType = 'ngo'
      // Get NGO associated with user
      const ngoData = await NGO.findOne({ admin: userId })
      if (!ngoData) {
        return res.status(400).json({ message: 'NGO not found for this admin' })
      }
      ngo = ngoData._id
    }

    // Upload banner image if provided
    let bannerUrl = null
    let bannerPublicId = null
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'events/banners',
        resource_type: 'auto',
      })
      bannerUrl = result.secure_url
      bannerPublicId = result.public_id
    }

    // Create event
    const eventData = {
      title,
      description,
      category,
      eventDate,
      eventTime,
      duration: parseInt(duration),
      location,
      city,
      state,
      zipcode,
      capacity: parseInt(capacity),
      createdBy: userId,
      creatorType,
      ngo: creatorType === 'ngo' ? ngo : null,
      isVirtual: isVirtual === 'true',
      meetingLink: isVirtual === 'true' ? meetingLink : null,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      entryFee: entryFee ? parseFloat(entryFee) : 0,
      requirements: requirements ? (Array.isArray(requirements) ? requirements : [requirements]) : [],
      contactPerson: {
        name: contactPersonName,
        phone: contactPersonPhone,
        email: contactPersonEmail,
      },
      status: creatorType === 'ngo' ? 'approved' : 'pending_approval',
    }

    // Add coordinates if provided
    if (coordinates && coordinates.lat && coordinates.lng) {
      eventData.coordinates = {
        type: 'Point',
        coordinates: [parseFloat(coordinates.lng), parseFloat(coordinates.lat)],
      }
    }

    // Add banner image
    if (bannerUrl) {
      eventData.images = [
        {
          url: bannerUrl,
          publicId: bannerPublicId,
        },
      ]
    }

    const event = new Event(eventData)
    await event.save()

    // Populate references
    await event.populate('createdBy', 'name email profilePicture')
    if (event.ngo) {
      await event.populate('ngo', 'name logo')
    }

    // Emit Socket.IO notification
    const io = req.app.get('io')
    if (io) {
      if (creatorType === 'ngo') {
        // Notify admin about new NGO event
        io.to(`ngo:${ngo}`).emit('event:created', {
          message: `New event created: ${title}`,
          event,
        })
      } else {
        // Notify admins about pending individual event
        io.to('admin').emit('event:pending_approval', {
          message: `New event pending approval: ${title}`,
          event,
        })
      }
    }

    res.status(201).json({
      message: `Event created successfully${creatorType === 'individual' ? ' (pending admin approval)' : ''}`,
      event,
    })
  } catch (error) {
    console.error('Error creating event:', error)
    res.status(500).json({ message: error.message })
  }
}

// === LIST EVENTS WITH FILTERS ===
export const listEvents = async (req, res) => {
  try {
    const { category, city, status, startDate, endDate, search, lat, lng, radius, page = 1, limit = 10 } = req.query

    let filter = {}

    // Status filter - show approved/ongoing events publicly, pending only to admins
    if (req.user && req.user.role === 'admin') {
      filter.status = { $in: ['approved', 'pending_approval', 'ongoing', 'completed'] }
    } else {
      filter.status = { $in: ['approved', 'ongoing', 'completed'] }
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category
    }

    // City filter
    if (city) {
      filter.city = new RegExp(city, 'i')
    }

    // Date range filter
    if (startDate || endDate) {
      filter.eventDate = {}
      if (startDate) {
        filter.eventDate.$gte = new Date(startDate)
      }
      if (endDate) {
        filter.eventDate.$lte = new Date(endDate)
      }
    }

    // Search filter - search in title and description
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ]
    }

    // Geospatial filter
    if (lat && lng && radius) {
      filter['coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit
    const totalEvents = await Event.countDocuments(filter)

    // Fetch events
    const events = await Event.find(filter)
      .populate('createdBy', 'name email profilePicture')
      .populate('ngo', 'name logo')
      .sort({ eventDate: 1 })
      .limit(parseInt(limit))
      .skip(skip)

    res.json({
      events,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalEvents / limit),
        count: events.length,
        totalEvents: totalEvents,
      },
    })
  } catch (error) {
    console.error('Error listing events:', error)
    res.status(500).json({ message: error.message })
  }
}

// === GET EVENT BY ID ===
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params

    const event = await Event.findById(id)
      .populate('createdBy', 'name email profilePicture')
      .populate('ngo', 'name logo')
      .populate('registered.user', 'name profilePicture')

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Check if user is registered
    let isRegistered = false
    if (req.user) {
      isRegistered = event.hasUserRegistered(req.user._id)
    }

    res.json({
      event,
      isRegistered,
      capacityFilled: event.registeredCount,
      capacityRemaining: event.remainingCapacity,
      capacityPercentage: event.capacityPercentage,
    })
  } catch (error) {
    console.error('Error fetching event:', error)
    res.status(500).json({ message: error.message })
  }
}

// === UPDATE EVENT ===
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const event = await Event.findById(id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Authorization check
    const isCreator = event.createdBy.toString() === userId.toString()
    const isAdmin = userRole === 'admin'

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to update this event' })
    }

    // Don't allow status update unless admin
    if (req.body.status && !isAdmin) {
      delete req.body.status
    }

    // Handle image upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'events/banners',
        resource_type: 'auto',
      })

      // Delete old image if exists
      if (event.images && event.images.length > 0) {
        await cloudinary.uploader.destroy(event.images[0].publicId)
      }

      event.images = [
        {
          url: result.secure_url,
          publicId: result.public_id,
        },
      ]
    }

    // Update event
    Object.assign(event, req.body)
    event.updatedAt = new Date()
    await event.save()

    await event.populate('createdBy', 'name email profilePicture')
    if (event.ngo) {
      await event.populate('ngo', 'name logo')
    }

    res.json({
      message: 'Event updated successfully',
      event,
    })
  } catch (error) {
    console.error('Error updating event:', error)
    res.status(500).json({ message: error.message })
  }
}

// === DELETE EVENT ===
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const event = await Event.findById(id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Authorization check
    const isCreator = event.createdBy.toString() === userId.toString()
    const isAdmin = userRole === 'admin'

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to delete this event' })
    }

    // Delete images from Cloudinary
    if (event.images && event.images.length > 0) {
      for (const image of event.images) {
        await cloudinary.uploader.destroy(image.publicId)
      }
    }

    // Delete QR records for this event
    await QRAttendance.deleteMany({ event: id })

    // Delete event
    await Event.findByIdAndDelete(id)

    res.json({ message: 'Event deleted successfully' })
  } catch (error) {
    console.error('Error deleting event:', error)
    res.status(500).json({ message: error.message })
  }
}

// === JOIN EVENT ===
export const joinEvent = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const event = await Event.findById(id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Check if event is approved
    if (event.status === 'pending_approval') {
      return res.status(400).json({ message: 'Event is pending approval' })
    }

    // Check if user already registered
    if (event.hasUserRegistered(userId)) {
      return res.status(400).json({ message: 'You are already registered for this event' })
    }

    // Check capacity
    if (event.isFull()) {
      return res.status(400).json({ message: 'Event is at full capacity' })
    }

    // Generate QR code
    const qrData = `event_${id}_user_${userId}_${Date.now()}`
    const qrCode = await QRCode.toDataURL(qrData)

    // Create QR attendance record
    const qrAttendance = new QRAttendance({
      event: id,
      participant: userId,
      qrCode: qrData,
      status: 'registered',
    })
    await qrAttendance.save()

    // Add registration to event
    event.registered.push({
      user: userId,
      qrCode: qrAttendance._id,
      status: 'registered',
    })
    event.registeredCount += 1
    await event.save()

    // Populate and return
    const registration = event.registered[event.registered.length - 1]

    // Emit Socket.IO notification
    const io = req.app.get('io')
    if (io) {
      // Real-time update to event room (for live counters etc)
      io.to(`event:${id}`).emit('event:user_joined', {
        message: `A new user has registered for "${event.title}"`,
        userId,
        eventId: id,
        attendeeCount: event.registeredCount,
      })

      // Persistent notification to event creator
      await sendNotification(io, {
        recipientId: event.createdBy,
        type: 'event_registration',
        title: 'New Event Registration',
        message: `New registration for your event "${event.title}"`,
        data: {
          eventId: id,
          attendeeCount: event.registeredCount
        }
      })

      // Send confirmation email to attendee
      await sendNotification(io, {
        recipientId: userId,
        type: 'event_registration',
        title: 'Event Registration Confirmed',
        message: `You have successfully registered for ${event.title}`,
        data: { eventId: id },
        emailTemplate: 'event_registration',
        emailData: {
          eventTitle: event.title,
          eventDate: new Date(event.eventDate).toLocaleDateString(),
          eventTime: event.eventTime,
          location: event.location,
          qrCodeUrl: qrCode
        }
      })
    }

    res.json({
      message: 'Successfully registered for event',
      qrCode,
      qrData,
      registration: {
        ...registration.toObject(),
        qrCodeUrl: qrCode,
      },
    })
  } catch (error) {
    console.error('Error joining event:', error)
    res.status(500).json({ message: error.message })
  }
}

// === LEAVE EVENT ===
export const leaveEvent = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const event = await Event.findById(id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Check if user is registered
    const registration = event.getUserRegistration(userId)
    if (!registration) {
      return res.status(400).json({ message: 'You are not registered for this event' })
    }

    // Remove registration
    event.registered = event.registered.filter(
      reg => reg.user.toString() !== userId.toString()
    )
    event.registeredCount = Math.max(0, event.registeredCount - 1)
    await event.save()

    // Delete QR attendance record
    if (registration.qrCode) {
      await QRAttendance.findByIdAndDelete(registration.qrCode)
    }

    // Emit Socket.IO notification
    const io = req.app.get('io')
    if (io) {
      io.to(`event:${id}`).emit('event:user_left', {
        message: 'A user has cancelled their registration',
        userId,
        eventId: id,
        attendeeCount: event.registeredCount,
      })
    }

    res.json({ message: 'Successfully unregistered from event' })
  } catch (error) {
    console.error('Error leaving event:', error)
    res.status(500).json({ message: error.message })
  }
}

// === GET EVENT ATTENDEES ===
export const getEventAttendees = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const userRole = req.user.role

    const event = await Event.findById(id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Authorization - only creator or admin can view attendees
    const isCreator = event.createdBy.toString() === userId.toString()
    const isAdmin = userRole === 'admin'

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to view attendees' })
    }

    // Populate attendee details
    await event.populate('registered.user', 'name email profilePicture')

    res.json({
      attendees: event.registered,
      totalAttendees: event.registeredCount,
    })
  } catch (error) {
    console.error('Error fetching attendees:', error)
    res.status(500).json({ message: error.message })
  }
}

// === SCAN QR CODE ===
export const scanQRCode = async (req, res) => {
  try {
    const { id } = req.params
    const { qrData } = req.body
    const scannedBy = req.user._id
    const userRole = req.user.role

    const event = await Event.findById(id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Authorization - only creator or admin can scan
    const isCreator = event.createdBy.toString() === scannedBy.toString()
    const isAdmin = userRole === 'admin'

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to scan QR codes' })
    }

    // Find QR record
    const qrRecord = await QRAttendance.findOne({ qrCode: qrData, event: id })

    if (!qrRecord) {
      return res.status(404).json({ message: 'Invalid QR code' })
    }

    // Update status
    qrRecord.status = 'checked_in'
    qrRecord.checkInTime = new Date()
    qrRecord.verifiedBy = scannedBy
    qrRecord.isVerified = true
    await qrRecord.save()

    // Update event registration status
    const registration = event.registered.find(
      reg => reg.qrCode.toString() === qrRecord._id.toString()
    )
    if (registration) {
      registration.status = 'attended'
    }
    await event.save()

    // Award Points
    const points = calculateDonationPoints('event')
    const pointsResult = await addPoints(qrRecord.participant, points, 'event')

    // Populate and return
    await qrRecord.populate('participant', 'name email profilePicture')

    // Emit Socket.IO notification
    const io = req.app.get('io')
    if (io) {
      io.to(`event:${id}`).emit('event:attendance_scanned', {
        message: `Attendance marked for ${qrRecord.participant?.name || 'user'}`,
        qrRecord,
        pointsEarned: points,
        levelUp: pointsResult.levelUp
      })

      // Send email to participant
      await sendNotification(io, {
        recipientId: qrRecord.participant._id,
        type: 'attendance_verified',
        title: 'Attendance Verified',
        message: `Your attendance for ${event.title} has been verified. You earned ${points} points.`,
        data: { 
            eventId: id,
            pointsEarned: points,
            levelUp: pointsResult.levelUp
        },
        emailTemplate: 'attendance_confirmation',
        emailData: {
          eventTitle: event.title,
          pointsEarned: points,
          totalPoints: pointsResult.totalPoints
        }
      })

      // Send Certificate Email if earned
      if (pointsResult.newCertificate) {
        await sendNotification(io, {
            recipientId: qrRecord.participant._id,
            type: 'certificate_earned',
            title: 'New Certificate Earned!',
            message: `Congratulations! You've earned a new certificate: ${pointsResult.newCertificate.title}`,
            data: {
                certificateId: pointsResult.newCertificate._id,
                certificateUrl: pointsResult.newCertificate.certificateUrl
            },
            emailTemplate: 'certificate_issued',
            emailData: {
                recipientName: qrRecord.participant.name || 'Volunteer',
                certificateTitle: pointsResult.newCertificate.title,
                issueDate: new Date().toLocaleDateString(),
                certificateUrl: pointsResult.newCertificate.certificateUrl || '#'
            }
        })
      }
    }

    res.json({
      message: 'Attendance marked successfully',
      qrRecord,
      pointsEarned: points,
      levelUp: pointsResult.levelUp
    })
  } catch (error) {
    console.error('Error scanning QR code:', error)
    res.status(500).json({ message: error.message })
  }
}

// === APPROVE EVENT (ADMIN) ===
export const approveEvent = async (req, res) => {
  try {
    const { id } = req.params
    const adminId = req.user._id
    const { rejectionReason } = req.body

    const event = await Event.findById(id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Only pending individual events need approval
    if (event.creatorType !== 'individual' || event.status !== 'pending_approval') {
      return res.status(400).json({ message: 'Event is not pending approval' })
    }

    // Determine approval or rejection
    const isApproved = !rejectionReason

    if (isApproved) {
      event.status = 'approved'
      event.approvedBy = adminId
      event.approvedAt = new Date()
    } else {
      event.status = 'rejected'
      event.rejectionReason = rejectionReason
    }

    await event.save()

    // Send notification to event creator
    const io = req.app.get('io')
    if (io) {
      await sendNotification(io, {
        recipientId: event.createdBy,
        type: 'admin_approval',
        title: isApproved ? 'Event Approved' : 'Event Rejected',
        message: isApproved
          ? `Your event "${event.title}" has been approved!`
          : `Your event "${event.title}" has been rejected. Reason: ${rejectionReason}`,
        data: {
          eventId: event._id,
          status: event.status,
          rejectionReason
        }
      })
    }

    res.json({
      message: isApproved ? 'Event approved successfully' : 'Event rejected successfully',
      event,
    })
  } catch (error) {
    console.error('Error approving event:', error)
    res.status(500).json({ message: error.message })
  }
}

// === GET PENDING EVENTS (ADMIN) ===
export const getPendingEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const skip = (page - 1) * limit

    const totalPending = await Event.countDocuments({
      status: 'pending_approval',
      creatorType: 'individual',
    })

    const pendingEvents = await Event.find({
      status: 'pending_approval',
      creatorType: 'individual',
    })
      .populate('createdBy', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)

    res.json({
      pendingEvents,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(totalPending / limit),
        count: pendingEvents.length,
        total: totalPending,
      },
    })
  } catch (error) {
    console.error('Error fetching pending events:', error)
    res.status(500).json({ message: error.message })
  }
}

// === UPLOAD EVENT IMAGE ===
export const uploadEventImage = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const event = await Event.findById(id)

    if (!event) {
      return res.status(404).json({ message: 'Event not found' })
    }

    // Authorization
    const isCreator = event.createdBy.toString() === userId.toString()
    const isAdmin = req.user.role === 'admin'

    if (!isCreator && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to upload images' })
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' })
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'events/images',
      resource_type: 'auto',
    })

    // Add to images array
    event.images.push({
      url: result.secure_url,
      publicId: result.public_id,
    })

    await event.save()

    res.json({
      message: 'Image uploaded successfully',
      image: {
        url: result.secure_url,
        publicId: result.public_id,
      },
      event,
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    res.status(500).json({ message: error.message })
  }
}
