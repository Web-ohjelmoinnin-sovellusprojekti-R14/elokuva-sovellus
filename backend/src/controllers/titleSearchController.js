import { getMovieImdbRating, getTvSeriesImdbRating, getImdbRating } from './imdbRatingController.js'
import { getMovies, getTvSeries } from '../tmdbClient.js'

async function titleSearchController(req) {
  const query = req.query.q || ''
  const page = req.query.page || 1
  const language = req.query.language || 'en-US'

  const movies = await getMovies(query, page, language)
  const tvSeries = await getTvSeries(query, page, language)

  const detailedMovies = await Promise.all(
    movies.results.map(item => getImdbRating({ ...item, media_type: 'movie' }, 'movie'))
  )
  const detailedTv = await Promise.all(tvSeries.results.map(item => getImdbRating({ ...item, media_type: 'tv' }, 'tv')))

  const combinedResults = [...detailedMovies, ...detailedTv]
    .filter(item => item !== null)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

  return {
    results: combinedResults,
    total_pages: Math.min(movies.total_pages + tvSeries.total_pages, 10),
    total_results: combinedResults.length,
  }
}

export { titleSearchController }
