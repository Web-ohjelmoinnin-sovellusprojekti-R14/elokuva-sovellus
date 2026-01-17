import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import { authMe } from '../controllers/authMeController.js'
import { getReviewsByUserIdSSE } from '../controllers/reviewsSSEController.js'

const router = Router()

const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 25,
  message: { error: 'Too much requests' },
})

router.get(
  '/get_reviews_by_user_id_sse',
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
  limiter,
  authMe,
  getReviewsByUserIdSSE
)

router.get(
  '/get_others_reviews_by_user_id_sse',
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
  limiter,
  async (req, res) => {
    if (!req.query.user_id) {
      return res.status(400).json({ error: 'User ID is not provided' })
    }
    req.user = { user_id: req.query.user_id }
    getReviewsByUserIdSSE(req, res)
  }
)

export default router
