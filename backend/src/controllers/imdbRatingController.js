import { getMovieDetails, getTvDetails } from '../tmdbClient.js'
import { getTitleDetails } from '../omdbClient.js'

async function getImdbRating(item, media_type) {
  let imdb_id = null
  console.log('Title: ' + item.title)
  console.log('Media Type: ' + media_type)

  if (media_type == 'movie') {
    const details = await getMovieDetails(item.id)
    console.log('IMDb id of ' + item.title + ': ' + imdb_id)
    imdb_id = details.imdb_id
  } else if (media_type == 'tv') {
    const details = await getTvDetails(item.id)
    imdb_id = details.external_ids?.imdb_id
    console.log('IMDb id of ' + item.name + ': ' + imdb_id)
  }

  if (!imdb_id) return null
  let imdb_rating = null
  try {
    const omdbDetails = await getTitleDetails(imdb_id)
    imdb_rating = omdbDetails.imdbRating
    console.log('IMDb rating for ' + item.title + ': ' + imdb_rating)
  } catch (e) {
    console.log('Failed to get IMDb rating for: ' + item.title)
    return null
  }
  return { ...item, imdb_rating }
}

export { getImdbRating }