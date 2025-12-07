import { getMovieDetails, getTvDetails } from '../tmdbClient.js'
import { getMovieImdbRating, getTvSeriesImdbRating } from './imdbRatingController.js'

async function getTitleDetails(id, media_type) {
  try {
  switch (media_type) {
    case 'movie':
      const movieDetails = await getMovieDetails(id)
      const movieResponse = getMovieImdbRating(movieDetails, true)
      return movieResponse
    case 'tv':
      const tvDetails = await getTvDetails(id)
      const tvResponse = getTvSeriesImdbRating(tvDetails, true)
      return tvResponse
    default:
      return { error: 'Media type is not provided' }
  }
}catch(err){ console.error(`TMDB failed for ${media_type} ${id}:`, err.message); throw err;}
}

export { getTitleDetails }
