import pool from '../db.js'

async function rejectInvitationController(user_id, group_request_id) {
  if (!group_request_id) throw new Error('group_request_id is required')

  const check = await pool.query(
    `SELECT group_request_id, group_id FROM group_request
     WHERE group_request_id = $1 AND user_id = $2`,
    [group_request_id, user_id]
  )

  if (check.rows.length === 0) {
    const err = new Error('Invitation not found')
    err.code = 'NOT_FOUND'
    throw err
  }
  await pool.query(`DELETE FROM group_request WHERE group_request_id = $1`, [group_request_id])

  return { response: 'Invitation rejected successfully' }
}

export { rejectInvitationController }
