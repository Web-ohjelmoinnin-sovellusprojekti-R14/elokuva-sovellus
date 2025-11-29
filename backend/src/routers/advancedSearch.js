import { Router } from 'express'
const router = Router()
import { buildCacheKey, buildCombinedResults } from '../controllers/advancedSearchController.js'

const ITEMS_PER_APP_PAGE = 18

router.get('/advanced_search', async (req, res) => {
  const appPage = parseInt(req.query.page, 10) || 1
  const media_type = req.query.media_type || null

  let year_min = req.query.year_min || null
  if (year_min) year_min = `${year_min}-01-01`

  let year_max = req.query.year_max || null
  if (year_max) year_max = `${year_max}-01-01`

  const imdb_rating_min = req.query.imdb_rating_min || null
  const imdb_rating_max = req.query.imdb_rating_max || null
  const include_adult = req.query.include_adult === 'true' || req.query.include_adult === true
  const with_genres = req.query.with_genres || null
  const with_origin_country = req.query.with_origin_country || null

  const baseParams = {
    media_type,
    year_min,
    year_max,
    imdb_rating_min,
    imdb_rating_max,
    include_adult,
    with_genres,
    with_origin_country,
  }

  const cache = {}

  const cacheKey = buildCacheKey(baseParams)

  if (!cache[cacheKey]) {
    const combinedResults = await buildCombinedResults(baseParams)
    cache[cacheKey] = {
      results: combinedResults,
      lastUpdated: Date.now(),
    }
  }

  const allResults = cache[cacheKey].results || []
  const totalItems = allResults.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_APP_PAGE))

  if (appPage < 1 || appPage > totalPages) {
    return res.status(400).json({ error: 'Invalid page number' })
  }

  const start = (appPage - 1) * ITEMS_PER_APP_PAGE
  const end = start + ITEMS_PER_APP_PAGE
  const pageResults = allResults.slice(start, end)
  const hasMore = appPage < totalPages

  res.json({
    results: pageResults,
    page: appPage,
    total_pages: totalPages,
    total_results: totalItems,
    hasMore,
  })
})

export default router
