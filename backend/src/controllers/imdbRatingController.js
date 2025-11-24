import { getMovieDetails, getTvDetails } from '../tmdbClient.js'
import { getTitleDetails } from '../omdbClient.js'
import pLimit from 'p-limit'

const limit = pLimit(10)

async function getImdbRating(item, media_type) {
  return limit(async () => {
  let imdb_id = null
  console.log('Title: ' + item.title)
  console.log('Media Type: ' + media_type)

  try {
    if (media_type === 'movie') {
      const details = await getMovieDetails(item.id) 
      imdb_id = details.imdb_id 
    }
    else if (media_type === 'tv') {
      const details = await getTvDetails(item.id)
      imdb_id = details.external_ids?.imdb_id 
    }

    if (!imdb_id) return null
    const omdbDetails = await getTitleDetails(imdb_id)
    return { ...item, imdb_rating: omdbDetails.imdbRating }
  }
  catch (err) {
    console.log("FAILED:", item.title, err.message)
    return null
  }
  })
}

export { getImdbRating }