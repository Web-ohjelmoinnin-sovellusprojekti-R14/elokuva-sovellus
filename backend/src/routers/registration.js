import { Router } from 'express'
const router = Router()
import { registrationController } from '../controllers/registrationController.js'
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: 'Too much registration attempts, try in 15 minutes',
  },
})

router.post('/register', limiter, registrationController)

export default router
