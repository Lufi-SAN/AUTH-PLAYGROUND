import { db } from '../loaders/loadPostgres.js'

export async function updateUserRoleDB(
  newRole: string,
  userId: string,
  oldRole: string,
) {
  const query = `UPDATE users SET role = $1 WHERE id = $2 AND role = $3 RETURNING id, role`
  const result = await db.query(query, [newRole, userId, oldRole])
  if (result.rows.length === 0) {
    return null
  }
  return {
    userId: result.rows[0].id as string,
    role: result.rows[0].role as string,
  }
}
