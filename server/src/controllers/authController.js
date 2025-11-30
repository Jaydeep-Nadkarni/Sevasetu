import { User, NGO } from '../models/index.js'
import { generateToken, generateRefreshToken } from '../utils/jwt.js'
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js'
import crypto from 'crypto'
import { sendEmail } from '../services/emailService.js'

/**
 * Register a new user (user or admin role)
 */
export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone, role } = req.body

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return errorResponse(res, 'Email already registered', 400)
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

  // Create user
  const user = new User({
    email,
    password,
    firstName,
    lastName,
    phone,
    role: role || 'user',
    verificationToken,
    verificationTokenExpire,
    isVerified: false
  })

  await user.save()

  // Send verification email
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`
  
  try {
    await sendEmail(
      user.email,
      'Welcome to SevaSetu! Please Verify Your Email',
      'welcome',
      {
        name: user.firstName,
        verificationUrl
      }
    )
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError)
    // We don't fail registration, but user might need to resend verification
  }

  // Generate tokens
  const accessToken = generateToken(user)
  const refreshToken = generateRefreshToken(user)

  // Return user data without password
  const userData = user.toObject()
  delete userData.password

  successResponse(
    res,
    {
      user: userData,
      accessToken,
      refreshToken,
    },
    'User registered successfully',
    201
  )
})

/**
 * Register a new NGO with its admin user
 */
export const registerNGO = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    phone,
    ngo: { name, description, mission, category, location, contact, registrationNumber },
  } = req.body

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return errorResponse(res, 'Email already registered', 400)
  }

  // Check if NGO name already exists
  const existingNGO = await NGO.findOne({ name })
  if (existingNGO) {
    return errorResponse(res, 'NGO name already exists', 400)
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000 // 24 hours

  // Create user with ngo_admin role
  const user = new User({
    email,
    password,
    firstName,
    lastName,
    phone,
    role: 'ngo_admin',
    verificationToken,
    verificationTokenExpire,
    isVerified: false
  })

  await user.save()

  // Send verification email
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`
  
  try {
    await sendEmail(
      user.email,
      'Welcome to SevaSetu! Please Verify Your Email',
      'welcome',
      {
        name: user.firstName,
        verificationUrl
      }
    )
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError)
  }

  // Create NGO with owner reference to the user
  const ngoData = new NGO({
    name,
    description,
    mission,
    category,
    owner: user._id,
    location: {
      address: location.address,
      city: location.city,
      state: location.state,
      coordinates: location.coordinates || [0, 0],
    },
    contact: {
      email: contact.email,
      phone: contact.phone,
      website: contact.website || '',
    },
    registrationNumber,
    verificationStatus: 'pending',
  })

  await ngoData.save()

  // Update user with ngoOwned reference
  user.ngoOwned = ngoData._id
  await user.save()

  // Generate tokens
  const accessToken = generateToken(user)
  const refreshToken = generateRefreshToken(user)

  // Return user and NGO data
  const userData = user.toObject()
  delete userData.password

  successResponse(
    res,
    {
      user: userData,
      ngo: ngoData.toObject(),
      accessToken,
      refreshToken,
    },
    'NGO registered successfully',
    201
  )
})

/**
 * Login user with email and password
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Find user by email and include password field
  const user = await User.findOne({ email }).select('+password')
  if (!user) {
    return errorResponse(res, 'Invalid email or password', 401)
  }

  // Check if user is active
  if (!user.isActive) {
    return errorResponse(res, 'User account is deactivated', 401)
  }

  // Verify password
  const isPasswordValid = await user.matchPassword(password)
  if (!isPasswordValid) {
    return errorResponse(res, 'Invalid email or password', 401)
  }

  // Generate tokens
  const accessToken = generateToken(user)
  const refreshToken = generateRefreshToken(user)

  // Return user data without password
  const userData = user.toObject()
  delete userData.password

  successResponse(
    res,
    {
      user: userData,
      accessToken,
      refreshToken,
    },
    'Login successful'
  )
})

/**
 * Verify JWT token validity
 */
export const verifyToken = asyncHandler(async (req, res) => {
  const { token } = req.body

  if (!token) {
    return errorResponse(res, 'Token is required', 400)
  }

  // Token is already verified by the middleware
  // Just return user data if we reach here
  const userData = req.user.toObject()
  delete userData.password

  successResponse(res, { user: userData }, 'Token is valid')
})

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return errorResponse(res, 'Refresh token is required', 400)
  }

  // Verify refresh token
  const { verifyToken } = await import('../utils/jwt.js')
  const decoded = verifyToken(refreshToken)

  if (!decoded || decoded.type !== 'refresh') {
    return errorResponse(res, 'Invalid refresh token', 401)
  }

  // Fetch user from database
  const user = await User.findById(decoded.id)
  if (!user) {
    return errorResponse(res, 'User no longer exists', 401)
  }

  // Generate new access token
  const newAccessToken = generateToken(user)

  successResponse(
    res,
    { accessToken: newAccessToken },
    'Token refreshed successfully'
  )
})

/**
 * Logout user (client-side token removal)
 */
export const logout = asyncHandler(async (req, res) => {
  // Token removal is handled on client side
  // This endpoint can be extended for token blacklisting in future

  successResponse(res, null, 'Logout successful')
})

/**
 * Get current authenticated user details
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  // req.user is already set by authenticate middleware
  const user = await User.findById(req.user._id)
    .populate('ngoOwned', 'name description category')
    .populate('badges', 'name category icon')

  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  const userData = user.toObject()
  delete userData.password

  successResponse(res, { user: userData }, 'User data retrieved successfully')
})

/**
 * Verify email address
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpire: { $gt: Date.now() },
  })

  if (!user) {
    return errorResponse(res, 'Invalid or expired verification token', 400)
  }

  user.isVerified = true
  user.verificationToken = undefined
  user.verificationTokenExpire = undefined
  await user.save()

  successResponse(res, null, 'Email verified successfully')
})

/**
 * Resend verification email
 */
export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })
  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  if (user.isVerified) {
    return errorResponse(res, 'Email already verified', 400)
  }

  // Generate new token
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000

  user.verificationToken = verificationToken
  user.verificationTokenExpire = verificationTokenExpire
  await user.save()

  // Send email
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`
  
  await sendEmail(
    user.email,
    'Verify Your Email - SevaSetu',
    'verification',
    {
      name: user.firstName,
      verificationUrl
    }
  )

  successResponse(res, null, 'Verification email sent')
})
