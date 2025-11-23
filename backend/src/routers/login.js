import { Router } from 'express'
const router = Router()
import { loginController } from '../controllers/loginController.js'

router.post('/login', loginController)

export default router
