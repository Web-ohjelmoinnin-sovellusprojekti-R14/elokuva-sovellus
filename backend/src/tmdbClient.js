import axios from 'axios'
import axiosRetry from 'axios-retry'
import dotenv from 'dotenv'
dotenv.config()

const apiKey = process.env.TMDB_API_KEY
const baseURL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
console.log('TMDB API KEY:', process.env.TMDB_API_KEY)
if (!process.env.TMDB_API_KEY) {
  console.error('TMDB API key is missing! Check your .env file!')
  process.exit(1)
}

const tmdb = axios.create({
  baseURL,
  timeout: 1500,
  params: { api_key: apiKey },
})

axiosRetry(tmdb, {
  retries: 4,
  retryDelay: retryCount => {
    const delay = axiosRetry.exponentialDelay(retryCount)
    console.log(`Retry TMDB request ${retryCount}, waiting ${delay}ms`)
    return delay
  },
  retryCondition: error => {
    return axiosRetry.isRetryableError(error) || error.response?.status === 429
  },
})

async function nowInCinema(page, region, language) {
  const res = await tmdb.get('/movie/now_playing', {
    params: { page, region, language},
  })
  //console.log("Imdb Results:", res.data)
  return res.data
}

async function getTvSeries(query, page, language) {
  const res = await tmdb.get('/search/tv', {
    params: { query, page, language },
  })
  return res.data
}

async function getMovieDetails(movie_id, language) {
  const res = await tmdb.get(`/movie/${movie_id}?language=${language}`)
  return res.data
}

async function getMovies(query, page, language) {
  const res = await tmdb.get('/search/movie', {
    params: { query, page, language },
  })
  return res.data
  /*  const res = await tmdb.get('/search/movie', {
    params: { 
      query,
      page,
      include_adult: true,
      language: 'ru-RU',
      region: 'RU'
    },
  });
  return res.data;*/
}

async function getTvDetails(series_id, language) {
  const res = await tmdb.get(`/tv/${series_id}?language=${language}`)
  return res.data
}

async function getMovieExtrenalIds(movie_id) {
  const res = await tmdb.get(`/movie/${movie_id}/external_ids`)
  return res.data
}

async function getTvExtrenalIds(series_id) {
  const detailsRes = await tmdb.get('/tv/' + series_id)
  const details = detailsRes.data
  const idsRes = await tmdb.get(`/tv/${series_id}/external_ids`)
  const external_ids = idsRes.data
  return { ...details, external_ids }
}

async function discoverMovies(
  page,
  year_min,
  year_max,
  include_adult,
  with_genres,
  rating_min,
  rating_max,
  with_origin_country,
  language
) {
  const params = {}
  params.page = page
  if (year_min) params['release_date.gte'] = year_min
  if (year_max) params['release_date.lte'] = year_max
  if (include_adult) params.include_adult = true
  if (with_genres) params.with_genres = with_genres
  if (rating_min) params['vote_average.gte'] = rating_min - 0.8
  if (rating_max) params['vote_average.lte'] = rating_max
  params.sort_by = 'vote_count.desc'
  params.language = language
  if (with_origin_country) params.with_origin_country = with_origin_country
  const res = await tmdb.get('/discover/movie', {
    params: params,
  })
  return res.data
}

async function discoverTvSeries(
  page,
  year_min,
  year_max,
  include_adult,
  with_genres,
  rating_min,
  rating_max,
  with_origin_country,
  language
) {
  const params = {}
  params.page = page
  if (year_min) params['first_air_date.gte'] = year_min
  if (year_max) params['first_air_date.lte'] = year_max
  if (include_adult) params.include_adult = true
  if (with_genres) params.with_genres = with_genres
  //if (rating_min) params['vote_average.gte'] = rating_min - 1
  //if (rating_max) params['vote_average.lte'] = rating_max
  if (rating_min) {
    let rating_min_float = parseFloat(rating_min) - 0.8
    if (rating_min_float > 10) rating_min_float = 10
    if (rating_min_float < 0) rating_min_float = 0
    params['vote_average.gte'] = rating_min_float.toString()
  }
  if (rating_max) {
    let rating_max_float = parseFloat(rating_max) + 0.6
    if (rating_max_float > 10) rating_max_float = 10
    if (rating_max_float < 0) rating_max_float = 0
    params['vote_average.lte'] = rating_max_float.toString()
  }
  params.sort_by = 'vote_count.desc'
  params.language = language
  if (with_origin_country) params.with_origin_country = with_origin_country
  const res = await tmdb.get('/discover/tv', {
    params: params,
  })
  return res.data
}

async function getTrailerUrl(tmdbId, mediaType) {
  const endpoint = mediaType === 'movie' ? `/movie/${tmdbId}/videos` : `/tv/${tmdbId}/videos`

  const res = await tmdb.get(endpoint)

  const videos = res.data.results || []

  const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer')

  if (!trailer) return null

  return `https://www.youtube.com/watch?v=${trailer.key}`
}

<<<<<<< HEAD
export {
  nowInCinema,
  getMovieDetails,
  getTvDetails,
  getMovies,
  getTvSeries,
  discoverTvSeries,
  discoverMovies,
  getMovieExtrenalIds,
  getTvExtrenalIds,
  getTrailerUrl,
}
=======
export { nowInCinema, getTitles, getMovieDetails, getTvDetails, getMovies, 
  getTvSeries, discoverTvSeries, discoverMovies, getMovieExtrenalIds, getTvExtrenalIds, getTrailerUrl}
 
>>>>>>> 21c3fbfee366e1e90e1cce2ef46130fbef857a26
