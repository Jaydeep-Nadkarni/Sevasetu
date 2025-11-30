import express from 'express'
import { protect } from '../middleware/auth.js'
import { getPersonalizedRecommendations, updatePreferences } from '../controllers/recommendationController.js'

const router = express.Router()

router.use(protect)

router.get('/', getPersonalizedRecommendations)
router.put('/preferences', updatePreferences)

export default router
