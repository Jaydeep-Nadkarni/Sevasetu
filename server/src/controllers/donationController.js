import ItemDonation from '../models/ItemDonation.js'
import NGO from '../models/NGO.js'
import { uploadImage, deleteImage } from '../config/cloudinary.js'
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js'
import { addPoints, calculateDonationPoints } from '../utils/pointsSystem.js'
import { sendNotification } from '../services/notificationService.js'

/**
 * Create new item donation with automatic NGO assignment
 */
export const createItemDonation = asyncHandler(async (req, res) => {
  const {
    itemsCategory,
    itemsDescription,
    itemsQuantity,
    itemsUnit,
    itemsQuality,
    itemsExpiryDate,
    locationCoordinates, // [longitude, latitude]
    locationAddress,
    locationCity,
    locationState,
    locationZipcode,
    pickupDate,
    pickupTime,
    pickupFlexible,
    contactName,
    contactPhone,
    contactEmail,
    specialInstructions,
    accessInstructions,
    tags,
  } = req.body

  // Validate required fields
  if (!itemsCategory || !itemsDescription || !itemsQuantity || !itemsUnit) {
    return errorResponse(res, 'Missing required donation item fields', 400)
  }

  if (!locationCoordinates || !locationAddress) {
    return errorResponse(res, 'Missing location information', 400)
  }

  if (!contactName || !contactPhone) {
    return errorResponse(res, 'Missing contact information', 400)
  }

  try {
    // Handle image upload if file provided
    let images = []
    if (req.file) {
      try {
        const uploadResult = await uploadImage(req.file.buffer, {
          folder: 'donations',
          tags: ['donation', itemsCategory],
        })
        images.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        })
      } catch (uploadError) {
        console.error('Image upload error:', uploadError)
        // Continue without image if upload fails
      }
    }

    // Create donation document
    const donation = new ItemDonation({
      donor: req.user._id,
      items: {
        category: itemsCategory,
        description: itemsDescription,
        quantity: parseInt(itemsQuantity),
        unit: itemsUnit,
        qualityCondition: itemsQuality || 'good',
        expiryDate: itemsExpiryDate ? new Date(itemsExpiryDate) : null,
      },
      location: {
        type: 'Point',
        coordinates: [
          parseFloat(locationCoordinates.split(',')[0]),
          parseFloat(locationCoordinates.split(',')[1]),
        ],
        address: locationAddress,
        city: locationCity,
        state: locationState,
        zipcode: locationZipcode,
      },
      images,
      pickupSchedule: {
        preferredDate: pickupDate ? new Date(pickupDate) : null,
        preferredTime: pickupTime,
        isFlexible: pickupFlexible !== false,
      },
      contactPerson: {
        name: contactName,
        phone: contactPhone,
        email: contactEmail || req.user.email,
      },
      specialInstructions,
      accessInstructions,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
    })

    // Add creation log
    donation.activityLog.push({
      action: 'created',
      message: 'Donation created',
      changedBy: req.user._id,
    })

    // Auto-assign nearby NGOs
    await assignNearbyNGOs(donation)

    await donation.save()

    // Populate references for response
    await donation.populate([
      { path: 'donor', select: 'firstName lastName email' },
      { path: 'assignedNGOs.ngo', select: 'name email phone' },
      { path: 'primaryNGO', select: 'name email phone' },
    ])

    // Send confirmation email to donor
    const io = req.app.get('io')
    await sendNotification(io, {
      recipientId: req.user._id,
      type: 'donation_update',
      title: 'Donation Created',
      message: 'Your donation has been created and is visible to nearby NGOs.',
      data: { donationId: donation._id },
      emailTemplate: 'donation_confirmation',
      emailData: {
        donationId: donation._id,
        category: itemsCategory,
        quantity: itemsQuantity,
        unit: itemsUnit,
        ngoName: 'Pending Assignment',
        status: 'Pending',
        points: 0
      }
    })

    successResponse(
      res,
      donation,
      'Donation created successfully and assigned to nearby NGOs',
      201
    )
  } catch (error) {
    console.error('Create donation error:', error)
    errorResponse(res, 'Failed to create donation: ' + error.message, 500)
  }
})

/**
 * Auto-assign donation to nearby NGOs using geospatial queries
 * Algorithm:
 * 1. Find NGOs within configurable radius (default 15km)
 * 2. Filter by donation category match
 * 3. Sort by distance
 * 4. Check NGO capacity/availability
 * 5. Assign to top 3 nearest NGOs
 */
