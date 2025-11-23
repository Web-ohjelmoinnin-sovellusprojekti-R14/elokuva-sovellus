import { getMovieImdbRating, getTvSeriesImdbRating } from './imdbRatingController.js'
import { getMovies, getTvSeries } from '../tmdbClient.js'
import pLimit from 'p-limit'

async function titleSearchController(req) {
  const q = req.query.q
  const page = req.query.page || 1

  console.log('Time before getMovies in titleSearchController' + new Date().toISOString())
  const movies = await getMovies(q, page)
  console.log('Time after getMovies in titleSearchController' + new Date().toISOString())
  const tvSeries = await getTvSeries(q, page)
  console.log('Time before getTvSeries in titleSearchController' + new Date().toISOString())

  const detailedMovies = await Promise.all(
    movies.results.map(async item => {
      console.log(
        'Time before getMovieImdbRating in titleSearchController for ' + item.title + ': ' + new Date().toISOString()
      )
      const detailedObject = await getMovieImdbRating(item)
      console.log(
        'Time after getMovieImdbRating in titleSearchController ' + item.title + ': ' + new Date().toISOString()
      )
      return detailedObject
    })
  )

  const detailedTvSeries = await Promise.all(
    tvSeries.results.map(async item => {
      console.log('Time before getTvSeriesImdbRating in titleSearchController' + new Date().toISOString())
      const detailedObject = await getTvSeriesImdbRating(item)
      console.log('Time after getTvSeriesImdbRating in titleSearchController' + new Date().toISOString())
      return detailedObject
    })
  )

  const combinedResults = detailedMovies.concat(detailedTvSeries)
  const cleanedResults = combinedResults.filter(item => item !== null)
  const sortedResults = cleanedResults.filter(item => item !== null).sort((a, b) => b.popularity - a.popularity)
  console.log(sortedResults.length)
  let total_pages = movies.total_pages + tvSeries.total_pages
  let titles_found = sortedResults.length
  const filteredData = { results: sortedResults, titles_found, total_pages }
  return filteredData
}

export { titleSearchController }
