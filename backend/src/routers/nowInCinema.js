import { Router } from 'express'
const router = Router()
import { nowInCinemaController } from '../controllers/nowInCinemaController.js'
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 25,
  message: { error: 'Too much requests for now playing films, try again later' },
})

router.get('/now_in_cinema', limiter, async (req, res) => {
  const result = await nowInCinemaController(req)
  if (result) {
    res.json(result)
  } else {
    res.status(500).json({ error: 'Failed to get now playing movies' })
  }
})

export default router
