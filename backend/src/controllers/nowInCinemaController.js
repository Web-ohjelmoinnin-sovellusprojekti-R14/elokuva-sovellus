import { nowInCinema } from '../tmdbClient.js'

async function nowInCinemaController(req) {
  const page = req.query.page || 1
  const region = req.query.region || 'FI'

  const data = await nowInCinema(page, region)
  return data
}

export { nowInCinemaController }
