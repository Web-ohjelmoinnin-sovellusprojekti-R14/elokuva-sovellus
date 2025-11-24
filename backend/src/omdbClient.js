import axios from 'axios'
import dotenv from 'dotenv'
import axiosRetry from 'axios-retry'
dotenv.config()

const apiKey = process.env.OMDB_API_KEY
const baseURL = process.env.OMDB_BASE_URL || 'https://www.omdbapi.com/'

const omdb = axios.create({
  baseURL,
  timeout: 1000,
  params: { apikey: apiKey },
})

axiosRetry(omdb, {
  retries: 3,
  retryDelay: (retryCount) => {
    const delay = axiosRetry.exponentialDelay(retryCount)
    console.log(`Retry omdb ${retryCount}, waiting ${delay}ms`)
    return delay
  },
  retryCondition: axiosRetry.isRetryableError
})

async function getTitleDetails(i) {
  const res = await omdb.get('/', {
    params: { i },
  })
  //console.log("Omdb Results:", res.data)
  return res.data
}

export { getTitleDetails }
