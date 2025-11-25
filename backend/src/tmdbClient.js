import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const apiKey = process.env.TMDB_API_KEY
const baseURL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
console.log('TMDB key:', process.env.TMDB_API_KEY)

const tmdb = axios.create({
  baseURL,
  params: { api_key: apiKey },
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
  const res = await tmdb.get(`/movie/${movie_id}/external_ids`)
  return res.data
}

async function getTvDetails(series_id) {
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
  if (rating_min) params['vote_average.gte'] = rating_min - 1
  if (rating_max) params['vote_average.lte'] = rating_max
  params.sort_by = 'vote_count.desc'
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
  with_origin_country
) {
  const params = {}
  params.page = page
  if (year_min) params['first_air_date.gte'] = year_min
  if (year_max) params['first_air_date.lte'] = year_max
  if (include_adult) params.include_adult = true
  if (with_genres) params.with_genres = with_genres
  if (rating_min) params['vote_average.gte'] = rating_min - 1
  if (rating_max) params['vote_average.lte'] = rating_max
  params.sort_by = 'vote_count.desc'
  if (with_origin_country) params.with_origin_country = with_origin_country
  const res = await tmdb.get('/discover/tv', {
    params: params,
  })
  return res.data
}

export { nowInCinema, getMovies, getTvSeries, getMovieDetails, getTvDetails, discoverMovies, discoverTvSeries }
