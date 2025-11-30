import express from 'express'
import { listNGOs, getNGOById, updateNGOStatus } from '../controllers/ngoController.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

router.get('/', listNGOs)
router.get('/:id', getNGOById)
router.put('/:id/status', authenticate, authorize('admin'), updateNGOStatus)

export default router
