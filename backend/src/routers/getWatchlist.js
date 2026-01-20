import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import { authMe } from '../controllers/authMeController.js'
import { getWatchlistController } from '../controllers/getWatchlistController.js'

const router = Router()

const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 25,
  message: { error: 'Too much requests' },
})

router.get(
  '/get_watchlist',
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
  limiter,
  authMe,
  async (req, res) => {
    const user_id = req.user.user_id
    const language = req.query.language || 'en-US'

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is not provided' })
    }

    const response = await getWatchlistController(user_id, language)

    if (response && response.error) {
      return res.status(response.status || 500).json({ error: response.error })
    }

    return res.status(200).json(response)
  }
)

export default router
