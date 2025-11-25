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
      const detailedObject = await getMovieImdbRating(item)
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
      const detailedObject = await getTvSeriesImdbRating(item)
      return detailedObject
    })
  )
  try {
    if (!imdb_rating_min && !imdb_rating_max) {
      return detailedTvSeries
    } else if (imdb_rating_min && !imdb_rating_max) {
      const filteredTvSeries = detailedTvSeries.results.filter(item => item.imdb_rating >= imdb_rating_min)
      return filteredTvSeries
    } else if (!imdb_rating_min && imdb_rating_max) {
      const filteredTvSeries = detailedTvSeries.results.filter(item => item.imdb_rating <= imdb_rating_max)
      return filteredTvSeries
    }
  } catch (e) {
    return { error: 'IMDb rating must be a number' }
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
      console.log(responseMovies)
      responseMovies.sort((a, b) => Number(b.imdb_rating) - Number(a.imdb_rating))
      return responseMovies
    case 'tv':
      const responseTvSeries = await advancedSearchTvSeries(
        page,
        year_min,
        year_max,
        include_adult,
        with_genres,
        imdb_rating_min,
        imdb_rating_max,
        with_origin_country
      )
      responseTvSeries.sort((a, b) => Number(b.imdb_rating) - Number(a.imdb_rating))
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
