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

export { nowInCinema, getMovies, getTvSeries, getMovieDetails, getTvDetails }
