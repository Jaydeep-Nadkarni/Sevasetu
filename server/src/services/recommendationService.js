import model from '../config/gemini.js'
import User from '../models/User.js'
import Event from '../models/Event.js'
import NGO from '../models/NGO.js'
import HelpRequest from '../models/HelpRequest.js'
import Donation from '../models/Donation.js'

// Simple in-memory cache: { userId_type: { data: [], timestamp: number } }
const cache = new Map()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

export const getRecommendations = async (userId, type = 'all') => {
  const cacheKey = `${userId}_${type}`
  const cached = cache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const user = await User.findById(userId)
    .select('firstName lastName location preferences points level volunteerHours')
    .lean()

  if (!user) throw new Error('User not found')

  // Fetch user's donation history to understand preferences
  const donations = await Donation.find({ donor: userId })
    .populate('ngo', 'category name')
    .limit(10)
    .lean()

  const donationInterests = [...new Set(donations.map(d => d.ngo?.category).filter(Boolean))]
  
  // Combine explicit interests with implicit ones from donations
  const userProfile = {
    ...user,
    derivedInterests: [...new Set([...(user.preferences?.interests || []), ...donationInterests])]
  }

  let recommendations = {}

  if (type === 'all' || type === 'events') {
    recommendations.events = await recommendEvents(userProfile)
  }
  
  if (type === 'all' || type === 'ngos') {
    recommendations.ngos = await recommendNGOs(userProfile)
  }

  if (type === 'all' || type === 'helpRequests') {
    recommendations.helpRequests = await recommendHelpRequests(userProfile)
  }

  // Update cache
  cache.set(cacheKey, {
    data: type === 'all' ? recommendations : recommendations[type],
    timestamp: Date.now()
  })

  return type === 'all' ? recommendations : recommendations[type]
}

const recommendEvents = async (user) => {
  // Fetch upcoming events
  // Filter by location roughly first to reduce token usage if needed, 
  // but for now let's fetch a batch of upcoming events
  const candidates = await Event.find({ 
    status: 'upcoming',
    startDate: { $gte: new Date() }
  })
  .select('title description category location startDate ngo')
  .populate('ngo', 'name')
  .limit(20)
  .lean()

  if (candidates.length === 0) return []

  const prompt = `
    You are a recommendation engine.
    User Profile:
    - Location: ${user.location?.city}, ${user.location?.state}
    - Interests: ${user.derivedInterests.join(', ')}
    - Past Activity: Level ${user.level}, ${user.volunteerHours} volunteer hours.

    Candidate Events:
    ${JSON.stringify(candidates.map(c => ({
      id: c._id,
      title: c.title,
      category: c.category,
      city: c.location.city,
      date: c.startDate,
      ngo: c.ngo?.name
    })))}

    Task: Select the top 5 events most relevant to this user.
    Prioritize events in the user's city and matching their interests.
    Return ONLY a JSON array of object IDs strings. Example: ["id1", "id2"]
  `

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()
    const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim()
    const recommendedIds = JSON.parse(cleanedResponse)
    
    return candidates.filter(c => recommendedIds.includes(c._id.toString()))
  } catch (error) {
    console.error('Gemini Recommendation Error (Events):', error)
    // Fallback: simple filter
    return candidates.filter(c => 
      c.location.city === user.location?.city || 
      user.derivedInterests.includes(c.category)
    ).slice(0, 5)
  }
}

const recommendNGOs = async (user) => {
  const candidates = await NGO.find({ 
    isActive: true,
    verificationStatus: 'verified'
  })
  .select('name description category location mission')
  .limit(20)
  .lean()

  if (candidates.length === 0) return []

  const prompt = `
    You are a recommendation engine.
    User Profile:
    - Location: ${user.location?.city}
    - Interests: ${user.derivedInterests.join(', ')}

    Candidate NGOs:
    ${JSON.stringify(candidates.map(c => ({
      id: c._id,
      name: c.name,
      category: c.category,
      city: c.location.city,
      mission: c.mission
    })))}

    Task: Select the top 5 NGOs most relevant to this user.
    Prioritize NGOs in the user's city and matching their interests.
    Return ONLY a JSON array of object IDs strings.
  `

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()
    const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim()
    const recommendedIds = JSON.parse(cleanedResponse)
    
    return candidates.filter(c => recommendedIds.includes(c._id.toString()))
  } catch (error) {
    console.error('Gemini Recommendation Error (NGOs):', error)
    return candidates.filter(c => 
      c.location.city === user.location?.city || 
      user.derivedInterests.includes(c.category)
    ).slice(0, 5)
  }
}

const recommendHelpRequests = async (user) => {
  const candidates = await HelpRequest.find({ 
    status: 'open',
    verificationStatus: 'verified'
  })
  .select('title description category location urgency targetAmount amountRaised')
  .limit(20)
  .lean()

  if (candidates.length === 0) return []

  const prompt = `
    You are a recommendation engine.
    User Profile:
    - Location: ${user.location?.city}
    - Interests: ${user.derivedInterests.join(', ')}

    Candidate Help Requests:
    ${JSON.stringify(candidates.map(c => ({
      id: c._id,
      title: c.title,
      category: c.category,
      city: c.location.city,
      urgency: c.urgency,
      percentFunded: (c.amountRaised / c.targetAmount) * 100
    })))}

    Task: Select the top 5 help requests.
    Prioritize high urgency, proximity to user, and matching interests.
    Return ONLY a JSON array of object IDs strings.
  `

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()
    const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim()
    const recommendedIds = JSON.parse(cleanedResponse)
    
    return candidates.filter(c => recommendedIds.includes(c._id.toString()))
  } catch (error) {
    console.error('Gemini Recommendation Error (HelpRequests):', error)
    return candidates.filter(c => 
      c.urgency === 'critical' || 
      c.urgency === 'high' ||
      c.location.city === user.location?.city
    ).slice(0, 5)
  }
}

export const updateUserPreferences = async (userId, preferences) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { 'preferences.interests': preferences.interests, 'preferences.maxDistance': preferences.maxDistance } },
    { new: true }
  )
  
  // Invalidate cache
  const types = ['all', 'events', 'ngos', 'helpRequests']
  types.forEach(t => cache.delete(`${userId}_${t}`))
  
  return user.preferences
}
