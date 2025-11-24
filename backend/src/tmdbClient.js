import axios from 'axios'
import axiosRetry from 'axios-retry'
import dotenv from 'dotenv'
dotenv.config()

const apiKey = process.env.TMDB_API_KEY
const baseURL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3'
console.log('TMDB key:', process.env.TMDB_API_KEY)

const tmdb = axios.create({
  baseURL,
  timeout:1000,
  params: { api_key: apiKey },
})

axiosRetry(tmdb, {
  retries: 3,
  retryDelay: (retryCount) => {
    const delay = axiosRetry.exponentialDelay(retryCount)
    console.log(`Retry imdb ${retryCount}, waiting ${delay}ms`)
    return delay
  },
  retryCondition: axiosRetry.isRetryableError
})

async function nowInCinema(page, region) {
  const res = await tmdb.get('/movie/now_playing', {
    params: { page, region },
  })
  //console.log("Imdb Results:", res.data)
  return res.data
}

async function getTitles(query) {
  const res = await tmdb.get('/search/multi', {
    params: { query },
  })
  return res.data
}

async function getMovieDetails(movie_id) {
  const res = await tmdb.get('/movie/' + movie_id)
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

async function getTvDetails(series_id) {
  const detailsRes = await tmdb.get('/tv/' + series_id)
  const details = detailsRes.data
  const idsRes = await tmdb.get(`/tv/${series_id}/external_ids`)
  const external_ids = idsRes.data
  return { ...details, external_ids }
}

export { nowInCinema, getTitles, getMovieDetails, getTvDetails, getMovies, getTvSeries }
