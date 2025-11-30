import express from 'express'
import { listNGOs, getNGOById } from '../controllers/ngoController.js'

const router = express.Router()

router.get('/', listNGOs)
router.get('/:id', getNGOById)

export default router
