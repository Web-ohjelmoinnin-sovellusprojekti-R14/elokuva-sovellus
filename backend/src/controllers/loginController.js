import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import dotenv from 'dotenv'
dotenv.config()

async function loginController(req, res) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' })
  }

  try {
    const userQuery = 'SELECT * FROM "User" WHERE username = $1'
    const result = await pool.query(userQuery, [username])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    const token = jwt.sign({ user_id: user.user_id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    })

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    return res.status(200).json({
      user: {
        user_id: user.user_id,
        username: user.username,
        created_at: user.created_at,
      },
      token,
    })
  } catch (err) {
    console.error(err)
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Login failed.' })
    }
  }
}

export { loginController }