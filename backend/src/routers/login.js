import { Router } from 'express'
const router = Router()
import { loginController } from '../controllers/loginController.js'

import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too much login attempts, try again later' },
})

router.post('/login', limiter, loginController)

export default router
