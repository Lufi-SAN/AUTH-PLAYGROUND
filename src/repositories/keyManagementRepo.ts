import { db } from '../loaders/loadPostgres.js'
import type { JWK } from 'jose'

interface UpdateData {
  kid: string
  privateJwk: JWK
  publicJwk: JWK
  rotationPeriod: string
}

export async function insertNewActiveRowIfNecessary(updateData: UpdateData) {
  const client = await db.getPoolInstance().connect()

  try {
    const { rotationPeriod } = updateData

    await client.query('BEGIN')
    //Lock whatever is active (Important for when we have multiple processes of this - so they are concurrently acting on the same thing)
    await client.query(
      `SELECT id FROM jwk_store WHERE status = 'active' FOR UPDATE`,
    )
    //The way this works is 1. Yeah there are many processes that want to affect the same thing. The "thing" is centralized e.g. like a db
    //2. Only the fastest(in this case, not constant) should win & the others should wait & use the result
    //3. So declare a "waiting point". There are many places you can place the waiting point in the processes involved
    //In this case, it is FOR UPDATE. It is in the Postgres process that the waiting point is created.
    //FOR UPDATE locks the matching row(s) the fastest process has "locked it" at this point, any process that comes after has to wait for the row to "unlock"
    //So process A completes & when other processes can now act they will only go down data recovery NOT data creation

    const existing = await client.query(
      `SELECT kid, private_jwk, public_jwk, rotation_period FROM jwk_store WHERE rotation_period = $1`,
      [rotationPeriod],
    )
    if (existing.rowCount && existing.rowCount > 0) {
      await client.query('COMMIT')
      return existing.rows[0]
    }

    const { kid, privateJwk, publicJwk } = updateData

    await client.query(`UPDATE jwk_store
   SET status = 'retired'
   WHERE status = 'active'`)

    const newRow = await client.query(
      `INSERT INTO jwk_store (kid, private_jwk, public_jwk, status, rotation_period) VALUES($1, $2, $3, 'active', $4) RETURNING kid, private_jwk, public_jwk, rotation_period`,
      [kid, privateJwk, publicJwk, rotationPeriod],
    )

    await client.query('COMMIT')
    return newRow.rows[0]
  } catch (error) {
    console.error(
      'Transaction at insertActiveRowIfNecessary function failed:',
      error,
    )

    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
