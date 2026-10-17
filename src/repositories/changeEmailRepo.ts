import { db } from '../loaders/loadPostgres.js'

export async function getUserDetailsDB(userId: string, currentEmail: string) {
  const query = `SELECT email, totp_enabled, totp_secret FROM users WHERE id = $1 AND email = $2`
  const values = [userId, currentEmail]

  const result = await db.query(query, values)

  if (result.rowCount === 0) {
    return null
  }

  return {
    email: result.rows[0].email as string,
    totpEnabled: result.rows[0].totp_enabled as boolean,
    totpSecret: result.rows[0].totp_secret as string | null,
  }
}

export async function saveToPendingEmailDB(userId: string, newEmail: string) {
  const query = `INSERT INTO pending_email_changes (user_id, email) VALUES ($1, $2)`
  const values = [userId, newEmail]

  await db.query(query, values)
}
