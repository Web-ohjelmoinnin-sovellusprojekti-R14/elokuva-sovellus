import { Router } from 'express'
const router = Router()
import { getReviewsByUserIdController, getReviewsByMovieIdController } from '../controllers/getReviewsController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

router.get('/get_reviews_by_user_id', authMiddleware, async (req, res) => {
  try {
    const user_id = req.token.user_id

    const response = await getReviewsByUserIdController(user_id)
    return res.status(201).json(response)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get reviews by User ID' })
  }
})

router.get('/get_reviews_by_movie_id', authMiddleware, async (req, res) => {
  try {
    const movie_id = req.query.movie_id
    const response = await getReviewsByMovieIdController(movie_id)
    return res.status(201).json(response)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get reviews by Movie ID' })
  }
})

export default router
