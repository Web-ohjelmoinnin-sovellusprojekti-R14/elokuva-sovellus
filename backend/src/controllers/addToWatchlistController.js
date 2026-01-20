import pool from '../db.js'
import { watchlistCache } from './getWatchlistController.js'

async function addToWatchlistController(user_id, title_id, title_type, detailsProducer) {
  try {
    const existing = await pool.query('SELECT * FROM watchlist WHERE user_id=$1 AND title_id=$2 AND title_type=$3', [
      user_id,
      title_id,
      title_type,
    ])

    if (existing.rows.length !== 0) {
      return { status: 409, error: 'Movie is already on the list' }
    }

    const insertWatchlist = await pool.query(
      'INSERT INTO watchlist (user_id, title_id, title_type) VALUES ($1, $2, $3) RETURNING *',
      [user_id, title_id, title_type]
    )

    const row = insertWatchlist.rows[0]

    const cacheKey = `watchlist:${user_id}`
    const cached = watchlistCache.get(cacheKey)

    if (cached) {
      cached.promise = (async () => {
        const current = await cached.promise
        let details = null

        if (typeof detailsProducer === 'function') {
          try {
            details = await detailsProducer(title_id, title_type)
          } catch (e) {
            console.error('Failed to fetch details for cache update:', e)
          }
        }

        const newItem = {
          ...row,
          details,
        }

        return [...current, newItem]
      })()
    }

    return {
      response: 'Added movie to watchlist successfully',
      id: row.id,
    }
  } catch (err) {
    console.error('addToWatchlistController error:', err)
    return { status: 500, error: 'Failed to add movie to watchlist' }
  }
}

export { addToWatchlistController }
