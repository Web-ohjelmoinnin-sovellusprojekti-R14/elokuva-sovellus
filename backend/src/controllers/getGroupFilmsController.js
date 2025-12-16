import pool from '../db.js'

async function getGroupFilmsController(user_id, group_id) {
  const groupCheck = await pool.query('SELECT * FROM groups WHERE group_id=$1', [group_id])

  if (groupCheck.rows.length === 0) {
    return { success: false, message: 'Group not found' }
  }

  const memberCheck = await pool.query('SELECT * FROM group_member WHERE group_id=$1 AND user_id=$2', [
    group_id,
    user_id,
  ])

  if (memberCheck.rows.length === 0) {
    return { success: false, message: 'Access denied' }
  }

  const films = await pool.query(
    `SELECT
        f.movie_id,
        f.media_type,
        f.added_by_id,
        u.username AS added_by_username
     FROM films_in_group f
     JOIN "User" u ON u.user_id = f.added_by_id
     WHERE f.group_id = $1`,
    [group_id]
  )

  return { success: true, films: films.rows }
}

export { getGroupFilmsController }
