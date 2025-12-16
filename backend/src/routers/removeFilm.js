import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { removeFilmFromGroupController } from '../controllers/removeFilmController.js'

router.delete('/remove_film', authMe, async (req, res) => {
  const user_id = req.user.user_id
  const group_id = req.query.group_id
  const movie_id = req.query.movie_id
  const media_type = req.query.media_type || 'movie'

  if (!group_id || !movie_id) {
    return res.status(400).json({ error: 'group_id and movie_id are required' })
  }

  try {
    const result = await removeFilmFromGroupController(user_id, group_id, movie_id, media_type)

    if (!result.success) {
      return res.status(403).json(result)
    }

    return res.status(200).json(result)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Failed to remove movie from group' })
  }
})

export default router
