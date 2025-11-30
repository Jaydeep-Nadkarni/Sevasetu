import HelpRequest from '../models/HelpRequest.js'
import NGO from '../models/NGO.js'
import cloudinary from '../config/cloudinary.js'
import { sendNotification } from '../services/notificationService.js'

// === CREATE HELP REQUEST ===
export const createHelpRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      urgency,
      location,
      city,
      state,
      beneficiaries,
      targetAmount,
      deadline,
      visibility,
      coordinates,
    } = req.body

    const userId = req.user._id

    // Handle image upload
    const images = []
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'help_requests',
          resource_type: 'auto',
        })
        images.push(result.secure_url)
      }
    }

    const helpRequestData = {
      requester: userId,
      title,
      description,
      category,
      urgency,
      location: {
        address: location,
        city,
        state,
      },
      beneficiaries: parseInt(beneficiaries),
      targetAmount: targetAmount ? parseFloat(targetAmount) : 0,
      deadline: deadline ? new Date(deadline) : null,
      visibility,
      images,
    }

    // Add coordinates if provided
    if (coordinates && coordinates.lat && coordinates.lng) {
      helpRequestData.location.coordinates = {
        type: 'Point',
        coordinates: [parseFloat(coordinates.lng), parseFloat(coordinates.lat)],
      }
    }

    const helpRequest = new HelpRequest(helpRequestData)
    await helpRequest.save()

    await helpRequest.populate('requester', 'name email avatar')

    // Notify NGOs (Socket.IO)
    const io = req.app.get('io')
    if (io) {
      io.to('ngo_admin').emit('help_request:created', {
        message: `New Help Request: ${title}`,
        helpRequest,
      })
    }

    res.status(201).json({
      message: 'Help request created successfully',
      helpRequest,
    })
  } catch (error) {
    console.error('Error creating help request:', error)
    res.status(500).json({ message: error.message })
  }
}

// === LIST HELP REQUESTS ===
export const listHelpRequests = async (req, res) => {
  try {
    const {
      category,
      status,
      urgency,
      city,
      visibility,
      lat,
      lng,
      radius,
      page = 1,
      limit = 10,
    } = req.query

    const filter = {}

    // Visibility filter
    // If user is NGO admin, show all. If public user, show only public.
    // If user is the creator, show their own regardless of visibility.
    // For general listing:
    if (req.user && (req.user.role === 'ngo_admin' || req.user.role === 'admin')) {
      // Can see everything
      if (visibility) filter.visibility = visibility
    } else {
      // Public user
      filter.visibility = 'public'
    }

    if (category && category !== 'all') filter.category = category
    if (status && status !== 'all') filter.status = status
    if (urgency && urgency !== 'all') filter.urgency = urgency
    if (city) filter['location.city'] = new RegExp(city, 'i')

    // Geospatial filter
    if (lat && lng && radius) {
      filter['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      }
    }

    const skip = (page - 1) * limit
    const total = await HelpRequest.countDocuments(filter)

    const helpRequests = await HelpRequest.find(filter)
      .populate('requester', 'name avatar')
      .populate('assignedNGO', 'name logo')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)

    res.json({
      helpRequests,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: helpRequests.length,
        totalRequests: total,
      },
    })
  } catch (error) {
    console.error('Error listing help requests:', error)
    res.status(500).json({ message: error.message })
  }
}

// === GET HELP REQUEST BY ID ===
export const getHelpRequestById = async (req, res) => {
  try {
    const { id } = req.params
    const helpRequest = await HelpRequest.findById(id)
      .populate('requester', 'name email avatar phone')
      .populate('assignedNGO', 'name logo email phone')
      .populate('comments.user', 'name avatar role')

    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' })
    }

    // Visibility check
    if (
      helpRequest.visibility === 'ngo_only' &&
      (!req.user || (req.user.role !== 'ngo_admin' && req.user.role !== 'admin' && req.user._id.toString() !== helpRequest.requester._id.toString()))
    ) {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json({ helpRequest })
  } catch (error) {
    console.error('Error fetching help request:', error)
    res.status(500).json({ message: error.message })
  }
}

