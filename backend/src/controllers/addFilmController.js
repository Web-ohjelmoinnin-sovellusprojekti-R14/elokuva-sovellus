import pool from '../db.js'

async function addFilmToGroupController(user_id, group_id, movie_id, media_type = 'movie') {
  const userCheck = await pool.query('SELECT * FROM "User" WHERE user_id=$1', [user_id])

  if (userCheck.rows.length === 0) {
    return { success: false, message: 'User not found' }
  }

  const groupCheck = await pool.query('SELECT * FROM groups WHERE group_id=$1', [group_id])

  if (groupCheck.rows.length === 0) {
    return { success: false, message: 'Group not found' }
  }

  const memberCheck = await pool.query('SELECT * FROM group_member WHERE group_id=$1 AND user_id=$2', [
    group_id,
    user_id,
  ])

  if (memberCheck.rows.length === 0) {
    return { success: false, message: 'You are not a member of this group' }
  }

  const filmCheck = await pool.query(
    'SELECT * FROM films_in_group WHERE group_id=$1 AND movie_id=$2 AND media_type=$3',
    [group_id, movie_id, media_type]
  )

  if (filmCheck.rows.length > 0) {
    return { success: false, message: 'Movie already added to this group' }
  }

  await pool.query('INSERT INTO films_in_group (group_id, movie_id, added_by_id, media_type) VALUES ($1, $2, $3, $4)', [
    group_id,
    movie_id,
    user_id,
    media_type,
  ])

  return { success: true, message: 'Movie added to group' }
}

export { addFilmToGroupController }
