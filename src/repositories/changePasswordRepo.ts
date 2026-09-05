import { db } from '../loaders/loadPostgres.js'

export async function getUserPasswordHashDB(userId: string) {
  const query = `SELECT password_hash FROM users WHERE id = $1`
  const result = await db.query(query, [userId])
  if (result.rows.length === 0) {
    return null // User not found
  }
  return result.rows[0].password_hash as string
}

export async function updatePasswordHashDB(
  userId: string,
  newPasswordHash: string,
) {
  const query = `UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, password_hash`
  const values = [newPasswordHash, userId]

  // Update the password to the new password
  const result = await db.query(query, values)
  return {
    userId: result.rows[0].id as string,
    isVerified: result.rows[0].password_hash as boolean,
  }
}
