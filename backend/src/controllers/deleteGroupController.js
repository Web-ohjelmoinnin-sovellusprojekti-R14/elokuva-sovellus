import pool from '../db.js'
import dotenv from 'dotenv'
dotenv.config()

async function deleteGroupController(group_id) {
  try {
    await pool.query('DELETE FROM group_member WHERE group_id=$1', [group_id])
    await pool.query('DELETE FROM groups WHERE group_id=$1', [group_id])

    return { message: 'Group was successfully deleted' }
  } catch (e) {
    throw new Error('Failed to delete group')
  }
}

export { deleteGroupController }
