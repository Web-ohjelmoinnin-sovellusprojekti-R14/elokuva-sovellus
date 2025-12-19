import { Router } from 'express'
const router = Router()
import { getTitleDetails } from '../controllers/getTitleDetailsController.js'
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 25,
  message: { error: 'Too much requests' },
})

router.get('/get_title_details', limiter, async (req, res) => {
  const response = await getTitleDetails(req.query.id, req.query.media_type, req.query.language)
  res.json(response)
})

export default router