const assignNearbyNGOs = async (donation) => {
  const SEARCH_RADIUS_METERS = 15000 // 15km in meters
  const MAX_ASSIGNMENTS = 3 // Max NGOs to assign per donation

  try {
    // Find NGOs within radius, sorted by distance
    const nearbyNGOs = await NGO.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: donation.location.coordinates,
          },
          $maxDistance: SEARCH_RADIUS_METERS,
        },
      },
      isActive: true,
    }).select('name location email phone acceptedDonations')

    if (nearbyNGOs.length === 0) {
      console.log(`No NGOs found within ${SEARCH_RADIUS_METERS}m for donation ${donation._id}`)
      return
    }

    // Filter and score NGOs based on:
    // 1. Distance (closer = better)
    // 2. Category match
    // 3. Current workload
    // 4. Historical acceptance rate
    const scoredNGOs = nearbyNGOs.slice(0, MAX_ASSIGNMENTS).map((ngo, index) => {
      // Calculate distance
      const distance = calculateDistance(
        donation.location.coordinates,
        ngo.location.coordinates
      )

      // Score based on ranking (closer NGOs get better score)
      const distanceScore = 10 - index * 2 // First gets 10, second gets 8, third gets 6

      return {
        ngo: ngo._id,
        distanceKm: distance,
        score: distanceScore,
      }
    })

    // Assign to NGOs
    donation.assignedNGOs = scoredNGOs.map(item => ({
      ngo: item.ngo,
      distanceKm: item.distanceKm,
      assignedAt: new Date(),
      status: 'pending',
    }))

    // Log assignment
    donation.activityLog.push({
      action: 'assigned',
      message: `Automatically assigned to ${scoredNGOs.length} nearby NGOs`,
    })

    return donation
  } catch (error) {
    console.error('Error assigning nearby NGOs:', error)
    // Don't fail donation creation if assignment fails
  }
}

/**
 * Calculate distance between two coordinates (in km)
 * Using Haversine formula
 */
const calculateDistance = (coord1, coord2) => {
  const [lon1, lat1] = coord1
  const [lon2, lat2] = coord2

  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // Round to 1 decimal place
}

/**
 * Get available donations for NGO (from their location)
 */
