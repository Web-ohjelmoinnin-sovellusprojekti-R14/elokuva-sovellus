import { Router } from 'express'
const router = Router()
import { authMe } from '../controllers/authMeController.js'
import { deleteUserController } from '../controllers/deleteUserController.js'

router.delete('/delete_user', authMe, async (req, res) => {
  const user_id = req.user.user_id
  const response = await deleteUserController(user_id)
  switch (response.error) {
    case 'UserID is not provided':
      return res.status(400).json(response)
    case 'User not found':
      return res.status(404).json(response)
  }
  res.clearCookie('token')
  return res.status(200).json(response)
})

export default router
