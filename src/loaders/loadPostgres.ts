import { postgresConfig } from '../config/postgres.js'
import { Pool } from 'pg'
import { testWithRetry } from '../utils/testConnectionsWithRetry.js'

let poolInstance: Pool | null = null

export async function loadPostgres() {
  const { pg_url } = postgresConfig

  const pool = new Pool({
    connectionString: pg_url,
  })

  //pg instance listeners
  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err)
    process.exit(-1)
  })

  //test the connection with retry
  await testWithRetry(() => pool.query('SELECT 1'), { name: 'PostgreSQL' })

  poolInstance = pool
  return pool
}

export const db = {
  query: async (text: string, params?: unknown[]) => {
    if (!poolInstance) {
      throw new Error('PostgreSQL pool not initialized')
    }
    return poolInstance.query(text, params)
  },
  getPool: () => {
    if (!poolInstance) {
      throw new Error('PostgreSQL pool not initialized')
    }
    return poolInstance
  },
}
