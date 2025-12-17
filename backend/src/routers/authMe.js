import { Router } from 'express'
import { authMe, getCurrentUser } from '../controllers/authMeController.js'

const router = Router()

router.get('/me', authMe, getCurrentUser)

export default router
