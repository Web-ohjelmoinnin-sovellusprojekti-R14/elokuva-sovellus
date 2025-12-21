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

export default router
