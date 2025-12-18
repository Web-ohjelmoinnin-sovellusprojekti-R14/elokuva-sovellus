import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { getGroupDetailsController } from '../controllers/getGroupDetailsController.js'

import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 25,
  message: { error: 'Too much requests' },
})

router.get('/get_group_details', limiter, authMe, async (req, res) => {
  const group_id = req.query.group_id

  if (!group_id) {
    return res.status(400).json({ error: 'Group ID is not provided' })
  }

  try {
    const response = await getGroupDetailsController(group_id)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Failed to create group' })
  }
})

export default router
