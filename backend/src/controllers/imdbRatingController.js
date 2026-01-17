import { getMovieDetails, getTvDetails, getMovieExtrenalIds, getTvExtrenalIds, getTrailerUrl } from '../tmdbClient.js'

import { getTitleDetails } from '../omdbClient.js'
import pLimit from 'p-limit'

const limit = pLimit(4)
const ratingCache = new Map()

async function getImdbRating(item, mediaType = 'movie') {
  return limit(async () => {
    const tmdbId = item.id
    const cacheKey = `${mediaType}:${tmdbId}`

    if (ratingCache.has(cacheKey)) {
      const cached = ratingCache.get(cacheKey)
      return { ...item, imdb_rating: cached }
    }

    let imdbId = null

    try {
      imdbId = item.imdb_id

      if (!imdbId) {
        const externalIds =
          mediaType === 'movie'
            ? await import('../tmdbClient.js').then(m => m.getMovieExtrenalIds(tmdbId))
            : await import('../tmdbClient.js').then(m => m.getTvExtrenalIds(tmdbId))

        imdbId = externalIds.imdb_id || externalIds.external_ids?.imdb_id
      }

      if (!imdbId) {
        return fallbackRating(item)
      }

      const omdbData = await getTitleDetails(imdbId)

      if (omdbData?.Response === 'True' && omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
        const rating = parseFloat(omdbData.imdbRating).toFixed(1)
        ratingCache.set(cacheKey, rating)
        return { ...item, imdb_rating: rating }
      }

      return fallbackRating(item)
    } catch (error) {
      return fallbackRating(item)
    }
  })
}

function fallbackRating(item) {
  const tmdbRating = item.vote_average
  const fallback = tmdbRating ? parseFloat(tmdbRating.toFixed(1)) : null

  if (fallback && fallback >= 1.0) {
    const tmdbId = item.id
    const mediaType = item.media_type || (item.title ? 'movie' : 'tv')
    const cacheKey = `${mediaType}:${tmdbId}`
    ratingCache.set(cacheKey, fallback)
    return { ...item, imdb_rating: fallback }
  }

  return { ...item, imdb_rating: null }
}

async function getMovieImdbRating(item, forTitlePage) {
  let imdb_id = null
  //console.log('Title: ' + item.title)
  //console.log('Time before getMovieDetails in getMovieImdbRating for ' + item.title + ' : ' + new Date().toISOString())
  const details = await getMovieExtrenalIds(item.id)
  //console.log('Time after getMovieDetails in getMovieImdbRating for ' + item.title + ' : ' + new Date().toISOString())
  imdb_id = details.imdb_id
  //console.log('IMDb id of ' + item.title + ': ' + imdb_id)
  const media_type = 'movie'

  if (!imdb_id) {
    return item
  }

  let imdb_rating = null
  try {
    //console.log('Time before getTitleDetails in getMovieImdbRating for ' + item.title + ': ' + new Date().toISOString())
    const omdbDetails = await getTitleDetails(imdb_id)
    //console.log(JSON.stringify(omdbDetails))
    //console.log('Time after getTitleDetails in getMovieImdbRating for ' + item.title + ': ' + new Date().toISOString())
    imdb_rating = omdbDetails.imdbRating

    if (forTitlePage) {
      const imdbVotes = omdbDetails.imdbVotes
      const director = omdbDetails.Director
      const writer = omdbDetails.Writer
      const actors = omdbDetails.Actors
      const trailerUrl = await getTrailerUrl(item.id, 'movie')
      return { ...item, imdb_rating, media_type, imdbVotes, director, writer, actors, trailerUrl }
    }
    //console.log('IMDb rating for ' + item.title + ': ' + imdb_rating)
  } catch (e) {
    console.log('Failed to get IMDb rating for: ' + item.title)
    return { ...item, media_type }
  }
  return { ...item, imdb_rating, media_type }
}

async function getTvSeriesImdbRating(item, forTitlePage) {
  let imdb_id = null
  //console.log('Name: ' + item.name)

  //console.log('Time before getTvDetails in getTvSeriesImdbRating: ' + new Date().toISOString())
  const details = await getTvExtrenalIds(item.id)
  //console.log('Time after getTvDetails in getTvSeriesImdbRating: ' + new Date().toISOString())
  imdb_id = details.external_ids?.imdb_id
  //console.log('IMDb id of ' + item.name + ': ' + imdb_id)
  const media_type = 'tv'

  if (!imdb_id) {
    return item
  }
  let imdb_rating = null
  try {
    //console.log('Time before getTitleDetails in getTvSeriesImdbRating: ' + new Date().toISOString())
    const omdbDetails = await getTitleDetails(imdb_id)
    //console.log(JSON.stringify(omdbDetails))
    //console.log('Time after getTitleDetails in getTvSeriesImdbRating: ' + new Date().toISOString())
    imdb_rating = omdbDetails.imdbRating
    if (forTitlePage) {
      const imdbVotes = omdbDetails.imdbVotes
      const director = omdbDetails.Director
      const writer = omdbDetails.Writer
      const actors = omdbDetails.Actors
      const trailerUrl = await getTrailerUrl(item.id, 'tv')
      return { ...item, imdb_rating, media_type, imdbVotes, director, writer, actors, trailerUrl }
    }
  } catch (e) {
    console.log('Failed to get IMDb rating for: ' + item.title)
    return { ...item, media_type }
  }
  //console.log('IMDb rating for ' + item.title + ': ' + imdb_rating)

  return { ...item, imdb_rating, media_type }
}

export { getImdbRating, getMovieImdbRating, getTvSeriesImdbRating }
