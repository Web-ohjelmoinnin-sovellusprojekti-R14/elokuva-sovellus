import pool from '../db.js'
import dotenv from 'dotenv'
import { getTitleDetails } from './getTitleDetailsController.js'
dotenv.config()
import pLimit from 'p-limit'

const limit = pLimit(10)

async function getReviewsByUserIdController(user_id, language) {
  if (!user_id) {
    throw new Error('User ID is not provided')
  }

  const response = await pool.query('SELECT * FROM "review" WHERE user_id=$1', [user_id])
  const detailedResponse = await Promise.all(
    response.rows.map(async item =>
      limit(async () => {
        const details = await getTitleDetails(item.movie_id, item.media_type, language)
        return { ...item, details }
      })
    )
  )
  return detailedResponse
}

async function getReviewsByMovieIdController(movie_id, media_type) {
  if (!movie_id) {
    throw new Error('Movie ID is not provided')
  }
  if (!media_type) {
    return res.status(400).json({ error: 'Media type is not provided' })
  }

  const response = await pool.query(
    `SELECT r.*, u.username
     FROM "review" r
     JOIN "User" u ON r.user_id = u.user_id
     WHERE r.movie_id = $1 AND r.media_type=$2`,
    [movie_id, media_type]
  )

  //const filteredResponse = response.rows.filter(item => item.comment)
  //return filteredResponse
  return response.rows
}

export { getReviewsByUserIdController, getReviewsByMovieIdController }
