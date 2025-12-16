import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { getGroupDetailsController } from '../controllers/getGroupDetailsController.js'

router.get('/get_group_details', authMe, async (req, res) => {
  const group_id = req.query.group_id

  if (!group_id) {
    return res.status(400).json({ error: 'Group ID is not provided' })
  }

  try {
<<<<<<< HEAD
    const response = await getGroupDetailsController(group_id, res)
=======
    const response = await getGroupDetailsController(group_id)
>>>>>>> 21c3fbfee366e1e90e1cce2ef46130fbef857a26
    return res.status(200).json(response)
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Failed to create group' })
  }
})

export default router
