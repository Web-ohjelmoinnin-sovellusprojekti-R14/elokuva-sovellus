import { Router } from 'express'
const router = Router()
import { getMovieImdbRating, getTvSeriesImdbRating } from '../controllers/imdbRatingController.js'
import pLimit from 'p-limit'

const limit = pLimit(5); 
const TMDB_KEY = process.env.TMDB_API_KEY;

const PAGES_PER_BATCH = 6
const ITEMS_PER_BATCH = 110
const cache = {}

async function fetchTMDBPages(baseUrl, startPage = 1) {
  const results = []
  for (let i = 0; i < PAGES_PER_BATCH; i++) {
    const page = startPage + i
    try {
      const res = await fetch(`${baseUrl}&api_key=${TMDB_KEY}&page=${page}&language=en-US`)
      const data = await res.json()
      if (!data.results?.length) break
      results.push(...data.results)
    } catch (err) {
      console.error('TMDB error:', err)
      break
    }
  }
  return results
}

async function getBatch(category, batchNum = 1, filters = {}) {
  const cacheKey = `${category}:${batchNum}:${JSON.stringify(filters)}`
  if (cache[cacheKey]) return cache[cacheKey]

  const isTV = category === 'series' || category === 'anime'
  const baseType = isTV ? 'tv' : 'movie'
  const startPage = (batchNum - 1) * PAGES_PER_BATCH + 1

  const BASE_URLS = {
    movies: `https://api.themoviedb.org/3/discover/movie?sort_by=vote_average.desc&vote_count.gte=300`,
    series: `https://api.themoviedb.org/3/discover/tv?sort_by=vote_average.desc&vote_count.gte=150`,
    cartoons: `https://api.themoviedb.org/3/discover/movie?sort_by=vote_average.desc&vote_count.gte=200&with_genres=16&without_original_language=ja`,
    anime: `https://api.themoviedb.org/3/discover/tv?sort_by=vote_average.desc&vote_count.gte=100&with_genres=16&with_original_language=ja`,
  }

  const FILTER_URLS = {
    movies: `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&vote_count.gte=50`,
    series: `https://api.themoviedb.org/3/discover/tv?sort_by=popularity.desc&vote_count.gte=30`,
    cartoons: `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&vote_count.gte=50&with_genres=16&without_original_language=ja`,
    anime: `https://api.themoviedb.org/3/discover/tv?sort_by=popularity.desc&vote_count.gte=30&with_genres=16&with_original_language=ja`,
  }

  const hasFilters = Object.keys(filters).some(k => k !== 'batch' && filters[k] !== '' && filters[k] != null)

  let url = hasFilters ? FILTER_URLS[category] : BASE_URLS[category]

  if (filters.year_from) {
    const param = isTV ? 'first_air_date.gte' : 'primary_release_date.gte'
    url += `&${param}=${filters.year_from}-01-01`
  }

  if (filters.year_to) {
    const param = isTV ? 'first_air_date.lte' : 'primary_release_date.lte'
    url += `&${param}=${filters.year_to}-12-31`
  }

  if (filters.rating_min) {
    url += `&vote_average.gte=${filters.rating_min}`
  }
  if (filters.rating_max) {
    url += `&vote_average.lte=${filters.rating_max}`
  }

  if (filters.adult !== undefined) {
    url += `&include_adult=${filters.adult === '1'}`
  }

  if (filters.with_genres) {
    if (category === 'cartoons' || category === 'anime') {
      url += `&with_genres=16,${filters.with_genres}`
    } else {
      url += `&with_genres=${filters.with_genres}`
    }
  }

  const rawItems = await fetchTMDBPages(url, startPage)

  const enriched = await Promise.all(
    rawItems.map(item =>
      limit(() => {
        if (baseType == 'movie') {
          return getMovieImdbRating({ ...item, media_type: 'movie' }, false)
        } else {
          return getTvSeriesImdbRating({ ...item, media_type: 'tv' }, false)
        }
      })
    )
  )

  const filtered = enriched
    .filter(i => i && i.imdb_rating)
    .sort((a, b) => parseFloat(b.imdb_rating) - parseFloat(a.imdb_rating))
    .slice(0, ITEMS_PER_BATCH * 2)

  const result = {
    results: filtered,
    hasMore: rawItems.length >= PAGES_PER_BATCH * 18,
  }

  cache[cacheKey] = result
  return result
}

;['movies', 'series', 'anime', 'cartoons'].forEach(cat => {
  router.get(`/category/${cat}`, async (req, res) => {
    try {
      const batch = parseInt(req.query.batch) || 1
      const { results, hasMore } = await getBatch(cat, batch, req.query)
      res.json({ results, hasMore })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Server error' })
    }
  })
})

router.get('/trending', async (req, res) => {
  try {
    const resTrend = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_KEY}`)
    const data = await resTrend.json()

    const withImdb = await Promise.all(
      data.results.slice(0, 20).map(item =>
        limit(() => {
          if (item.media_type == 'movie') {
            return getMovieImdbRating(item, false)
          } else {
            return getTvSeriesImdbRating(item, false)
          }
        })
      )
    )

    const results = withImdb.filter(i => i?.imdb_rating)

    res.json({ results })
  } catch (err) {
    res.status(500).json({ error: 'Trending failed' })
  }
})

export default router
