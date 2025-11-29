import axios from 'axios'
import dotenv from 'dotenv'
import axiosRetry from 'axios-retry'
dotenv.config()

const apiKey = process.env.TMDB_API_KEY
const baseURL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
console.log('TMDB key:', process.env.TMDB_API_KEY)

const tmdb = axios.create({
  baseURL,
  params: { api_key: apiKey },
})

axiosRetry(tmdb, {
  retries: 3,
  retryDelay: retryCount => {
    const delay = axiosRetry.exponentialDelay(retryCount)
    console.log(`Retry TMDB request ${retryCount}, waiting ${delay}ms`)
    return delay
  },
  retryCondition: error => {
    return axiosRetry.isRetryableError(error) || error.response?.status === 429
  },
})

async function nowInCinema(page, region) {
  const res = await tmdb.get('/movie/now_playing', {
    params: { page, region },
  })
  return res.data
}

async function getMovies(query, page) {
  const res = await tmdb.get('/search/movie', {
    params: { query, page },
  })
  return res.data
}

async function getTvSeries(query, page) {
  const res = await tmdb.get('/search/tv', {
    params: { query, page },
  })
  return res.data
}

async function getMovieDetails(movie_id) {
  const res = await tmdb.get(`/movie/${movie_id}`)
  return res.data
}

async function getTvDetails(series_id) {
  const res = await tmdb.get(`/tv/${series_id}`)
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
  with_origin_country
) {
  const params = {}
  params.page = page
  if (year_min) params['release_date.gte'] = year_min
  if (year_max) params['release_date.lte'] = year_max
  if (include_adult) params.include_adult = true
  if (with_genres) params.with_genres = with_genres
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
  if (with_origin_country) params.with_origin_country = with_origin_country
  console.log('Params for discoverMovies: ' + JSON.stringify(params))
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
  with_origin_country
) {
  const params = {}
  params.page = page
  if (year_min) params['first_air_date.gte'] = year_min
  if (year_max) params['first_air_date.lte'] = year_max
  if (include_adult) params.include_adult = true
  if (with_genres) params.with_genres = with_genres
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
  if (with_origin_country) params.with_origin_country = with_origin_country
  console.log('Params for discoverTvSeries: ' + JSON.stringify(params))
  const res = await tmdb.get('/discover/tv', {
    params: params,
  })
  return res.data
}

export {
  nowInCinema,
  getMovies,
  getTvSeries,
  getMovieExtrenalIds,
  getTvExtrenalIds,
  discoverMovies,
  discoverTvSeries,
  getMovieDetails,
  getTvDetails,
}
