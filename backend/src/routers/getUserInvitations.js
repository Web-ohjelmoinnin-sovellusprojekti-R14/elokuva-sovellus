import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { getUserInvitationsController } from '../controllers/getUserInvitationsController.js'
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 25,
  message: { error: 'Too much requests' },
})

router.get('/get_invitations', limiter, authMe, async (req, res) => {
  const user_id = req.user.user_id

  try {
    const result = await getUserInvitationsController(user_id, res)
    return res.status(200).json(result)
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch invitations' })
  }
})

export default router
