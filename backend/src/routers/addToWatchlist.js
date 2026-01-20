import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authMe } from '../controllers/authMeController.js'
import { addToWatchlistController } from '../controllers/addToWatchlistController.js'
import { getMovieDetails, getTvDetails } from '../tmdbClient.js'

const router = Router()

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too much requests to add film' },
})

router.post('/add_to_watchlist', limiter, authMe, async (req, res) => {
  const user_id = req.user.user_id
  const title_id = req.query.title_id || null
  const title_type = req.query.title_type || null
  const language = req.query.language || 'en-US'

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is not provided' })
  }

  if (!title_id) {
    return res.status(400).json({ error: 'Title ID is not provided' })
  }

  if (!title_type) {
    return res.status(400).json({ error: 'Title type is not provided' })
  }

  const detailsProducer = async (id, type, language) => {
    if (type === 'movie') {
      return getMovieDetails(id, language)
    }
    return getTvDetails(id, language)
  }

  const result = await addToWatchlistController(user_id, title_id, title_type, detailsProducer)

  if (result.error) {
    return res.status(result.status).json({ error: result.error })
  }

  return res.status(200).json(result)
})

export default router
