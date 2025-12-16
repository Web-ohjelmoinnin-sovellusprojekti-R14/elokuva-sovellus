import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { rejectInvitationController } from '../controllers/rejectInvitationController.js'

router.post('/reject_invitation', authMe, async (req, res) => {
  const user_id = req.user.user_id
  const group_request_id = req.query.group_request_id

  if (!group_request_id) {
    return res.status(400).json({ error: 'group_request_id is required' })
  }

  try {
    const result = await rejectInvitationController(user_id, group_request_id)
    return res.status(200).json(result)
  } catch (e) {
    if (e.code === 'NOT_FOUND') return res.status(404).json({ error: e.message })
    console.error(e)
    return res.status(500).json({ error: e.message || 'Failed to reject invitation' })
  }
})

export default router
