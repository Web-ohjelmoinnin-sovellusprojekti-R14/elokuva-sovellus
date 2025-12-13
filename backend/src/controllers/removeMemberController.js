import pool from '../db.js'

async function removeMemberController(owner_id, group_id, member_id) {
  const groupCheck = await pool.query('SELECT * FROM groups WHERE group_id=$1 AND owner_id=$2', [group_id, owner_id])

  if (groupCheck.rows.length === 0) {
    return { success: false, message: 'You are not the owner of this group' }
  }

  const memberCheck = await pool.query('SELECT * FROM group_member WHERE group_id=$1 AND user_id=$2', [
    group_id,
    member_id,
  ])

  if (memberCheck.rows.length === 0) {
    return { success: false, message: 'User is not a member of this group' }
  }

  await pool.query('DELETE FROM group_member WHERE group_id=$1 AND user_id=$2', [group_id, member_id])

  return { success: true, message: 'Member was removed from group' }
}

export { removeMemberController }