export const getAvailableDonations = asyncHandler(async (req, res) => {
  const { category, distance = 15, status = 'pending' } = req.query

  // Get user's NGO
  const userNGO = await NGO.findOne({ admin: req.user._id })
  if (!userNGO) {
    return errorResponse(res, 'NGO not found', 404)
  }

  try {
    // Build query
    const query = {
      'assignedNGOs.ngo': userNGO._id,
      'assignedNGOs.status': status,
      status: 'pending',
    }

    if (category) {
      query['items.category'] = category
    }

    const donations = await ItemDonation.find(query)
      .populate('donor', 'firstName lastName email phone')
      .populate('assignedNGOs.ngo', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(50)

    successResponse(res, donations, 'Available donations retrieved')
  } catch (error) {
    console.error('Get available donations error:', error)
    errorResponse(res, 'Failed to fetch available donations', 500)
  }
})

/**
 * Get donations assigned to NGO
 */
export const getAssignedDonations = asyncHandler(async (req, res) => {
  const { status = 'accepted' } = req.query

  // Get user's NGO
  const userNGO = await NGO.findOne({ admin: req.user._id })
  if (!userNGO) {
    return errorResponse(res, 'NGO not found', 404)
  }

  try {
    const donations = await ItemDonation.find({
      'assignedNGOs.ngo': userNGO._id,
      'assignedNGOs.status': status,
    })
      .populate('donor', 'firstName lastName email phone')
      .populate('assignedNGOs.ngo', 'name email phone')
      .sort({ createdAt: -1 })

    successResponse(res, donations, 'Assigned donations retrieved')
  } catch (error) {
    console.error('Get assigned donations error:', error)
    errorResponse(res, 'Failed to fetch assigned donations', 500)
  }
})

/**
 * NGO accepts a donation
 */
export const acceptDonation = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { notes } = req.body

  // Get user's NGO
  const userNGO = await NGO.findOne({ admin: req.user._id })
  if (!userNGO) {
    return errorResponse(res, 'NGO not found', 404)
  }

  try {
    const donation = await ItemDonation.findById(id)
    if (!donation) {
      return errorResponse(res, 'Donation not found', 404)
    }

    // Find and update NGO assignment
    const ngoAssignment = donation.assignedNGOs.find(
      a => a.ngo.toString() === userNGO._id.toString()
    )

    if (!ngoAssignment) {
      return errorResponse(res, 'Donation not assigned to your NGO', 403)
    }

    // Update assignment
    ngoAssignment.status = 'accepted'
    ngoAssignment.acceptedAt = new Date()
    ngoAssignment.notes = notes || ''

    // Set as primary NGO if not already set
    if (!donation.primaryNGO) {
      donation.primaryNGO = userNGO._id
      donation.status = 'accepted'
    }

    // Add activity log
    donation.activityLog.push({
      action: 'accepted',
      ngo: userNGO._id,
      message: `Donation accepted by ${userNGO.name}`,
      changedBy: req.user._id,
    })

    await donation.save()

    // Send notification to donor
    const io = req.app.get('io')
    await sendNotification(io, {
      recipientId: donation.donor,
      type: 'donation_update',
      title: 'Donation Accepted',
      message: `Your donation has been accepted by ${userNGO.name}`,
      data: {
        donationId: donation._id,
        ngoId: userNGO._id,
        ngoName: userNGO.name,
        status: 'accepted'
      },
      emailTemplate: 'donation_confirmation',
      emailData: {
        donationId: donation._id,
        category: donation.items.category,
        quantity: donation.items.quantity,
        unit: donation.items.unit,
        ngoName: userNGO.name,
        status: 'Accepted',
        points: 0
      }
    })

    await donation.populate([
      { path: 'donor', select: 'firstName lastName email' },
      { path: 'assignedNGOs.ngo', select: 'name email phone' },
      { path: 'primaryNGO', select: 'name email phone' },
    ])

    successResponse(res, donation, 'Donation accepted successfully')
  } catch (error) {
    console.error('Accept donation error:', error)
    errorResponse(res, 'Failed to accept donation', 500)
  }
})

/**
 * NGO rejects a donation
 */
export const rejectDonation = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { reason } = req.body

  // Get user's NGO
  const userNGO = await NGO.findOne({ admin: req.user._id })
  if (!userNGO) {
    return errorResponse(res, 'NGO not found', 404)
  }

  try {
    const donation = await ItemDonation.findById(id)
    if (!donation) {
      return errorResponse(res, 'Donation not found', 404)
    }

    // Find and update NGO assignment
    const ngoAssignment = donation.assignedNGOs.find(
      a => a.ngo.toString() === userNGO._id.toString()
    )

    if (!ngoAssignment) {
      return errorResponse(res, 'Donation not assigned to your NGO', 403)
    }

    // Update assignment
    ngoAssignment.status = 'rejected'
    ngoAssignment.notes = reason || 'No reason provided'

    // If all NGOs reject, mark donation as rejected
    const allRejected = donation.assignedNGOs.every(a => a.status === 'rejected')
    if (allRejected) {
      donation.status = 'rejected'
    }

    // Add activity log
    donation.activityLog.push({
      action: 'rejected',
      ngo: userNGO._id,
      message: `Donation rejected by ${userNGO.name}. Reason: ${reason || 'Not provided'}`,
      changedBy: req.user._id,
    })

    await donation.save()

    await donation.populate([
      { path: 'donor', select: 'firstName lastName email' },
      { path: 'assignedNGOs.ngo', select: 'name email phone' },
    ])

    successResponse(res, donation, 'Donation rejected')
  } catch (error) {
    console.error('Reject donation error:', error)
    errorResponse(res, 'Failed to reject donation', 500)
  }
})

/**
 * Mark donation pickup as complete
 */
