import { discoverMovies, discoverTvSeries } from '../tmdbClient.js'
import { getMovieImdbRating, getTvSeriesImdbRating } from './imdbRatingController.js'

const MAX_APP_ITEMS = 110
const MAX_TMDB_PAGES = 6

async function advancedSearchMovies(
  page,
  year_min,
  year_max,
  include_adult,
  with_genres,
  imdb_rating_min,
  imdb_rating_max,
  with_origin_country
) {
  const media_type = 'movie'
  const foundMovies = await discoverMovies(
    page,
    year_min,
    year_max,
    include_adult,
    with_genres,
    imdb_rating_min,
    imdb_rating_max,
    with_origin_country
  )
  const detailedMovies = await Promise.all(
    foundMovies.results.map(async item => {
      let detailedObject = await getMovieImdbRating(item)
      if (detailedObject) detailedObject.media_type = media_type
      return detailedObject
    })
  )
  console.log('All detailed movies: ' + JSON.stringify(detailedMovies))
  try {
    if (!imdb_rating_min && !imdb_rating_max) {
      return detailedMovies
    } else if (imdb_rating_min && !imdb_rating_max) {
      const filteredMovies = detailedMovies.filter(item => {
        if (!item || item.imdb_rating == null) return false
        return Number(item.imdb_rating) >= Number(imdb_rating_min)
      })
      return filteredMovies
    } else if (!imdb_rating_min && imdb_rating_max) {
      const filteredMovies = detailedMovies.filter(item => {
        if (!item || item.imdb_rating == null) return false
        return Number(item.imdb_rating) <= Number(imdb_rating_max)
      })

      return filteredMovies
    }
  } catch (e) {
    return { error: 'IMDb rating must be a number' }
  }
}

async function advancedSearchTvSeries(
  page,
  year_min,
  year_max,
  include_adult,
  with_genres,
  imdb_rating_min,
  imdb_rating_max,
  with_origin_country
) {
  const media_type = 'tv'
  const foundTvSeries = await discoverTvSeries(
    page,
    year_min,
    year_max,
    include_adult,
    with_genres,
    imdb_rating_min,
    imdb_rating_max,
    with_origin_country
  )
  const detailedTvSeries = await Promise.all(
    foundTvSeries.results.map(async item => {
      let detailedObject = await getTvSeriesImdbRating(item)
      if (detailedObject) detailedObject.media_type = media_type
      return detailedObject
    })
  )
  console.log('All detailed series: ' + JSON.stringify(detailedTvSeries))
  if (!imdb_rating_min && !imdb_rating_max) {
    return detailedTvSeries
  } else if (imdb_rating_min && !imdb_rating_max) {
    const filteredTvSeries = detailedTvSeries.filter(item => {
      if (!item || item.imdb_rating == null) return false
      return Number(item.imdb_rating) >= Number(imdb_rating_min)
    })
    return filteredTvSeries
  } else if (!imdb_rating_min && imdb_rating_max) {
    const filteredTvSeries = detailedTvSeries.filter(item => {
      if (!item || item.imdb_rating == null) return false
      return Number(item.imdb_rating) <= Number(imdb_rating_max)
    })
    return filteredTvSeries
  }
}

async function advancedSearchController(
  page,
  media_type,
  year_min,
  year_max,
  imdb_rating_min,
  imdb_rating_max,
  include_adult,
  with_genres,
  with_origin_country
) {
  switch (media_type) {
    case 'movie':
      let responseMovies = await advancedSearchMovies(
        page,
        year_min,
        year_max,
        include_adult,
        with_genres,
        imdb_rating_min,
        imdb_rating_max,
        with_origin_country
      )

      responseMovies = Array.isArray(responseMovies) ? responseMovies : []
      responseMovies = responseMovies.filter(item => item != null)
      responseMovies.sort((a, b) => Number(b.imdb_rating) - Number(a.imdb_rating))
      return responseMovies
    case 'tv':
      let responseTvSeries = await advancedSearchTvSeries(
        page,
        year_min,
        year_max,
        include_adult,
        with_genres,
        imdb_rating_min,
        imdb_rating_max,
        with_origin_country
      )
      responseTvSeries = responseTvSeries.filter(item => item != null)
      responseTvSeries.sort((a, b) => {
        return Number(b.imdb_rating) - Number(a.imdb_rating)
      })
      return responseTvSeries
    case null:
      const firstResponse = await advancedSearchMovies(
        page,
        year_min,
        year_max,
        include_adult,
        with_genres,
        imdb_rating_min,
        imdb_rating_max,
        with_origin_country
      )
      const secondResponse = await advancedSearchTvSeries(
        page,
        year_min,
        year_max,
        include_adult,
        with_genres,
        imdb_rating_min,
        imdb_rating_max,
        with_origin_country
      )
      let results = [...firstResponse, ...secondResponse]
      results = results.filter(item => item != null)
      results.sort((a, b) => Number(b.imdb_rating) - Number(a.imdb_rating))
      return results
    default:
      return { error: "Media type parameter can either be 'movie' or 'tv'" }
  }
}

function buildCacheKey(params) {
  return JSON.stringify(params)
}

async function buildCombinedResults(baseParams) {
  const combined = []
  let tmdbPage = 1

  while (tmdbPage <= MAX_TMDB_PAGES && combined.length < MAX_APP_ITEMS) {
    const pageResponse = await advancedSearchController(
      tmdbPage,
      baseParams.media_type,
      baseParams.year_min,
      baseParams.year_max,
      baseParams.imdb_rating_min,
      baseParams.imdb_rating_max,
      baseParams.include_adult,
      baseParams.with_genres,
      baseParams.with_origin_country
    )

    console.log(
      'advancedSearchController page',
      tmdbPage,
      'len =',
      Array.isArray(pageResponse) ? pageResponse.length : 'not array'
    )

    if (!pageResponse || !Array.isArray(pageResponse) || pageResponse.length === 0) {
      break
    }

    combined.push(...pageResponse)

    if (combined.length >= MAX_APP_ITEMS) {
      break
    }

    tmdbPage += 1
  }

  return combined.slice(0, MAX_APP_ITEMS)
}

export { buildCacheKey, buildCombinedResults }
