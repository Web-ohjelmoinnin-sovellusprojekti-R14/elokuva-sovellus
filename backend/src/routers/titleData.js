import { Router } from 'express'
const router = Router()
import { getTitleDetails } from '../controllers/getTitleDetailsController.js'

router.get('/get_title_details', async (req, res) => {
  const response = await getTitleDetails(req.query.id, req.query.media_type, req.query.language)
  res.json(response)
})

export default router
