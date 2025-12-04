import { Router } from 'express'
const router = Router()
import { saveReviewController } from '../controllers/saveReviewController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

router.post('/save_review', authMiddleware, async (req, res) => {
  try {
    const user_id = req.token.user_id
    const rating = req.body.rating
    const movie_id = req.body.movie_id
    const comment = req.body.comment || ''

    const response = await saveReviewController(rating, user_id, movie_id, comment, res)
    return res.status(201).json(response)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save review' })
  }
})

export default router
