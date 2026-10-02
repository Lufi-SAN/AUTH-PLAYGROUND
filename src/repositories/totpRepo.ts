import { db } from '../loaders/loadPostgres.js'

export async function getUserDetailsDB(userId: string) {
  const query = `SELECT email FROM users WHERE id = $1`
  const values = [userId]

  const result = await db.query(query, values)

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0].email
}

export async function updateUserTotpSecretDB(userId: string, secret: string) {
  const query = `UPDATE users SET totp_secret = $1 WHERE id = $2`
  const values = [secret, userId]

  await db.query(query, values)
}

export async function getUserTotpSecretDB(userId: string) {
  const query = `SELECT totp_secret FROM users WHERE id = $1`
  const values = [userId]

  const result = await db.query(query, values)

  if (result.rows.length === 0) {
    return null
  }

  return result.rows[0].totp_secret
}

export async function updateUserTotpEnabledDB(userId: string) {
  const query = `UPDATE users SET totp_enabled = true WHERE id = $1`
  const value = [userId]

  await db.query(query, value)
}
