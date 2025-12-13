import pool from '../db.js'

async function acceptInvitationController(user_id, group_request_id, res) {
  try {
    const request = await pool.query(`SELECT * FROM group_request WHERE group_request_id=$1 AND user_id=$2`, [
      group_request_id,
      user_id,
    ])

    if (request.rows.length === 0) {
      return res.status(404).json({ error: 'Invitation not found' })
    }

    const group_id = request.rows[0].group_id

    const membership = await pool.query(`SELECT * FROM group_member WHERE user_id=$1 AND group_id=$2`, [
      user_id,
      group_id,
    ])

    if (membership.rows.length > 0) {
      await pool.query(`DELETE FROM group_request WHERE group_request_id=$1`, [group_request_id])

      return res.status(200).json({ response: 'You are already a member of this group' })
    }

    await pool.query(`DELETE FROM group_request WHERE group_request_id=$1`, [group_request_id])

    await pool.query(
      `INSERT INTO group_member (group_id, user_id, joined_at)
       VALUES ($1, $2, NOW())`,
      [group_id, user_id]
    )

    return res.status(200).json({ response: 'Invitation accepted successfully' })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Failed to accept invitation' })
  }
}

export { acceptInvitationController }
