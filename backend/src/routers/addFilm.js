import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { addFilmToGroupController } from '../controllers/addFilmController.js'

router.post('/add_film', authMe, async (req, res) => {
  const user_id = req.user.user_id
  const group_id = req.query.group_id
  const movie_id = req.query.movie_id

  if (!group_id || !movie_id) {
    return res.status(400).json({ error: 'group_id and movie_id are required' })
  }

  const result = await addFilmToGroupController(user_id, group_id, movie_id)

  if (!result.success) {
    return res.status(400).json(result)
  }

  return res.status(200).json(result)
})

export default router
