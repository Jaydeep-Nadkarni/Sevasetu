import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { getPersonalizedRecommendations, updatePreferences } from '../controllers/recommendationController.js'

const router = express.Router()

router.use(authenticate)

router.get('/', getPersonalizedRecommendations)
router.put('/preferences', updatePreferences)

export default router
