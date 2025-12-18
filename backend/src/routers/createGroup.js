import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { createGroupController } from '../controllers/createGroupController.js'

import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too much groups created, try again later' },
})

router.post('/create_group', limiter, authMe, async (req, res) => {
  const name = req.query.name
  const description = req.query.description || null
  const owner_id = req.user.user_id
  try {
    const response = await createGroupController(name, description, owner_id, res)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Failed to create group' })
  }
})

export default router
