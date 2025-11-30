import Certificate from '../models/Certificate.js'
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js'

// @desc    Get logged in user's certificates
// @route   GET /api/certificates/my-certificates
// @access  Private
export const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ recipient: req.user._id })
    .sort({ issueDate: -1 })
    .populate('issuer', 'name logo')
    .populate('event', 'title')
  
  successResponse(res, certificates, 'Certificates fetched successfully')
})

// @desc    Verify certificate by code
// @route   GET /api/certificates/verify/:code
// @access  Public
export const verifyCertificate = asyncHandler(async (req, res) => {
  const { code } = req.params
  
  const certificate = await Certificate.findOne({ certificateNumber: code })
    .populate('recipient', 'firstName lastName avatar')
    .populate('issuer', 'name logo')
    .populate('event', 'title eventDate')

  if (!certificate) {
    return errorResponse(res, 'Certificate not found or invalid', 404)
  }

  successResponse(res, certificate, 'Certificate verified successfully')
})

// @desc    Get certificate by ID
// @route   GET /api/certificates/:id
// @access  Private (or Public if shared?)
export const getCertificateById = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate('recipient', 'firstName lastName')
    .populate('issuer', 'name')

  if (!certificate) {
    return errorResponse(res, 'Certificate not found', 404)
  }

  // Check ownership if not admin/issuer
  if (req.user.role === 'user' && certificate.recipient._id.toString() !== req.user._id.toString()) {
     return errorResponse(res, 'Unauthorized', 403)
  }

  successResponse(res, certificate, 'Certificate fetched successfully')
})
