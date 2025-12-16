import { Router } from 'express'
const router = Router()
import { nowInCinemaController } from '../controllers/nowInCinemaController.js'

router.get('/now_in_cinema', async (req, res) => {
  const result = await nowInCinemaController(req)
  if (result) {
    res.json(result)
  } else {
    res.status(500).json({ error: 'Failed to get now playing movies' })
  }
})

export default router
 