import { db } from '../loaders/loadPostgres.js'

export async function getUserByUsernameDB(username: string) {
  const query = `SELECT id, password_hash, is_verified, role, totp_secret FROM users WHERE username = $1`
  const values = [username]
  const result = await db.query(query, values)
  if (result.rows[0].is_verified === false) {
    return 'Not verified'
  }
  if (result.rows.length === 0) {
    return null
  }
  return {
    userId: result.rows[0].id as string,
    passwordHash: result.rows[0].password_hash as string,
    role: result.rows[0].role as string,
    totpSecret: result.rows[0].totp_secret as string | null,
  }
}
