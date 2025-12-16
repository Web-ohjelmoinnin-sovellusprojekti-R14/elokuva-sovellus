import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { sendInvitationController } from '../controllers/sendInvitationController.js'

router.post('/send_invitation', authMe, async (req, res) => {
  const owner_id = req.user.user_id
  const username = req.query.username
  const group_id = req.query.group_id

  if (!username || !group_id) {
    return res.status(400).json({ error: 'username and group_id are required' })
  }

  try {
    const result = await sendInvitationController(owner_id, username, group_id)

    if (!result.success) {
      if (result.message === 'User does not exist') return res.status(404).json(result)

      if (result.message === 'Group is not found') return res.status(404).json(result)

      if (result.message === 'Invitation is already sent') return res.status(409).json(result)

      if (result.message === 'Only group owner can send invitations') return res.status(403).json(result)

      return res.status(400).json(result)
    }

    return res.status(200).json(result)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Failed to send invitation' })
  }
})

export default router
