import { getImdbRating } from './imdbRatingController.js'
import { getTitles } from '../tmdbClient.js'

async function titleSearchController(req) {
  const q = req.query.q

  const data = await getTitles(q)

  const filteredResults = Array.isArray(data.results) ? data.results.filter(item => item.media_type !== 'person') : []

  const detailedResults = await Promise.all(
    filteredResults.map(async item => {
      const filteredObject = await getImdbRating(item, item.media_type)
      return filteredObject
    })
  )
  const clearedResults = detailedResults.filter(item => item !== null)
  const filteredData = { ...data, results: clearedResults }
  return filteredData
}

export { titleSearchController }