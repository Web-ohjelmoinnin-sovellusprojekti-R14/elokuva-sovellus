import { nowInCinema } from '../tmdbClient.js'
import { getImdbRating } from './imdbRatingController.js'
import pLimit from 'p-limit'

const limit = pLimit(4)

async function nowInCinemaController(req) {
  const page = req.query.page || 1
  const language = typeof req.query.language === 'string' ? req.query.language : 'en-US'

  const region = language.match(/^[a-z]{2}-([A-Z]{2})$/) ? language.split('-')[1] : 'US'

  const data = await nowInCinema(page, region, language)

  const detailedResults = await Promise.all(data.results.map(async item => limit(() => getImdbRating(item, 'movie'))))

  const clearedResults = detailedResults.filter(item => item !== null)

  const filteredData = { ...data, results: clearedResults }
  return filteredData
}

export { nowInCinemaController }
