import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { removeMemberController } from '../controllers/removeMemberController.js'

router.delete('/remove_member', authMe, async (req, res) => {
  const owner_id = req.user.user_id
  const group_id = req.query.group_id
  const member_id = req.query.member_id

  if (!group_id || !member_id) {
    return res.status(400).json({ error: 'group_id and member_id are required' })
  }

  try {
    const result = await removeMemberController(owner_id, group_id, member_id)

    if (!result.success) {
      return res.status(403).json(result)
    }

    return res.status(200).json(result)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Failed to remove group member' })
  }
})

export default router
