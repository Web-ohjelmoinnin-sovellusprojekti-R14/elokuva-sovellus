import { Router } from 'express'
const router = Router()
import { titleSearchController } from '../controllers/titleSearchController.js'

router.get('/titlesearch', async (req, res) => {
  const result = await titleSearchController(req)
  if (result) {
    res.json(result)
  } else {
    res.status(500).json({ error: 'Failed to get titles' })
  }
})

export default router
