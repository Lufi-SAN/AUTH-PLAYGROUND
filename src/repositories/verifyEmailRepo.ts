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

export async function movePendingStatusToPermanentDB(
  currentEmail: string,
  newEmail: string,
) {
  const updateQuery = `UPDATE users SET email = $1 WHERE email = $2 RETURNING id, email`
  const deleteQuery = `DELETE FROM pending_email_changes WHERE email = $1`
  const updateValue = [newEmail, currentEmail]
  const deleteValue = [newEmail]

  const client = await db.getPoolInstance().connect()

  try {
    await client.query('BEGIN')
    const result = await client.query(updateQuery, updateValue)
    await client.query(deleteQuery, deleteValue)

    await client.query('COMMIT')

    return {
      userId: result.rows[0].id as string,
      newEmail: result.rows[0].email as string,
    }
  } catch (error) {
    console.error(
      'Transaction at movePendingStatusToPermanentDB function failed:',
      error,
    )
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
