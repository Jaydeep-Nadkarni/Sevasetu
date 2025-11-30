import User from '../models/User.js'
import Badge from '../models/Badge.js'
import Certificate from '../models/Certificate.js'
import { LEVELS, POINTS_CONFIG, BADGES } from '../config/gamification.js'

/**
 * Calculate points for a donation
 * @param {string} type - 'food', 'clothes', 'essentials', 'money'
 * @param {number} amount - Quantity or monetary amount
 * @returns {number} Points to award
 */
export const calculateDonationPoints = (type, amount = 1) => {
  switch (type) {
    case 'food':
      return POINTS_CONFIG.FOOD_DONATION * amount // Per donation or per item? Usually per donation event for items, but let's stick to fixed or simple multiplier
    case 'clothes':
      return POINTS_CONFIG.CLOTHES_DONATION
    case 'essentials':
      return POINTS_CONFIG.ESSENTIALS_DONATION
    case 'money':
      return Math.floor(amount * POINTS_CONFIG.MONEY_MULTIPLIER)
    case 'event':
      return POINTS_CONFIG.EVENT_ATTENDANCE
    default:
      return 0
  }
}

/**
 * Add points to a user and handle level progression
 * @param {string} userId - User ID
 * @param {number} points - Points to add
 * @param {string} source - Source of points (e.g., 'donation', 'event')
 * @returns {Object} Result with new points, level, and any new badges/certificates
 */
export const addPoints = async (userId, points, source) => {
  try {
    const user = await User.findById(userId)
    if (!user) throw new Error('User not found')

    const oldLevel = user.level || 1
    user.points = (user.points || 0) + points
    
    // Check for level up
    let newLevel = oldLevel
    // Find the highest level the user qualifies for
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (user.points >= LEVELS[i].minPoints) {
        newLevel = LEVELS[i].level
        break
      }
    }

    const result = {
      pointsAdded: points,
      totalPoints: user.points,
      oldLevel,
      newLevel,
      levelUp: newLevel > oldLevel,
      newBadges: [],
      newCertificate: null
    }

    if (result.levelUp) {
      user.level = newLevel
      
      // Assign Badge for the new level
      const levelConfig = LEVELS.find(l => l.level === newLevel)
      if (levelConfig && levelConfig.badge) {
        // Check if badge exists in DB, if not create it (or find by name)
        // For simplicity, we'll assume we look up by name from config
        // In a real app, you'd seed these badges
        
        // Let's try to find or create the badge based on our config
        // We map the config badge key to the BADGES object
        const badgeKey = Object.keys(BADGES).find(key => BADGES[key].name === levelConfig.name)
        if (badgeKey) {
            const badgeData = BADGES[badgeKey]
            let badge = await Badge.findOne({ name: badgeData.name })
            
            if (!badge) {
                badge = await Badge.create({
                    name: badgeData.name,
                    description: badgeData.description,
                    icon: badgeData.icon,
                    category: badgeData.category,
                    criteria: { type: 'custom', value: levelConfig.minPoints, description: `Reach level ${newLevel}` }
                })
            }

            // Add badge to user if not already there
            if (!user.badges.includes(badge._id)) {
                user.badges.push(badge._id)
                result.newBadges.push(badge)
            }
        }
      }

      // Generate Certificate
      const certificate = await Certificate.create({
        recipient: user._id,
        // We need an issuer. For system awards, we might need a placeholder or leave it null if schema allows.
        // Since schema requires issuer, let's find the first admin NGO or a system NGO.
        // For now, we'll try to find a "System" NGO or just pick one if it's a hackathon project.
        // Better approach: Make issuer optional in schema or use a specific ID.
        // I'll assume we can find a default NGO or create one.
        // For this implementation, I'll skip issuer validation if I modify the schema, 
        // but since I can't easily modify schema without migration in production, 
        // I'll try to find an NGO.
        issuer: user.ngoOwned || (await import('../models/NGO.js')).default.findOne().then(n => n?._id), 
        type: 'achievement',
        title: `Level Up: ${levelConfig.name}`,
        description: `Awarded for reaching Level ${newLevel} by earning ${user.points} points.`,
        issueDate: new Date(),
        isVerified: true
      })
      result.newCertificate = certificate
    }

    await user.save()
    return result
  } catch (error) {
    console.error('Error adding points:', error)
    throw error
  }
}
