import { discoverMovies, discoverTvSeries } from '../tmdbClient.js'
import { getMovieImdbRating, getTvSeriesImdbRating } from './imdbRatingController.js'
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
      detailedObject.media_type = media_type
      return detailedObject
    })
  )
  try {
    if (!imdb_rating_min && !imdb_rating_max) {
      return detailedMovies
    } else if (imdb_rating_min && !imdb_rating_max) {
      const filteredMovies = detailedMovies.filter(item => item.imdb_rating >= imdb_rating_min)
      return filteredMovies
    } else if (!imdb_rating_min && imdb_rating_max) {
      const filteredMovies = detailedMovies.filter(item => item.imdb_rating <= imdb_rating_max)
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
  foundTvSeries.results.map(item => console.log(item))
  const detailedTvSeries = await Promise.all(
    foundTvSeries.results.map(async item => {
      let detailedObject = await getTvSeriesImdbRating(item)
      detailedObject.media_type = media_type
      return detailedObject
    })
  )
  detailedTvSeries.map(item => console.log(item))
  if (!imdb_rating_min && !imdb_rating_max) {
    return detailedTvSeries
  } else if (imdb_rating_min && !imdb_rating_max) {
    const filteredTvSeries = detailedTvSeries.filter(item => item.imdb_rating >= imdb_rating_min)
    return filteredTvSeries
  } else if (!imdb_rating_min && imdb_rating_max) {
    const filteredTvSeries = detailedTvSeries.filter(item => item.imdb_rating <= imdb_rating_max)
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
      const responseMovies = await advancedSearchMovies(
        page,
        year_min,
        year_max,
        include_adult,
        with_genres,
        imdb_rating_min,
        imdb_rating_max,
        with_origin_country
      )
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
      const results = [...firstResponse, ...secondResponse]
      results.sort((a, b) => Number(b.imdb_rating) - Number(a.imdb_rating))
      return results
    default:
      return { error: "Media type parameter can either be 'movie' or 'tv'" }
  }
}

export { advancedSearchController }
