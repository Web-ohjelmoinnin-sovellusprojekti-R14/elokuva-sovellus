import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { addFilmToGroupController } from '../controllers/addFilmController.js'
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too much requests to add film' },
})

router.post('/add_film', limiter, authMe, async (req, res) => {
  const user_id = req.user.user_id
  const group_id = req.query.group_id
  const movie_id = req.query.movie_id
  const media_type = req.query.media_type || 'movie'

  if (!group_id || !movie_id) {
    return res.status(400).json({ error: 'group_id and movie_id are required' })
  }

  const result = await addFilmToGroupController(user_id, group_id, movie_id, media_type)

  if (!result.success) {
    return res.status(400).json(result)
  }

  return res.status(200).json(result)
})

export default router
