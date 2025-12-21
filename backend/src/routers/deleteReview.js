import { Router } from 'express'
const router = Router()
import { deleteReviewController } from '../controllers/deleteReviewController.js'
import { authMe } from '../controllers/authMeController.js'
import { reviewsCache } from '../controllers/reviewService.js'

router.delete('/delete_review', authMe, async (req, res) => {
  try {
    const review_id = req.query.review_id
    const user_id = req.user.user_id
    const response = await deleteReviewController(review_id, user_id, res)

    const cacheKey = `user:${user_id}`
    if (reviewsCache.has(cacheKey)) {
      reviewsCache.delete(cacheKey)
    }

    return res.status(201).json(response)
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete review' })
  }
})

export default router
