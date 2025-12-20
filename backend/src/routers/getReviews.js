import { Router } from 'express'
import { getReviewsByUserIdController } from '../controllers/getReviewsController.js'
import { authMe } from '../controllers/authMeController.js'
import { withCache } from '../controllers/cacheWrapper.js'
import rateLimit from 'express-rate-limit'
import cors from 'cors'

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
    origin: 'http://localhost:3000',
    credentials: true,
  }),
  limiter,
  authMe,
  (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    req.socket.setTimeout(1000 * 60 * 5)

    const user_id = req.user.user_id
    const language = req.query.language || 'en-US'

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\n`)
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }

    const streamReviews = async () => {
      try {
        const cacheKey = `reviews:user:${user_id}:lang:${language}`
        const dbResponse = await withCache(reviewsCache, cacheKey, async () => {
          return await getReviewsByUserIdController(user_id, language, false)
        })

        const totalReviews = dbResponse.length
        sendEvent('total', { total: totalReviews })

        let loaded = 0
        for (const item of dbResponse) {
          const detailedItem = await getReviewsByUserIdController(user_id, language, true, item)

          loaded++
          sendEvent('review', detailedItem)
          sendEvent('progress', {
            loaded,
            total: totalReviews,
            progress: Math.round((loaded / totalReviews) * 100),
          })

          await new Promise(resolve => setTimeout(resolve, 10))
        }

        sendEvent('complete', { complete: true })
        res.end()
      } catch (err) {
        console.error(err)
        sendEvent('error', { error: 'Failed to get reviews' })
        res.end()
      }
    }

    streamReviews()

    req.on('close', () => {
      console.log('SSE Client disconnected')
      res.end()
    })
  }
)

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
