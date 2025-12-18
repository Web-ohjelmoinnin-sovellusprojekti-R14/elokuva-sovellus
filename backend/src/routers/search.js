import { Router } from 'express'
const router = Router()
import { titleSearchController } from '../controllers/titleSearchController.js'
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 25,
  message: { error: 'Too much requests' },
})

router.get('/titlesearch', limiter, async (req, res) => {
  //console.log('Time before titleSearchController: ' + new Date().toISOString())
  const result = await titleSearchController(req)
  //console.log('Time after titleSearchController: ' + new Date().toISOString())
  if (result) {
    res.json(result)
  } else {
    res.status(500).json({ error: 'Failed to get titles' })
  }
})

export default router
