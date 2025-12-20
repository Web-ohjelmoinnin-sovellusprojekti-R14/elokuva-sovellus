import pool from '../db.js'
import { getTitleDetails } from './getTitleDetailsController.js'
import pLimit from 'p-limit'

const limit = pLimit(10)

export const reviewsCache = new Map()
export const detailsCache = new Map()

export async function getUserReviews(user_id) {
  const cacheKey = `user:${user_id}`

  if (reviewsCache.has(cacheKey)) {
    return reviewsCache.get(cacheKey)
  }

  const res = await pool.query(
    'SELECT * FROM "review" WHERE user_id = $1 ORDER BY created_at DESC',
    [user_id]
  )

  reviewsCache.set(cacheKey, res.rows)
  return res.rows
}

export async function enrichReview(review, language) {
  const cacheKey = `${review.movie_id}:${review.media_type}:${language}`

  if (detailsCache.has(cacheKey)) {
    return { ...review, details: detailsCache.get(cacheKey) }
  }

  return limit(async () => {
    const details = await getTitleDetails(
      review.movie_id,
      review.media_type,
      language
    )

    detailsCache.set(cacheKey, details)
    return { ...review, details }
  })
}