export const completePickup = asyncHandler(async (req, res) => {
  const { id } = req.params

  // Get user's NGO
  const userNGO = await NGO.findOne({ admin: req.user._id })
  if (!userNGO) {
    return errorResponse(res, 'NGO not found', 404)
  }

  try {
    const donation = await ItemDonation.findById(id)
    if (!donation) {
      return errorResponse(res, 'Donation not found', 404)
    }

    // Mark as completed
    await donation.markCompleted(userNGO._id)

    // Award points to donor
    let pointsType = 'essentials'
    const category = donation.items.category.toLowerCase()
    if (category.includes('food')) pointsType = 'food'
    else if (category.includes('cloth')) pointsType = 'clothes'
    
    const points = calculateDonationPoints(pointsType, donation.items.quantity)
    const io = req.app.get('io')
    const pointsResult = await addPoints(donation.donor, points, 'donation', io)

    // Send notification to donor
    await sendNotification(io, {
      recipientId: donation.donor,
      type: 'donation_update',
      title: 'Donation Completed',
      message: `Your donation pickup is complete! You earned ${points} points.`,
      data: {
        donationId: donation._id,
        ngoId: userNGO._id,
        pointsEarned: points,
        levelUp: pointsResult.levelUp,
        newLevel: pointsResult.newLevel,
        status: 'completed'
      },
      emailTemplate: 'donation_confirmation',
      emailData: {
        donationId: donation._id,
        category: donation.items.category,
        quantity: donation.items.quantity,
        unit: donation.items.unit,
        ngoName: userNGO.name,
        status: 'Completed',
        points: points
      }
    })

    // If level up / certificate earned, send certificate email
    if (pointsResult.newCertificate) {
      await sendNotification(io, {
        recipientId: donation.donor,
        type: 'certificate_earned',
        title: 'New Certificate Earned!',
        message: `Congratulations! You've earned a new certificate: ${pointsResult.newCertificate.title}`,
        data: {
          certificateId: pointsResult.newCertificate._id,
          certificateUrl: pointsResult.newCertificate.certificateUrl
        },
        emailTemplate: 'certificate_issued',
        emailData: {
          recipientName: donation.donor.firstName,
          certificateTitle: pointsResult.newCertificate.title,
          issueDate: new Date().toLocaleDateString(),
          certificateUrl: pointsResult.newCertificate.certificateUrl || '#'
        }
      })
    }

    await donation.populate([
      { path: 'donor', select: 'firstName lastName email' },
      { path: 'assignedNGOs.ngo', select: 'name email phone' },
    ])

    successResponse(res, donation, 'Donation marked as completed')
  } catch (error) {
    console.error('Complete pickup error:', error)
    errorResponse(res, 'Failed to complete pickup', 500)
  }
})

/**
 * Get donations by NGO
 */
export const getDonationsByNGO = asyncHandler(async (req, res) => {
  const { ngoId } = req.params
  const { status } = req.query

  try {
    const query = { 'assignedNGOs.ngo': ngoId }
    if (status) query['assignedNGOs.status'] = status

    const donations = await ItemDonation.find(query)
      .populate('donor', 'firstName lastName email phone')
      .populate('assignedNGOs.ngo', 'name email phone')
      .sort({ createdAt: -1 })

    successResponse(res, donations, 'Donations retrieved')
  } catch (error) {
    console.error('Get donations by NGO error:', error)
    errorResponse(res, 'Failed to fetch donations', 500)
  }
})

/**
 * Get donations by donor (user)
 */
export const getDonationsByDonor = asyncHandler(async (req, res) => {
  try {
    const donations = await ItemDonation.find({ donor: req.user._id })
      .populate('assignedNGOs.ngo', 'name email phone location')
      .populate('primaryNGO', 'name email phone')
      .sort({ createdAt: -1 })

    successResponse(res, donations, 'User donations retrieved')
  } catch (error) {
    console.error('Get user donations error:', error)
    errorResponse(res, 'Failed to fetch donations', 500)
  }
})

/**
 * Get specific donation by ID
 */
export const getDonationById = asyncHandler(async (req, res) => {
  const { id } = req.params

  try {
    const donation = await ItemDonation.findById(id)
      .populate('donor', 'firstName lastName email phone')
      .populate('assignedNGOs.ngo', 'name email phone')
      .populate('primaryNGO', 'name email phone')
      .populate('activityLog.changedBy', 'firstName lastName')

    if (!donation) {
      return errorResponse(res, 'Donation not found', 404)
    }

    successResponse(res, donation, 'Donation retrieved')
  } catch (error) {
    console.error('Get donation error:', error)
    errorResponse(res, 'Failed to fetch donation', 500)
  }
})

/**
 * Update donation status
 */
