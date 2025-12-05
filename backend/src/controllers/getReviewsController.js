import pool from '../db.js'
import dotenv from 'dotenv'
dotenv.config()

async function getReviewsByUserIdController(user_id) {
  if (!user_id) {
    return res.status(400).json({ error: 'User ID is not provided' })
  }

  const response = await pool.query('SELECT * FROM "review" WHERE user_id=$1', [user_id])

  return response.rows
}

async function getReviewsByMovieIdController(movie_id, media_type) {
  if (!movie_id) {
    return res.status(400).json({ error: 'Movie ID is not provided' })
  }
  if (!media_type) {
    return res.status(400).json({ error: 'Movie ID is not provided' })
  }

  const response = await pool.query(
    `SELECT r.*, u.username
   FROM "review" r
   JOIN "User" u ON r.user_id = u.user_id
   WHERE r.movie_id = $1 AND r.media_type=$2`,
    [movie_id, media_type]
  )

  const filteredResponse = response.rows.filter(item => item.comment)

  return filteredResponse
}

export { getReviewsByUserIdController, getReviewsByMovieIdController }
