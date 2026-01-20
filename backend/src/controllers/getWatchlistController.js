import pool from '../db.js'
import pLimit from 'p-limit'
import { getMovieDetails, getTvDetails } from '../tmdbClient.js'
import { withCache } from './cacheWrapper.js'

const limit = pLimit(10)

export const watchlistCache = new Map()

async function getWatchlistController(user_id, language) {
  const cacheKey = `watchlist:${user_id}`

  try {
    const detailedWatchlist = await withCache(watchlistCache, cacheKey, async () => {
      const watchlist = await pool.query('SELECT * FROM watchlist WHERE user_id=$1', [user_id])

      const detailed = await Promise.all(
        watchlist.rows.map(item =>
          limit(async () => {
            const details =
              item.title_type === 'movie'
                ? await getMovieDetails(item.title_id, language)
                : await getTvDetails(item.title_id, language)

            return {
              ...item,
              details,
            }
          })
        )
      )

      return detailed
    })

    return detailedWatchlist
  } catch (err) {
    console.error('getWatchlistController error:', err)
    return { status: 500, error: 'Failed to get watchlist' }
  }
}

export { getWatchlistController }
