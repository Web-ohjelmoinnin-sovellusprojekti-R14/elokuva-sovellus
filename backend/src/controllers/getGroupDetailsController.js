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

async function getGroupDetailsController(group_id, res) {
  try {
    // 1. Получаем саму группу
    const groupDetails = await pool.query(groupDetailsQuery, [group_id])
    if (groupDetails.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' })
    }

    // 2. Получаем участников
    const groupMembers = await pool.query(groupMembersQuery, [group_id])

    // 3. Добавляем участников в объект group
    const result = {
      ...groupDetails.rows[0],
      members: groupMembers.rows,
    }

    // 4. Отправляем ответ
    return res.json(result)
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export { getGroupDetailsController }
