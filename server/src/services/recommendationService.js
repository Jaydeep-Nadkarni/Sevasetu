import model from '../config/gemini.js'
import User from '../models/User.js'
import Event from '../models/Event.js'
import NGO from '../models/NGO.js'
import HelpRequest from '../models/HelpRequest.js'
import Donation from '../models/Donation.js'

// Simple in-memory cache: { userId_type: { data: [], timestamp: number } }
const cache = new Map()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export const getRecommendations = async (userId, type = 'all') => {
  const cacheKey = `${userId}_${type}`
  const cached = cache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const user = await User.findById(userId)
    .select('firstName lastName location preferences points level volunteerHours pastDonations')
    .lean()

  if (!user) throw new Error('User not found')

  // Fetch user's donation history to understand preferences
  const donations = await Donation.find({ donor: userId })
    .populate('ngo', 'category name')
    .limit(10)
    .lean()

  const donationInterests = [...new Set(donations.map(d => d.ngo?.category).filter(Boolean))]
  const donationFrequency = donations.length / Math.max(1, (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24 * 30)) // donations per month
  
  // Combine explicit interests with implicit ones from donations
  const userProfile = {
    ...user,
    derivedInterests: [...new Set([...(user.preferences?.interests || []), ...donationInterests])],
    donationFrequency,
    recentDonationCount: donations.length,
    activityLevel: user.level || 1,
    volunteerCommitment: user.volunteerHours || 0
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

  // Add location-based nearby NGOs
  if (type === 'all' || type === 'nearbyNGOs') {
    recommendations.nearbyNGOs = await recommendNearbyNGOs(userProfile)
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
  const candidates = await Event.find({ 
    status: 'upcoming',
    startDate: { $gte: new Date() }
  })
  .select('title description category location startDate ngo')
  .populate('ngo', 'name')
  .limit(20)
  .lean()

  if (candidates.length === 0) return []

  const userLocationContext = user.location?.city 
    ? `User is from ${user.location.city}, ${user.location.state}`
    : 'User location not specified'

  const prompt = `
    You are a recommendation engine.
    User Profile:
    - ${userLocationContext}
    - Interests: ${user.derivedInterests.join(', ') || 'General'}
    - Activity Level: ${user.activityLevel}
    - Past Events Attended: ${user.volunteerCommitment} hours volunteered
    - Donation Activity: ${user.recentDonationCount} recent donations

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
    Prioritize:
    1. Events in the user's city
    2. Events matching their interests
    3. Events that match their activity level
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
  .select('name description category location mission rating')
  .limit(20)
  .lean()

  if (candidates.length === 0) return []

  const userLocationContext = user.location?.city 
    ? `User is from ${user.location.city}, ${user.location.state}`
    : 'User location not specified'

  const prompt = `
    You are a recommendation engine.
    User Profile:
    - ${userLocationContext}
    - Interests: ${user.derivedInterests.join(', ') || 'General'}
    - Donation Frequency: ${user.donationFrequency?.toFixed(2) || 0} donations per month
    - Recent Donation Count: ${user.recentDonationCount}

    Candidate NGOs:
    ${JSON.stringify(candidates.map(c => ({
      id: c._id,
      name: c.name,
      category: c.category,
      city: c.location?.city,
      mission: c.mission,
      rating: c.rating || 4.5
    })))}

    Task: Select the top 5 NGOs most relevant to this user.
    Prioritize:
    1. NGOs in the user's city
    2. NGOs matching their interests
    3. Well-rated NGOs
    4. High-impact organizations
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
      c.location?.city === user.location?.city || 
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

  const userLocationContext = user.location?.city 
    ? `User is from ${user.location.city}, ${user.location.state}`
    : 'User location not specified'

  const prompt = `
    You are a recommendation engine.
    User Profile:
    - ${userLocationContext}
    - Interests: ${user.derivedInterests.join(', ') || 'General'}
    - Donation Activity: ${user.recentDonationCount} recent donations
    - Activity Level: ${user.activityLevel}

    Candidate Help Requests:
    ${JSON.stringify(candidates.map(c => ({
      id: c._id,
      title: c.title,
      category: c.category,
      city: c.location?.city,
      urgency: c.urgency,
      percentFunded: ((c.amountRaised / c.targetAmount) * 100).toFixed(0)
    })))}

    Task: Select the top 5 help requests.
    Prioritize:
    1. High urgency requests (critical > high > medium)
    2. Proximity to user (same city preferred)
    3. Matching interests
    4. Low funding progress (more help needed)
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
      c.location?.city === user.location?.city
    ).slice(0, 5)
  }
}

const recommendNearbyNGOs = async (user) => {
  // Get all verified NGOs
  const candidates = await NGO.find({ 
    isActive: true,
    verificationStatus: 'verified'
  })
  .select('name description category location mission rating volunteers')
  .limit(50)
  .lean()

  if (candidates.length === 0) return []

  // If user has location coordinates, use distance-based filtering
  if (user.location?.coordinates && Array.isArray(user.location.coordinates)) {
    const [userLon, userLat] = user.location.coordinates
    
    // Calculate distance for each NGO
    const candidatesWithDistance = candidates
      .map(ngo => {
        if (ngo.location?.coordinates && Array.isArray(ngo.location.coordinates)) {
          const [ngoLon, ngoLat] = ngo.location.coordinates
          const distance = calculateDistance(userLat, userLon, ngoLat, ngoLon)
          return { ...ngo, distance }
        }
        // If no coordinates, use city proximity
        if (ngo.location?.city === user.location?.city) {
          return { ...ngo, distance: 0 }
        }
        return { ...ngo, distance: Infinity }
      })
      .filter(ngo => ngo.distance <= (user.preferences?.maxDistance || 50)) // Default 50km radius
      .sort((a, b) => a.distance - b.distance)

    if (candidatesWithDistance.length === 0) return []

    const userLocationContext = `User is from ${user.location.city}, ${user.location.state} (coordinates provided for distance calculation)`

    const prompt = `
      You are a location-aware recommendation engine.
      User Profile:
      - ${userLocationContext}
      - Interests: ${user.derivedInterests.join(', ') || 'General'}
      - Search Radius: ${user.preferences?.maxDistance || 50}km
      - Donation Frequency: ${user.donationFrequency?.toFixed(2) || 0} donations per month

      Nearby NGO Candidates (sorted by distance):
      ${JSON.stringify(candidatesWithDistance.slice(0, 15).map(c => ({
        id: c._id,
        name: c.name,
        category: c.category,
        city: c.location?.city,
        distance: c.distance?.toFixed(2) + ' km',
        mission: c.mission,
        rating: c.rating || 4.5,
        volunteers: c.volunteers || 0
      })))}

      Task: Select the top 5 nearest NGOs most relevant to this user.
      Prioritize:
      1. Distance (closest first)
      2. Category match with user interests
      3. NGO rating and impact
      4. Active volunteer community
      Return ONLY a JSON array of object IDs strings.
    `

    try {
      const result = await model.generateContent(prompt)
      const response = result.response.text()
      const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim()
      const recommendedIds = JSON.parse(cleanedResponse)
      
      return candidatesWithDistance
        .filter(c => recommendedIds.includes(c._id.toString()))
        .map(({ distance, ...ngo }) => ({ ...ngo, distance })) // Keep distance for display
    } catch (error) {
      console.error('Gemini Recommendation Error (NearbyNGOs):', error)
      // Fallback: return nearest NGOs that match interests
      return candidatesWithDistance
        .filter(c => user.derivedInterests.includes(c.category))
        .slice(0, 5)
    }
  }

  // Fallback: city-based recommendations if no coordinates
  const candidatesWithCity = candidates
    .map(ngo => ({
      ...ngo,
      isSameCity: ngo.location?.city === user.location?.city
    }))
    .sort((a, b) => (b.isSameCity ? 1 : 0) - (a.isSameCity ? 1 : 0))

  const prompt = `
    You are a recommendation engine.
    User Profile:
    - Location: ${user.location?.city}, ${user.location?.state}
    - Interests: ${user.derivedInterests.join(', ') || 'General'}
    - Donation Activity: ${user.recentDonationCount} recent donations

    Nearby NGO Candidates (in user's city):
    ${JSON.stringify(candidatesWithCity.slice(0, 15).map(c => ({
      id: c._id,
      name: c.name,
      category: c.category,
      city: c.location?.city,
      mission: c.mission,
      rating: c.rating || 4.5,
      sameCity: c.isSameCity
    })))}

    Task: Select the top 5 NGOs in the user's area.
    Prioritize:
    1. Same city (if available)
    2. Category match
    3. High ratings
    Return ONLY a JSON array of object IDs strings.
  `

  try {
    const result = await model.generateContent(prompt)
    const response = result.response.text()
    const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim()
    const recommendedIds = JSON.parse(cleanedResponse)
    
    return candidatesWithCity.filter(c => recommendedIds.includes(c._id.toString()))
  } catch (error) {
    console.error('Gemini Recommendation Error (NearbyNGOs Fallback):', error)
    return candidatesWithCity
      .filter(c => c.isSameCity || user.derivedInterests.includes(c.category))
      .slice(0, 5)
  }
}

export const updateUserPreferences = async (userId, preferences) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { 'preferences.interests': preferences.interests, 'preferences.maxDistance': preferences.maxDistance } },
    { new: true }
  )
  
  // Invalidate cache
  const types = ['all', 'events', 'ngos', 'helpRequests', 'nearbyNGOs']
  types.forEach(t => cache.delete(`${userId}_${t}`))
  
  return user.preferences
}
