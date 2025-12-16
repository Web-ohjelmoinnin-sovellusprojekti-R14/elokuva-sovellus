import pool from '../db.js'
import dotenv from 'dotenv'
dotenv.config()

async function createGroupController(name, description, owner_id, res) {
  if (!name) {
    return res.status(400).json({ error: 'Group name is not provided' })
  }

  if (!owner_id) {
    return res.status(400).json({ error: 'Group name is not provided' })
  }

  const nameCheck = await pool.query('SELECT * FROM groups WHERE name=$1', [name])
  console.log(JSON.stringify(nameCheck))
  if (nameCheck.rows.length === 0) {
    const createdGroup = await pool.query(
      'INSERT INTO groups(name, description, owner_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *;',
      [name, description, owner_id]
    )
    await pool.query('INSERT INTO group_member(group_id, user_id, joined_at) VALUES ($1, $2, NOW())', [
      createdGroup.rows[0].group_id,
      owner_id,
    ])
    return { response: 'Group created successfully' }
  } else {
    return res.status(409).json({ error: 'Group with following name already exists' })
  }
}

export { createGroupController }
