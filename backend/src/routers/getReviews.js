import { Router } from 'express'
import { getReviewsByUserIdController, getReviewsByMovieIdController } from '../controllers/getReviewsController.js'
import { authMe } from '../controllers/authMeController.js'
import { withCache } from '../controllers/cacheWrapper.js'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const router = Router()

const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 25,
  message: { error: 'Too much requests' },
})

export const reviewsCache = new Map()

router.get(
  '/get_reviews_by_user_id',
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  }),
  limiter,
  authMe,
  async (req, res) => {
    try {
      const user_id = req.user.user_id
      const response = await getReviewsByUserIdController(user_id)
      return res.status(200).json(response)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to get reviews by User ID' })
    }
  }
)

router.get(
  '/get_external_reviews_by_user_id',
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  }),
  limiter,
  async (req, res) => {
    try {
      if (!req.query.user_id) {
        return res.status(400).json({ error: 'UserID is not provided' })
      }
      const user_id = req.query.user_id
      const response = await getReviewsByUserIdController(user_id)
      return res.status(200).json(response)
    } catch (err) {
      return res.status(500).json({ error: 'Failed to get reviews by User ID' })
    }
  }
)

router.get('/get_reviews_by_movie_id', async (req, res) => {
  try {
    const { movie_id, media_type } = req.query
    const reviews = await getReviewsByMovieIdController(movie_id, media_type)
    res.json(reviews)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

export default router
