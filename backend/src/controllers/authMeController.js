import jwt from 'jsonwebtoken'

function authMe(req, res) {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ user: null })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return res.json({ user: decoded })
  } catch {
    return res.status(401).json({ user: null })
  }
}

export default authMe