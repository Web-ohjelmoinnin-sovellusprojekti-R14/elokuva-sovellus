import pool from '../db.js'
import dotenv from 'dotenv'
dotenv.config()

<<<<<<< HEAD
async function deleteGroupController(group_id) {
  try {
    await pool.query('DELETE FROM group_member WHERE group_id=$1', [group_id])
    await pool.query('DELETE FROM groups WHERE group_id=$1', [group_id])

    return { message: 'Group was successfully deleted' }
  } catch (e) {
    throw new Error('Failed to delete group')
=======
async function deleteGroupController(group_id, user_id) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Проверяем, что пользователь владелец
    const ownerCheck = await client.query(
      'SELECT 1 FROM groups WHERE group_id=$1 AND owner_id=$2',
      [group_id, user_id]
    )

    if (ownerCheck.rows.length === 0) {
      throw new Error('Not authorized')
    }

    // Удаляем ВСЁ связанное
    await client.query('DELETE FROM films_in_group WHERE group_id=$1', [group_id])
    await client.query('DELETE FROM group_member WHERE group_id=$1', [group_id])
    await client.query('DELETE FROM group_request WHERE group_id=$1', [group_id])
    await client.query('DELETE FROM groups WHERE group_id=$1', [group_id])

    await client.query('COMMIT')
    return { message: 'Group deleted successfully' }

  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
>>>>>>> 21c3fbfee366e1e90e1cce2ef46130fbef857a26
  }
}

export { deleteGroupController }
