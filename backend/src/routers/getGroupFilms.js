import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { getGroupFilmsController } from '../controllers/getGroupFilmsController.js'

import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 25,
  message: { error: 'Too much requests' },
})

router.get('/get_group_films', limiter, authMe, async (req, res) => {
  const user_id = req.user.user_id
  const group_id = req.query.group_id

  if (!group_id) {
    return res.status(400).json({ error: 'group_id is required' })
  }

  try {
    const result = await getGroupFilmsController(user_id, group_id)

    if (!result.success) {
      if (result.message === 'Group not found') {
        return res.status(404).json(result)
      }
      return res.status(403).json(result)
    }

    return res.status(200).json(result.films)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Failed to fetch group films' })
  }
})

export default router
