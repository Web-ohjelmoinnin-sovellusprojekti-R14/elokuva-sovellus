import pool from '../db.js'

async function deleteUserController(user_id) {
  if (!user_id) {
    return { error: 'UserID is not provided' }
  }

  const userCheck = await pool.query('SELECT * FROM "User" WHERE user_id=$1', [user_id])

  if (userCheck.rows.length === 0) {
    return { error: 'User not found' }
  }

  await pool.query('DELETE FROM films_in_group WHERE added_by_id=$1', [user_id])
  await pool.query('DELETE FROM group_member WHERE user_id=$1', [user_id])
  await pool.query('DELETE FROM group_request WHERE user_id=$1', [user_id])
  await pool.query('DELETE FROM groups WHERE owner_id=$1', [user_id])
  await pool.query('DELETE FROM review WHERE user_id=$1', [user_id])
  await pool.query('DELETE FROM "User" WHERE user_id=$1', [user_id])

  return { response: 'User deleted successfully' }
}

export { deleteUserController }
