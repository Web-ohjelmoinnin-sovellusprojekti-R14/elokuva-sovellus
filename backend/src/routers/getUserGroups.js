import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { getUserGroupsController } from '../controllers/getUserGroupsController.js'

import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 25,
  message: { error: 'Too much requests' },
})

router.get('/get_user_groups', limiter, authMe, async (req, res) => {
  const user_id = req.user.user_id

  try {
    const groups = await getUserGroupsController(user_id)
    return res.status(200).json(groups)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Failed to fetch user groups' })
  }
})

export default router
