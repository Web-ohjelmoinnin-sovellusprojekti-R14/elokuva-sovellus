import { Router } from 'express'
import { saveReviewController } from '../controllers/saveReviewController.js'
import { authMe } from '../controllers/authMeController.js'

const router = Router()

import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: 'Too much save review requests, try again later' },
})

router.post('/save_review', limiter, authMe, async (req, res) => {
  try {
    const { user_id } = req.user
    const { rating, movie_id, comment, media_type } = req.body

    if (!movie_id) return res.status(400).json({ error: 'movie_id is required' })

    const result = await saveReviewController(rating, user_id, movie_id, comment, media_type)
    return res.status(201).json(result)
  } catch (err) {
    console.error('save_review error:', err)
    return res.status(400).json({ error: err.message || 'Failed to save review' })
  }
})

export default router
