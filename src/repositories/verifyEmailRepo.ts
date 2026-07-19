import { db } from '../loaders/loadPostgres.js'

export async function updateUserVerificationStatusDB(email: string) {
  const query = `UPDATE users SET is_verified = true WHERE email = $1 AND is_verified = false RETURNING id, is_verified`
  const values = [email]
  const result = await db.query(query, values)
  if (result.rows.length === 0) {
    return null
  } else {
    return {
      userId: result.rows[0].id as string,
      isVerified: result.rows[0].is_verified as boolean,
    }
  }
}
