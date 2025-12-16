import pool from '../db.js'
import dotenv from 'dotenv'
dotenv.config()

async function editGroupController(group_id, name, description, owner_id, res) {
  if (name) {
    const nameCheck = await pool.query('SELECT * FROM groups WHERE name=$1', [name])
    if (nameCheck.rows.length === 0) {
      await pool.query('UPDATE groups SET name=$1 WHERE group_id=$2', [name, group_id])
    } else {
      return res.status(200).json({ response: 'Group name is already occupied' })
    }
  }

  if (owner_id) {
    await pool.query('UPDATE groups SET owner_id=$1 WHERE group_id=$2', [owner_id, group_id])
  }

  if (description) {
    await pool.query('UPDATE groups SET description=$1 WHERE group_id=$2', [description, group_id])
  }

  const updated = await pool.query('SELECT * FROM groups WHERE group_id=$1', [group_id])

  return updated.rows
}

export { editGroupController }
