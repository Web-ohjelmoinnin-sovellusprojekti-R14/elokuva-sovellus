import { Router } from 'express'
const router = Router()

import { authMe } from '../controllers/authMeController.js'
import { acceptInvitationController } from '../controllers/acceptInvitationController.js'

router.post('/accept_invitation', authMe, async (req, res) => {
  const user_id = req.user.user_id
  const group_request_id = req.query.group_request_id

  if (!group_request_id) {
    return res.status(400).json({ error: 'group_request_id is required' })
  }

  return acceptInvitationController(user_id, group_request_id, res)
})

export default router
