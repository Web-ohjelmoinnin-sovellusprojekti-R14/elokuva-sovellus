import axios from 'axios'
import dotenv from 'dotenv'
import axiosRetry from 'axios-retry'
dotenv.config()

const apiKey = process.env.OMDB_API_KEY
const baseURL = process.env.OMDB_BASE_URL || 'http://www.omdbapi.com/'

const omdb = axios.create({
  baseURL,
  timeout: 500,
  params: { apikey: apiKey },
})

axiosRetry(omdb, {
  retries: 3,
  retryDelay: retryCount => {
    const delay = axiosRetry.exponentialDelay(retryCount)
    console.log(`Retry OMDB request ${retryCount}, waiting ${delay}ms`)
    return delay
  },
  retryCondition: error => {
    return axiosRetry.isRetryableError(error) || error.response?.status === 429
  },
})

async function getTitleDetails(i) {
  const res = await omdb.get('/', { params: { i } })
  return res.data
}

export { getTitleDetails }
