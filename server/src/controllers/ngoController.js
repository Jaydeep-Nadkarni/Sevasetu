import NGO from '../models/NGO.js'
import User from '../models/User.js'
import { sendNotification } from '../services/notificationService.js'
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js'

// === LIST NGOS ===
export const listNGOs = asyncHandler(async (req, res) => {
  try {
    const {
      category,
      city,
      search,
      lat,
      lng,
      radius,
      page = 1,
      limit = 10,
    } = req.query

    const filter = { status: 'approved' } // Only show approved NGOs

    if (category && category !== 'all') {
      filter.focusAreas = category
    }

    if (city) {
      filter['location.city'] = new RegExp(city, 'i')
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ]
    }

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
    const total = await NGO.countDocuments(filter)

    const ngos = await NGO.find(filter)
      .select('name description logo location focusAreas contact rating')
      .limit(parseInt(limit))
      .skip(skip)

    successResponse(res, {
      ngos,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: ngos.length,
        totalNGOs: total,
      },
    }, 'NGOs listed successfully')
  } catch (error) {
    console.error('Error listing NGOs:', error)
    errorResponse(res, error.message, 500)
  }
})

// === GET NGO BY ID ===
export const getNGOById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params
    const ngo = await NGO.findById(id).populate('admin', 'name email')

    if (!ngo) {
      return errorResponse(res, 'NGO not found', 404)
    }

    successResponse(res, { ngo }, 'NGO details fetched')
  } catch (error) {
    console.error('Error fetching NGO:', error)
    errorResponse(res, error.message, 500)
  }
})

// === UPDATE NGO STATUS (Admin only) ===
export const updateNGOStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status, reason } = req.body // status: 'approved' or 'rejected'

  if (!['approved', 'rejected'].includes(status)) {
    return errorResponse(res, 'Invalid status', 400)
  }

  try {
    const ngo = await NGO.findById(id).populate('owner')
    if (!ngo) {
      return errorResponse(res, 'NGO not found', 404)
    }

    ngo.verificationStatus = status
    if (status === 'approved') {
        ngo.status = 'approved' // Set public status
        ngo.isVerified = true
    } else {
        ngo.status = 'rejected'
    }
    
    await ngo.save()

    // Send Notification
    const io = req.app.get('io')
    if (ngo.owner) {
        await sendNotification(io, {
            recipientId: ngo.owner._id,
            type: 'ngo_status_update',
            title: `NGO Application ${status === 'approved' ? 'Approved' : 'Rejected'}`,
            message: `Your application for ${ngo.name} has been ${status}.`,
            data: {
                ngoId: ngo._id,
                status: status,
                reason: reason
            },
            emailTemplate: 'ngo_approval',
            emailData: {
                adminName: ngo.owner.firstName,
                ngoName: ngo.name,
                status: status.toUpperCase(),
                statusClass: status,
                isApproved: status === 'approved',
                reason: reason || 'Does not meet criteria',
                dashboardUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`
            }
        })
    }

    successResponse(res, ngo, `NGO ${status} successfully`)
  } catch (error) {
    console.error('Error updating NGO status:', error)
    errorResponse(res, error.message, 500)
  }
})
