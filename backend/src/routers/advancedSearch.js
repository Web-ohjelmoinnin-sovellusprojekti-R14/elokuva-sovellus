import { Router } from 'express'
const router = Router()
import { advancedSearchController } from '../controllers/advancedSearchController.js'

router.get('/advanced_search', async (req, res) => {
  const page = req.query.page || 1
  const media_type = req.query.media_type || null
  let year_min = req.query.year_min || null
  if (year_min) year_min = `${year_min}-01-01`
  let year_max = req.query.year_max || null
  if (year_max) year_max = `${year_max}-01-01`
  const imdb_rating_min = req.query.imdb_rating_min || null
  const imdb_rating_max = req.query.imdb_rating_max || null
  const include_adult = req.query.include_adult || false
  const with_genres = req.query.with_genres || null
  const with_origin_country = req.query.with_origin_country || null

  const response = await advancedSearchController(
    page,
    media_type,
    year_min,
    year_max,
    imdb_rating_min,
    imdb_rating_max,
    include_adult,
    with_genres,
    with_origin_country
  )

  if (response) {
    res.json(response)
  } else {
    res.status(500).json({ error: 'Failed to get titles' })
  }
})

export default router
