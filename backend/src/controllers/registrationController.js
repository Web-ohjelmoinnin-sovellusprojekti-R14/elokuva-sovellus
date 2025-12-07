import bcrypt from 'bcrypt'
import pool from '../db.js'
import dotenv from 'dotenv'
dotenv.config()

async function registrationController(req, res) {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Required fields missing.' })
  }

  const existing = await pool.query('SELECT * FROM "User" WHERE username=$1', [username])
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'Username already taken.' })
  }

  const hash = await bcrypt.hash(password, 10)

  const result = await pool.query(
    'INSERT INTO "User" (password_hash, username, created_at) VALUES ($1, $2, NOW()) RETURNING user_id, username',
    [hash, username]
  )

  const user = result.rows[0]

  return res.status(201).json({ user: { user_id: user.user_id, username: user.username } })
}

export { registrationController }
