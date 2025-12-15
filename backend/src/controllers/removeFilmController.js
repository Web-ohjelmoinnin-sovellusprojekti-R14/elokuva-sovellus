import pool from '../db.js'

async function removeFilmFromGroupController(user_id, group_id, movie_id, media_type = 'movie') {
  const filmCheck = await pool.query('SELECT added_by_id FROM films_in_group WHERE group_id=$1 AND movie_id=$2 AND media_type=$3', [
    group_id,
    movie_id,
    media_type
  ])

  if (filmCheck.rows.length === 0) {
    return { success: false, message: 'Movie not found in this group' }
  }

  const added_by_id = filmCheck.rows[0].added_by_id

  const groupOwner = await pool.query('SELECT owner_id FROM groups WHERE group_id=$1', [group_id])

  if (groupOwner.rows.length === 0) {
    return { success: false, message: 'Group not found' }
  }

  const owner_id = groupOwner.rows[0].owner_id

  if (user_id !== owner_id && user_id !== added_by_id) {
    return { success: false, message: 'You have no rights to remove this movie' }
  }

  await pool.query('DELETE FROM films_in_group WHERE group_id=$1 AND movie_id=$2 AND media_type=$3', [group_id, movie_id, media_type])

  return { success: true, message: 'Movie removed from group' }
}

export { removeFilmFromGroupController }
