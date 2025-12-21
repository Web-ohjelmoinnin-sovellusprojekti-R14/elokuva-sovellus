import { Router } from 'express'
const router = Router()
import { titleSearchController } from '../controllers/titleSearchController.js'
import rateLimit from 'express-rate-limit'
import { withCache } from '../controllers/cacheWrapper.js'

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 25,
  message: { error: 'Too much requests' },
})

const searchCache = new Map()

router.get('/titlesearch', limiter, async (req, res) => {
  try {
    const q = req.query.q || ''
    const page = req.query.page || 1
    const language = req.query.language || 'en-US'
    const cacheKey = `titlesearch:q=${q}&page=${page}&language=${language}`

    const result = await withCache(searchCache, cacheKey, async () => {
      return await titleSearchController(req)
    })

    return res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to get titles' })
  }
})

export default router
