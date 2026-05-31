import { db } from '../../loaders/loadPostgres.js'

export async function saveNewUserDB(
  username: string,
  email: string,
  passwordHash: string,
) {
  const query = `
        INSERT INTO users (username, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, username, email
    `
  const values = [username, email, passwordHash]
  const result = await db.query(query, values)
  return result.rows[0]
}
