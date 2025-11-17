import { getTitles, getMovieDetails, getTvDetails } from '../tmdbClient.js'
import { getTitleDetails } from '../omdbClient.js'

async function titleSearchController(req) {
  const q = req.query.q

  const data = await getTitles(q)

  const filteredResults = Array.isArray(data.results) ? data.results.filter(item => item.media_type !== 'person') : []

  const detailedResults = await Promise.all(
    filteredResults.map(async item => {
      let imdb_id = null

      if (item.media_type === 'movie') {
        const details = await getMovieDetails(item.id)
        imdb_id = details.imdb_id
      } else if (item.media_type === 'tv') {
        const details = await getTvDetails(item.id)
        imdb_id = details.external_ids?.imdb_id
      }

      let imdb_rating = null
      if (imdb_id) {
        const omdbDetails = await getTitleDetails(imdb_id)
        imdb_rating = omdbDetails.imdbRating
      }
      return { ...item, imdb_rating }
    })
  )
  const filteredData = { ...data, results: detailedResults }
  return filteredData
}

export { titleSearchController }
