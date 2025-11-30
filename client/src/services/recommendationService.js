import api from '../utils/api'

export const getRecommendations = async (type) => {
  const response = await api.get(`/recommendations${type ? `?type=${type}` : ''}`)
  return response.data.data
}

export const updatePreferences = async (preferences) => {
  const response = await api.put('/recommendations/preferences', preferences)
  return response.data.data
}