// === CLAIM HELP REQUEST (NGO ONLY) ===
export const claimHelpRequest = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    // Check if user is NGO admin
    if (req.user.role !== 'ngo_admin') {
      return res.status(403).json({ message: 'Only NGOs can claim requests' })
    }

    const ngo = await NGO.findOne({ admin: userId })
    if (!ngo) {
      return res.status(404).json({ message: 'NGO profile not found' })
    }

    const helpRequest = await HelpRequest.findById(id)
    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' })
    }

    if (helpRequest.status !== 'open') {
      return res.status(400).json({ message: 'Request is already claimed or closed' })
    }

    helpRequest.assignedNGO = ngo._id
    helpRequest.status = 'in_progress'
    await helpRequest.save()

    // Notify requester
    const io = req.app.get('io')
    if (io) {
      await sendNotification(io, {
        recipientId: helpRequest.requester,
        type: 'help_request_update',
        title: 'Help Request Claimed',
        message: `Your request "${helpRequest.title}" has been claimed by ${ngo.name}`,
        data: {
          requestId: helpRequest._id,
          ngoId: ngo._id,
          status: 'in_progress'
        },
        emailTemplate: 'help_request_update',
        emailData: {
          requestTitle: helpRequest.title,
          status: 'In Progress',
          message: `${ngo.name} has claimed your request and will be in touch shortly.`,
          dashboardUrl: `${process.env.CLIENT_URL}/dashboard`
        }
      })
    }

    res.json({
      message: 'Help request claimed successfully',
      helpRequest,
    })
  } catch (error) {
    console.error('Error claiming help request:', error)
    res.status(500).json({ message: error.message })
  }
}

// === ADD COMMENT ===
export const addComment = async (req, res) => {
  try {
    const { id } = req.params
    const { text } = req.body
    const userId = req.user._id

    const helpRequest = await HelpRequest.findById(id)
    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' })
    }

    const comment = {
      user: userId,
      text,
      createdAt: new Date(),
    }

    helpRequest.comments.push(comment)
    await helpRequest.save()

    // Populate user info for the new comment
    await helpRequest.populate('comments.user', 'name avatar role')

    // Notify relevant parties
    const io = req.app.get('io')
    if (io) {
      // Notify requester if comment is not by them
      if (helpRequest.requester.toString() !== userId.toString()) {
        io.to(`user:${helpRequest.requester}`).emit('help_request:comment', {
          message: `New comment on your request "${helpRequest.title}"`,
          helpRequest,
        })
      }
      // Notify assigned NGO if comment is not by them
      if (helpRequest.assignedNGO) {
        // Need to find NGO admin ID to notify specific user, or just notify NGO room
        io.to(`ngo:${helpRequest.assignedNGO}`).emit('help_request:comment', {
          message: `New comment on claimed request "${helpRequest.title}"`,
          helpRequest,
        })
      }
    }

    res.json({
      message: 'Comment added',
      comments: helpRequest.comments,
    })
  } catch (error) {
    console.error('Error adding comment:', error)
    res.status(500).json({ message: error.message })
  }
}

// === UPDATE STATUS ===
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const userId = req.user._id

    const helpRequest = await HelpRequest.findById(id)
    if (!helpRequest) {
      return res.status(404).json({ message: 'Help request not found' })
    }

    // Authorization: Requester or Assigned NGO can update status
    let isAuthorized = false
    if (helpRequest.requester.toString() === userId.toString()) {
      isAuthorized = true
    } else if (req.user.role === 'ngo_admin') {
      const ngo = await NGO.findOne({ admin: userId })
      if (ngo && helpRequest.assignedNGO && helpRequest.assignedNGO.toString() === ngo._id.toString()) {
        isAuthorized = true
      }
    }

    if (!isAuthorized && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to update status' })
    }

    helpRequest.status = status
    if (status === 'completed') {
      helpRequest.impact.completionDate = new Date()
    }
    await helpRequest.save()

    // Notify
    const io = req.app.get('io')
    if (io) {
      const msg = `Help request "${helpRequest.title}" marked as ${status}`
      
      // Notify requester
      await sendNotification(io, {
        recipientId: helpRequest.requester,
        type: 'help_request_update',
        title: 'Status Updated',
        message: msg,
        data: {
          requestId: helpRequest._id,
          status
        },
        emailTemplate: 'help_request_update',
        emailData: {
          requestTitle: helpRequest.title,
          status: status,
          message: `The status of your help request has been updated to ${status}.`,
          dashboardUrl: `${process.env.CLIENT_URL}/dashboard`
        }
      })

      // Notify assigned NGO if exists and status changed by requester
      if (helpRequest.assignedNGO) {
        // Find NGO admin
        const assignedNGO = await NGO.findById(helpRequest.assignedNGO)
        if (assignedNGO && assignedNGO.admin) {
             await sendNotification(io, {
                recipientId: assignedNGO.admin,
                type: 'help_request_update',
                title: 'Status Updated',
                message: msg,
                data: {
                  requestId: helpRequest._id,
                  status
                }
              })
        }
      }
    }

    res.json({
      message: 'Status updated successfully',
      helpRequest,
    })
  } catch (error) {
    console.error('Error updating status:', error)
    res.status(500).json({ message: error.message })
  }
}
