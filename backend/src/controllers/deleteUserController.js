import pool from '../db.js';

async function deleteUserController(user_id) {
  if (!user_id) {
    return { error: 'UserID is not provided' };
  }

  const userCheck = await pool.query('SELECT * FROM "User" WHERE user_id=$1', [user_id]);
  if (userCheck.rows.length === 0) {
    return { error: 'User not found' };
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const ownedGroups = await client.query(
      'SELECT group_id FROM groups WHERE owner_id = $1',
      [user_id]
    );

    const groupIds = ownedGroups.rows.map(row => row.group_id);
    if (groupIds.length > 0) {
      await client.query('DELETE FROM films_in_group WHERE group_id = ANY($1)', [groupIds]);
      await client.query('DELETE FROM group_member WHERE group_id = ANY($1)', [groupIds]);
      await client.query('DELETE FROM group_request WHERE group_id = ANY($1)', [groupIds]);
      await client.query('DELETE FROM groups WHERE group_id = ANY($1)', [groupIds]);
    }

    await client.query('DELETE FROM films_in_group WHERE added_by_id = $1', [user_id]);
    await client.query('DELETE FROM group_member WHERE user_id = $1', [user_id]);
    await client.query('DELETE FROM group_request WHERE user_id = $1', [user_id]);
    await client.query('DELETE FROM review WHERE user_id = $1', [user_id]);
    await client.query('DELETE FROM "User" WHERE user_id = $1', [user_id]);

    await client.query('COMMIT');

    return { response: 'User deleted successfully' };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting user:', err);
    throw err;
  } finally {
    client.release();
  }
}

export { deleteUserController };