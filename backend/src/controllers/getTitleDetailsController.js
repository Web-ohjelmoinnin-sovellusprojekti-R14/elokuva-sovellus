import { getMovieDetails, getTvDetails } from '../tmdbClient.js'
import { getMovieImdbRating, getTvSeriesImdbRating } from './imdbRatingController.js'

async function getTitleDetails(id, media_type) {
  switch (media_type) {
    case 'movie':
      const movieDetails = await getMovieDetails(id)
      const movieResponse = getMovieImdbRating(movieDetails)
      return movieResponse
    case 'tv':
      const tvDetails = await getTvDetails(id)
      const tvResponse = getTvSeriesImdbRating(tvDetails)
      return tvResponse
    default:
      return { error: 'Media type is not provided' }
  }
}

export { getTitleDetails }