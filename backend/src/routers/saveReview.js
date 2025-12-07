import { Router } from 'express'
const router = Router()
import { saveReviewController } from '../controllers/saveReviewController.js'
import { authMe } from '../controllers/authMeController.js'

router.post('/save_review', authMe, async (req, res) => {
  try {
    const user_id = req.user.user_id
    const rating = req.body.rating
    const movie_id = req.body.movie_id
    const comment = req.body.comment || ''
    const media_type = req.body.media_type

    const response = await saveReviewController(rating, user_id, movie_id, comment, media_type, res)
    return res.status(201).json(response)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save review' })
  }
})

export default router
