import pool from '../db.js'

async function getUserGroupsController(user_id) {
  const groups = await pool.query(
    `SELECT DISTINCT g.*,
            (g.owner_id = $1) AS is_owner
     FROM groups g
     LEFT JOIN group_member gm ON g.group_id = gm.group_id
     WHERE g.owner_id = $1 OR gm.user_id = $1`,
    [user_id]
  )

  return groups.rows
}

export { getUserGroupsController }
