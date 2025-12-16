import pool from '../db.js'

async function getUserInvitationsController(user_id, res) {
  try {
    const invitations = await pool.query(
      `
      SELECT 
          gr.group_request_id,
          gr.group_id,
          g.name AS group_name,
          gr.status
      FROM group_request gr
      JOIN groups g ON gr.group_id = g.group_id
      WHERE gr.user_id = $1
      ORDER BY gr.group_request_id DESC
      `,
      [user_id]
    )

    return { invitations: invitations.rows }
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch invitations' })
  }
}

export { getUserInvitationsController }
