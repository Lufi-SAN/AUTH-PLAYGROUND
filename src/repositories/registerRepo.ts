import { db } from '../loaders/loadPostgres.js'
import type { VerificationStrategy } from '../types/user.types.js'

export async function saveNewUserDB(
  username: string,
  email: string,
  passwordHash: string,
  verificationStrategy: VerificationStrategy,
) {
  const query = `
        INSERT INTO users (username, email, password_hash, verification_strategy)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, email, verification_strategy
    `
  const values = [username, email, passwordHash, verificationStrategy]
  const result = await db.query(query, values)
  return result.rows[0]
}
