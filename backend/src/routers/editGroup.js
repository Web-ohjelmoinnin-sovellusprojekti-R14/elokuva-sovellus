import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { editGroupController } from '../controllers/editGroupController.js'

router.put('/edit_group', authMe, async (req, res) => {
  const group_id = req.query.group_id

  if (!group_id) {
    return res.status(400).json({ error: 'Group ID is not provided' })
  }

  const name = req.query.name || null
  const description = req.query.description || null
  const owner_id = req.query.owner_id || null

  try {
    const response = await editGroupController(group_id, name, description, owner_id, res)
    return res.status(200).json(response)
  } catch (e) {
    return res.status(400).json({ error: e.message || 'Failed to edit group' })
  }
})

export default router
