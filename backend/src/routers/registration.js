import { Router } from 'express'
const router = Router()
import { registrationController } from '../controllers/registrationController.js'

router.post('/register', registrationController)

export default router
