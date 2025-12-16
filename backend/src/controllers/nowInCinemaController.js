import { nowInCinema } from '../tmdbClient.js'
import { getImdbRating } from './imdbRatingController.js'

async function nowInCinemaController(req) {
  const page = req.query.page || 1
  //const region = req.query.region || 'FI'
  const language = typeof req.query.language === "string"
    ? req.query.language
    : "en-US"

  const region = language.match(/^[a-z]{2}-([A-Z]{2})$/)
    ? language.split("-")[1]
    : "US"

<<<<<<< HEAD
=======
  const data = await nowInCinema(page, region, language)

>>>>>>> 21c3fbfee366e1e90e1cce2ef46130fbef857a26
  const detailedResults = await Promise.all( 
    data.results.map(async item => {
      const filteredObject = await getImdbRating(item, 'movie')
      return filteredObject
    })
  )

  const clearedResults = detailedResults.filter(item => item !== null)

  const filteredData = { ...data, results: clearedResults }
  return filteredData
}

export { nowInCinemaController }