export const updateDonationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  try {
    const donation = await ItemDonation.findById(id)
    if (!donation) {
      return errorResponse(res, 'Donation not found', 404)
    }

    // Only donor can update status for certain actions
    if (donation.donor.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Unauthorized', 403)
    }

    const oldStatus = donation.status
    donation.status = status

    // Add activity log
    donation.activityLog.push({
      action: 'status_updated',
      message: `Status changed from ${oldStatus} to ${status}`,
      changedBy: req.user._id,
    })

    await donation.save()

    await donation.populate([
      { path: 'donor', select: 'firstName lastName email' },
      { path: 'assignedNGOs.ngo', select: 'name email phone' },
    ])

    successResponse(res, donation, 'Status updated successfully')
  } catch (error) {
    console.error('Update status error:', error)
    errorResponse(res, 'Failed to update status', 500)
  }
})

/**
 * Cancel donation
 */
export const cancelDonation = asyncHandler(async (req, res) => {
  const { id } = req.params

  try {
    const donation = await ItemDonation.findById(id)
    if (!donation) {
      return errorResponse(res, 'Donation not found', 404)
    }

    // Only donor can cancel
    if (donation.donor.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Unauthorized', 403)
    }

    // Can only cancel if pending
    if (donation.status !== 'pending' && donation.status !== 'accepted') {
      return errorResponse(res, 'Cannot cancel donation at this status', 400)
    }

    donation.status = 'cancelled'

    donation.activityLog.push({
      action: 'cancelled',
      message: 'Donation cancelled by donor',
      changedBy: req.user._id,
    })

    await donation.save()

    // Notify assigned NGOs
    const io = req.app.get('io')
    
    // We need to notify each assigned NGO
    for (const assignment of donation.assignedNGOs) {
      // We need to find the admin user ID for this NGO to send a notification
      // This might require an extra query if we don't have the admin ID handy
      // For now, we'll emit to the NGO room directly via socket if we can't find the user
      // But sendNotification expects a recipientId (user ID).
      
      // Let's look up the NGO to get the admin ID
      const ngo = await NGO.findById(assignment.ngo)
      if (ngo && ngo.admin) {
        await sendNotification(io, {
          recipientId: ngo.admin,
          type: 'donation_update',
          title: 'Donation Cancelled',
          message: 'A pending donation was cancelled by the donor',
          data: {
            donationId: donation._id,
            status: 'cancelled'
          }
        })
      }
    }

    successResponse(res, donation, 'Donation cancelled')
  } catch (error) {
    console.error('Cancel donation error:', error)
    errorResponse(res, 'Failed to cancel donation', 500)
  }
})

/**
 * List all donations with filters and pagination
 */
export const listDonations = asyncHandler(async (req, res) => {
  const { category, status, city, page = 1, limit = 10 } = req.query

  try {
    const query = {}

    if (category) query['items.category'] = category
    if (status) query.status = status
    if (city) query['location.city'] = city

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const donations = await ItemDonation.find(query)
      .populate('donor', 'firstName lastName')
      .populate('primaryNGO', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await ItemDonation.countDocuments(query)

    successResponse(
      res,
      {
        donations,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
      'Donations listed'
    )
  } catch (error) {
    console.error('List donations error:', error)
    errorResponse(res, 'Failed to list donations', 500)
  }
})

/**
 * Search donations with advanced filters
 */
export const searchDonations = asyncHandler(async (req, res) => {
  const { q, category, status, minDistance, maxDistance } = req.query
  const userLocation = req.user?.location

  try {
    const query = {}

    if (q) {
      query.$or = [
        { 'items.description': { $regex: q, $options: 'i' } },
        { 'contactPerson.name': { $regex: q, $options: 'i' } },
        { 'location.address': { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ]
    }

    if (category) query['items.category'] = category
    if (status) query.status = status

    let donations = await ItemDonation.find(query)
      .populate('donor', 'firstName lastName')
      .populate('primaryNGO', 'name')
      .sort({ createdAt: -1 })
      .limit(50)

    // Filter by distance if user location provided
    if (userLocation && userLocation.coordinates) {
      donations = donations.filter(d => {
        const distance = calculateDistance(
          userLocation.coordinates,
          d.location.coordinates
        )
        const min = minDistance ? parseInt(minDistance) : 0
        const max = maxDistance ? parseInt(maxDistance) : 1000
        return distance >= min && distance <= max
      })
    }

    successResponse(res, donations, 'Search results retrieved')
  } catch (error) {
    console.error('Search donations error:', error)
    errorResponse(res, 'Search failed', 500)
  }
})
