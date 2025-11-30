// Example Controller
import User from '../models/User.js'
import { asyncHandler, successResponse, errorResponse } from '../utils/helpers.js'

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password')
  successResponse(res, users, 'Users fetched successfully')
})

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')

  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  successResponse(res, user, 'User fetched successfully')
})

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select('-password')

  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  successResponse(res, user, 'User updated successfully')
})

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id)

  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  successResponse(res, null, 'User deleted successfully')
})
