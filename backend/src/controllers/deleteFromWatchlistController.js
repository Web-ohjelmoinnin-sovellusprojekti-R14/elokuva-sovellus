import pool from '../db.js'
import { watchlistCache } from './getWatchlistController.js'

async function deleteFromWatchlistController(user_id, title_id, title_type) {
  try {
    const existing = await pool.query('SELECT * FROM watchlist WHERE user_id=$1 AND title_id=$2 AND title_type=$3', [
      user_id,
      title_id,
      title_type,
    ])

    if (existing.rows.length === 0) {
      return { status: 404, error: 'Movie is not present on the list' }
    }

    await pool.query('DELETE FROM watchlist WHERE user_id=$1 AND title_id=$2 AND title_type=$3', [
      user_id,
      title_id,
      title_type,
    ])

    const cacheKey = `watchlist:${user_id}`
    const cached = watchlistCache.get(cacheKey)

    if (cached) {
      cached.promise = (async () => {
        const current = await cached.promise

        const filtered = current.filter(
          item => String(item.title_id) !== String(title_id) || item.title_type !== title_type
        )

        return filtered
      })()
    }

    return {
      response: 'Deleted movie from watchlist successfully',
    }
  } catch (err) {
    console.error('deleteFromWatchlistController error:', err)
    return { status: 500, error: 'Failed to delete movie from watchlist' }
  }
}

export { deleteFromWatchlistController }
