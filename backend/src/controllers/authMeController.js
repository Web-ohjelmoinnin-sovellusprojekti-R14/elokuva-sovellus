import jwt from 'jsonwebtoken'

function authMe(req, res, next) {
  const token = req.cookies?.token
  if (!token) return res.status(401).json({ error: 'Token missing' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { user_id: decoded.user_id, username: decoded.username }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export { authMe }
