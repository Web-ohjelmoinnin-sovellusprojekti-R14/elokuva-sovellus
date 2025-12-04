import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

function authMiddleware(req, res, next) {
  const token = req.cookies.token

  if (!token) {
    return res.status(401).json({ error: 'Token missing' })
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  req.token = decoded
  next()
}

export { authMiddleware }
