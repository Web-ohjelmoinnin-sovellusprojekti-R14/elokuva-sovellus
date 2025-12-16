import pool from '../db.js'
import dotenv from 'dotenv'
dotenv.config()

const groupDetailsQuery = `
  SELECT * FROM groups WHERE group_id = $1
`

const groupMembersQuery = `
  SELECT 
      gm.group_id,
      gm.user_id,
      u.username,
      gm.joined_at
  FROM group_member gm
  JOIN "User" u ON gm.user_id = u.user_id
  WHERE gm.group_id = $1
`

async function getGroupDetailsController(group_id) {
  try {
    // 1. Получаем саму группу
    const groupDetails = await pool.query(groupDetailsQuery, [group_id])
    if (groupDetails.rows.length === 0) {
      throw new Error('Group not found')
    }

    // 2. Получаем участников
    const groupMembers = await pool.query(groupMembersQuery, [group_id])

    // 3. Добавляем участников в объект group
    return {
      ...groupDetails.rows[0],
      members: groupMembers.rows,
    }
  } catch (e) {
    console.error(e)
    throw e
  }
}

export { getGroupDetailsController }
