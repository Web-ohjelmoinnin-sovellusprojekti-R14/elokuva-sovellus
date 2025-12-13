import pool from '../db.js'

async function addFilmToGroupController(user_id, group_id, movie_id) {
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

  const filmCheck = await pool.query('SELECT * FROM films_in_group WHERE group_id=$1 AND movie_id=$2', [
    group_id,
    movie_id,
  ])

  if (filmCheck.rows.length > 0) {
    return { success: false, message: 'Movie already added to this group' }
  }

  await pool.query('INSERT INTO films_in_group (group_id, movie_id, added_by_id) VALUES ($1, $2, $3)', [
    group_id,
    movie_id,
    user_id,
  ])

  return { success: true, message: 'Movie added to group' }
}

export { addFilmToGroupController }
