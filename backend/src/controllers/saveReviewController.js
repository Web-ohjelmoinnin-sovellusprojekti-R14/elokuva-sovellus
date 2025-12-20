import pool from '../db.js'

async function saveReviewController(rating, user_id, movie_id, comment, media_type) {
  const filmCheck = await pool.query('SELECT * FROM Film WHERE film_id=$1', [movie_id])

  if (filmCheck.rows.length === 0) {
    await pool.query('INSERT INTO Film(film_id, name, description, release_date) VALUES ($1, $2, $3, $4)', [
      movie_id,
      'Unknown title',
      '',
      null,
    ])
  }

  const review = await pool.query('SELECT * FROM Review WHERE user_id=$1 AND movie_id=$2 AND media_type=$3', [
    user_id,
    movie_id,
    media_type,
  ])

  if (review.rows.length > 0) {
    await pool.query('UPDATE Review SET rating=$1, comment=$2 WHERE user_id=$3 AND movie_id=$4 AND media_type=$5', [
      rating,
      comment,
      user_id,
      movie_id,
      media_type,
    ])
    return { response: 'Review was edited successfully', review_id: review.rows[0].review_id }
  }

  const insertResult = await pool.query(
    'INSERT INTO Review (user_id, movie_id, rating, comment, created_at, media_type) VALUES ($1, $2, $3, $4, NOW(), $5) RETURNING review_id',
    [user_id, movie_id, rating, comment, media_type]
  )

  return { 
    response: 'Review saved successfully', 
    review_id: insertResult.rows[0].review_id 
  }
}

export { saveReviewController }
