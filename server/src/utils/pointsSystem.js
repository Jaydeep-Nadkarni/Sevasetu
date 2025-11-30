import User from '../models/User.js'
import Badge from '../models/Badge.js'
import Certificate from '../models/Certificate.js'
import { LEVELS, POINTS_CONFIG, BADGES } from '../config/gamification.js'
import { generateCertificatePDF } from './certificateGenerator.js'

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
 * @param {Object} io - Socket.IO instance for real-time updates (optional)
 * @returns {Object} Result with new points, level, and any new badges/certificates
 */
export const addPoints = async (userId, points, source, io = null) => {
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
      if (levelConfig) {
        // Find badge from BADGES config matching the level name
        const badgeKey = Object.keys(BADGES).find(key => 
          BADGES[key].name === levelConfig.name
        )
        
        if (badgeKey) {
          const badgeData = BADGES[badgeKey]
          let badge = await Badge.findOne({ name: badgeData.name })
          
          // If badge doesn't exist, create it
          if (!badge) {
            badge = await Badge.create({
              name: badgeData.name,
              description: badgeData.description,
              icon: badgeData.icon,
              category: badgeData.category,
              criteria: { 
                type: 'level', 
                value: levelConfig.minPoints, 
                description: `Reach level ${newLevel}` 
              }
            })
          }

          // Add badge to user if not already there
          if (!user.badges || !user.badges.includes(badge._id)) {
            if (!user.badges) user.badges = []
            user.badges.push(badge._id)
            result.newBadges.push(badge)
          }
        }
      }

      // Generate Certificate if we can find an issuer
      try {
        const { NGO } = await import('../models/index.js')
        
        // Try to find a system NGO or use the first NGO
        let issuerNgoId = null
        const systemNgo = await NGO.findOne({ isSystem: true })
        if (systemNgo) {
          issuerNgoId = systemNgo._id
        } else {
          const anyNgo = await NGO.findOne()
          if (anyNgo) {
            issuerNgoId = anyNgo._id
          }
        }

        if (issuerNgoId) {
          const levelConfig = LEVELS.find(l => l.level === newLevel)
          const certificate = await Certificate.create({
            recipient: user._id,
            issuer: issuerNgoId,
            type: 'achievement',
            title: `Level Up: ${levelConfig.name}`,
            description: `Awarded for reaching Level ${newLevel} by earning ${user.points} points.`,
            issueDate: new Date(),
            isVerified: true
          })

          // Generate PDF and update certificate
          try {
            const pdfUrl = await generateCertificatePDF(certificate, user)
            certificate.certificateUrl = pdfUrl
            await certificate.save()
          } catch (err) {
            console.error('Failed to generate certificate PDF:', err)
            // Don't fail if PDF generation fails, certificate still exists
          }

          result.newCertificate = certificate
        }
      } catch (err) {
        console.error('Failed to create certificate:', err)
        // Non-critical error, don't fail the points addition
      }
    }

    await user.save()

    // Emit Socket.IO event for real-time updates
    if (io && result.levelUp) {
      io.to(`user:${userId}`).emit('points:earned', {
        userId,
        pointsAdded: points,
        totalPoints: result.totalPoints,
        levelUp: true,
        newLevel: result.newLevel,
        oldLevel: result.oldLevel,
        source,
        newBadges: result.newBadges,
        newCertificate: result.newCertificate
      })
    } else if (io) {
      // Emit even if no level up so client can update progress
      io.to(`user:${userId}`).emit('points:earned', {
        userId,
        pointsAdded: points,
        totalPoints: result.totalPoints,
        levelUp: false,
        newLevel: result.newLevel,
        source
      })
    }

    return result
  } catch (error) {
    console.error('Error adding points:', error)
    throw error
  }
}
