import { Router } from 'express'
import { getReviewsByUserIdController } from '../controllers/getReviewsController.js'
import { authMe } from '../controllers/authMeController.js'
import { withCache } from '../controllers/cacheWrapper.js'
import rateLimit from 'express-rate-limit'

const router = Router()

const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 25,
  message: { error: 'Too much requests' },
})

export const reviewsCache = new Map()

router.get('/get_reviews_by_user_id', limiter, authMe, async (req, res) => {
  try {
    const user_id = req.user.user_id
    const language = req.query.language || 'en-US'

    const cacheKey = `reviews:user:${user_id}:lang:${language}`

    const response = await withCache(reviewsCache, cacheKey, async () => {
      return await getReviewsByUserIdController(user_id, language)
    })

    return res.status(200).json(response)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to get reviews by User ID' })
  }
})

router.get('/get_reviews_by_movie_id', async (req, res) => {
  try {
    const movie_id = req.query.movie_id
    const media_type = req.query.media_type
    const response = await getReviewsByMovieIdController(movie_id, media_type)
    return res.status(201).json(response)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get reviews by Movie ID' })
  }
})

export default router
