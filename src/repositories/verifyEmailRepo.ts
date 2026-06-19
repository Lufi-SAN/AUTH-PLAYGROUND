import { db } from '../loaders/loadPostgres.js'

export async function getUserIdByEmailDB(email: string) {
  const query = `SELECT id, is_verified FROM users WHERE email = $1`
  const values = [email]
  const result = await db.query(query, values)
  if (result.rowCount === 0) {
    return null
  } else {
    return {
      userId: result.rows[0].id as string,
      isVerified: result.rows[0].is_verified as boolean,
    }
  }
}

export async function updateUserVerificationStatusDB(
  userId: string,
  verificationResult: boolean,
) {
  const query = `UPDATE users SET is_verified = $1 WHERE id = $2`
  const values = [verificationResult, userId]
  const result = await db.query(query, values)
}
