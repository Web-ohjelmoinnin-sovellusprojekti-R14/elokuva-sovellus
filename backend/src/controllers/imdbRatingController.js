import { getMovieExtrenalIds, getTvExtrenalIds } from '../tmdbClient.js'
import { getTitleDetails } from '../omdbClient.js'

async function getMovieImdbRating(item) {
  let imdb_id = null
  console.log('Title: ' + item.title)
  console.log('Time before getMovieDetails in getMovieImdbRating for ' + item.title + ': ' + new Date().toISOString())
  const details = await getMovieExtrenalIds(item.id)
  console.log('Time after getMovieDetails in getMovieImdbRating for ' + item.title + ': ' + new Date().toISOString())
  imdb_id = details.imdb_id
  console.log('IMDb id of ' + item.title + ': ' + imdb_id)
  const media_type = 'movie'

  if (!imdb_id) {
    return null
  }

  let imdb_rating = null
  try {
    console.log('Time before getTitleDetails in getMovieImdbRating for ' + item.title + ': ' + new Date().toISOString())
    const omdbDetails = await getTitleDetails(imdb_id)
    console.log('Time after getTitleDetails in getMovieImdbRating for ' + item.title + ': ' + new Date().toISOString())
    imdb_rating = omdbDetails.imdbRating
    console.log('IMDb rating for ' + item.title + ': ' + imdb_rating)
  } catch (e) {
    console.log('Failed to get IMDb rating for: ' + item.title)
    return { ...item, media_type }
  }
  return { ...item, imdb_rating, media_type }
}

async function getTvSeriesImdbRating(item) {
  let imdb_id = null
  console.log('Name: ' + item.name)

  console.log('Time before getTvDetails in getTvSeriesImdbRating: ' + new Date().toISOString())
  const details = await getTvExtrenalIds(item.id)
  console.log('Time after getTvDetails in getTvSeriesImdbRating: ' + new Date().toISOString())
  imdb_id = details.external_ids?.imdb_id
  console.log('IMDb id of ' + item.name + ': ' + imdb_id)
  const media_type = 'tv'

  if (!imdb_id) {
    return null
  }
  let imdb_rating = null
  try {
    console.log('Time before getTitleDetails in getTvSeriesImdbRating: ' + new Date().toISOString())
    const omdbDetails = await getTitleDetails(imdb_id)
    console.log('Time after getTitleDetails in getTvSeriesImdbRating: ' + new Date().toISOString())
    imdb_rating = omdbDetails.imdbRating
    console.log('IMDb rating for ' + item.title + ': ' + imdb_rating)
  } catch (e) {
    console.log('Failed to get IMDb rating for: ' + item.title)
    return { ...item, media_type }
  }
  return { ...item, imdb_rating, media_type }
}

export { getMovieImdbRating, getTvSeriesImdbRating }
