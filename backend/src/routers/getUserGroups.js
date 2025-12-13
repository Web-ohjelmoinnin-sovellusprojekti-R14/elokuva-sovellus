import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { getUserGroupsController } from '../controllers/getUserGroupsController.js'

router.get('/get_user_groups', authMe, async (req, res) => {
  const user_id = req.user.user_id

  try {
    const groups = await getUserGroupsController(user_id)
    return res.status(200).json(groups)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Failed to fetch user groups' })
  }
})

export default router
