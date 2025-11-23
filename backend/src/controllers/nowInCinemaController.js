import { nowInCinema } from '../tmdbClient.js'
import { getMovieImdbRating } from './imdbRatingController.js'

async function nowInCinemaController(req) {
  const page = req.query.page || 1
  const region = req.query.region || 'FI'

  const data = await nowInCinema(page, region)

  const detailedResults = await Promise.all(
    data.results.map(async item => {
      const filteredObject = await getMovieImdbRating(item)
      return filteredObject
    })
  )

  const clearedResults = detailedResults.filter(item => item !== null)

  const filteredData = { ...data, results: clearedResults }
  return filteredData
}

export { nowInCinemaController }
