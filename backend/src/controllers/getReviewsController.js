import pool from '../db.js'
import dotenv from 'dotenv'
import { getTitleDetails } from './getTitleDetailsController.js'
dotenv.config()
import pLimit from 'p-limit'

const limit = pLimit(5)

async function getReviewsByMovieIdControllerSSE(movie_id, media_type) {
  if (!movie_id || !media_type) {
    throw new Error('movie_id or media_type missing')
  }

  const response = await pool.query(
    `SELECT r.*, u.username
     FROM "review" r
     JOIN "User" u ON r.user_id = u.user_id
     WHERE r.movie_id = $1 AND r.media_type = $2`,
    [movie_id, media_type]
  )

  return response.rows
}

async function getReviewsByUserIdController(user_id) {
  if (!user_id) throw new Error('User ID is not provided')

  const userRes = await pool.query('SELECT username FROM "User" WHERE user_id = $1', [user_id])

  const reviewsRes = await pool.query('SELECT * FROM "review" WHERE user_id = $1', [user_id])

  return {
    username: userRes.rows[0]?.username ?? null,
    rows: reviewsRes.rows,
  }
}

async function getReviewsByMovieIdController(movie_id, media_type) {
  if (!movie_id) {
    throw new Error('Movie ID is not provided')
  }
  if (!media_type) {
    throw new Error('Media type is not provided')
  }

  const response = await pool.query(
    `SELECT r.*, u.username
     FROM "review" r
     JOIN "User" u ON r.user_id = u.user_id
     WHERE r.movie_id = $1 AND r.media_type = $2`,
    [movie_id, media_type]
  )

  return response.rows
}

export { getReviewsByUserIdController, getReviewsByMovieIdController, getReviewsByMovieIdControllerSSE }
