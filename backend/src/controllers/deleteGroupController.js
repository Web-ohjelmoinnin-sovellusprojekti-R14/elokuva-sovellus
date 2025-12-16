import pool from '../db.js'
import dotenv from 'dotenv'
dotenv.config()

async function deleteGroupController(group_id, user_id) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Проверяем, что пользователь владелец
    const ownerCheck = await client.query('SELECT 1 FROM groups WHERE group_id=$1 AND owner_id=$2', [group_id, user_id])

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
  }
}

export { deleteGroupController }
