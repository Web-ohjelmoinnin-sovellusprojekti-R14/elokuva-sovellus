import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { deleteGroupController } from '../controllers/deleteGroupController.js'

router.delete('/delete_group', authMe, async (req, res) => {
  const group_id = req.query.group_id
  const user_id = req.user.user_id

  if (!group_id) {
    return res.status(400).json({ error: 'Group ID is not provided' })
  }

  try {
    const response = await deleteGroupController(group_id, user_id)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
})

export default router
