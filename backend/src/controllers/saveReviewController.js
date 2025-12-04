import pool from '../db.js'
import dotenv from 'dotenv'
dotenv.config()

async function saveReviewController(rating, user_id, movie_id, comment, res) {
  if (!user_id) {
    return res.status(400).json({ error: 'User ID is not provided' })
  }

  if (!rating) {
    return res.status(400).json({ error: 'Rating is not provided' })
  }

  if (!movie_id) {
    return res.status(400).json({ error: 'Movie ID is not provided' })
  }

  const review = await pool.query('SELECT * FROM "review" WHERE user_id=$1 AND movie_id=$2', [user_id, movie_id])

  if (review.rows.length > 0) {
    await pool.query('UPDATE "review" SET rating=$1, comment=$2 WHERE user_id=$3 AND movie_id=$4', [
      rating,
      comment,
      user_id,
      movie_id,
    ])
    return { response: 'Review was edited successfully' }
  }
  await pool.query(
    'INSERT INTO "review" (user_id, movie_id, rating, comment, created_at) VALUES ($1, $2, $3, $4, NOW())',
    [user_id, movie_id, rating, comment]
  )

  return { response: 'Database record was successfully' }
}
export { saveReviewController }
