import pool from '../db.js'

async function sendInvitationController(owner_id, username, group_id) {
  const groupCheck = await pool.query('SELECT owner_id FROM groups WHERE group_id=$1', [group_id])

  if (groupCheck.rows.length === 0) {
    return { success: false, message: 'Group is not found' }
  }

  if (groupCheck.rows[0].owner_id !== owner_id) {
    return { success: false, message: 'Only group owner can send invitations' }
  }

  const userResult = await pool.query(`SELECT user_id FROM "User" WHERE username = $1`, [username])

  if (userResult.rows.length === 0) {
    return { success: false, message: 'User does not exist' }
  }

  const invited_user_id = userResult.rows[0].user_id

  const checkInvitation = await pool.query('SELECT * FROM group_request WHERE user_id=$1 AND group_id=$2', [
    invited_user_id,
    group_id,
  ])

  if (checkInvitation.rows.length > 0) {
    return { success: false, message: 'Invitation is already sent' }
  }

  await pool.query('INSERT INTO group_request(group_id, user_id) VALUES ($1, $2)', [group_id, invited_user_id])

  return { success: true, message: 'Invitation is sent' }
}

export { sendInvitationController }
