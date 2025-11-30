import { User, NGO } from '../models/index.js'
import { generateToken, generateRefreshToken } from '../utils/jwt.js'
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js'

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

  // Create user
  const user = new User({
    email,
    password,
    firstName,
    lastName,
    phone,
    role: role || 'user',
  })

  await user.save()

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

  // Create user with ngo_admin role
  const user = new User({
    email,
    password,
    firstName,
    lastName,
    phone,
    role: 'ngo_admin',
  })

  await user.save()

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
