import { getRecommendations, updateUserPreferences } from '../services/recommendationService.js'
import { asyncHandler, successResponse } from '../utils/helpers.js'

// @desc    Get personalized recommendations
// @route   GET /api/recommendations
// @access  Private
export const getPersonalizedRecommendations = asyncHandler(async (req, res) => {
  const { type } = req.query // 'events', 'ngos', 'helpRequests', or undefined for all
  const recommendations = await getRecommendations(req.user._id, type)
  
  successResponse(res, recommendations, 'Recommendations fetched successfully')
})

// @desc    Update recommendation preferences
// @route   PUT /api/recommendations/preferences
// @access  Private
export const updatePreferences = asyncHandler(async (req, res) => {
  const { interests, maxDistance } = req.body
  
  const preferences = await updateUserPreferences(req.user._id, { interests, maxDistance })
  
  successResponse(res, preferences, 'Preferences updated successfully')
})
