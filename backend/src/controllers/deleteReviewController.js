import pool from '../db.js'
import dotenv from 'dotenv'
dotenv.config()

async function deleteReviewController(review_id, user_id, res) { 
  if (!review_id) {
    return res.status(400).json({ error: 'Review ID is not provided' })
  }

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is not provided' })
  }
  const review = await pool.query('SELECT * FROM "review" WHERE review_id=$1', [review_id])
  if (review.rows) {
    if (review.rows[0].user_id == user_id) {
      await pool.query('DELETE FROM "review" WHERE review_id=$1', [review_id])
      return { response: 'Review was successfully deleted' }
    } else {
      return res.status(403).json({ error: 'User is not allowed to delete this review' })
    }
  } else {
    return res.status(404).json({ error: 'Record is not found' })
  }
}
export { deleteReviewController }
