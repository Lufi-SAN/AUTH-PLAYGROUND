import nodeCron from 'node-cron'
import { rotateKeys } from '../services/keyManager.js'

export async function scheduleCronJobs() {
  nodeCron.schedule('0-14 0 1 * *', generateAndStoreJWK, {
    timezone: 'UTC',
    name: 'Generate and store JWK',
  })
}

async function generateAndStoreJWK() {
  try {
    console.log(
      'Generating and storing JWK for rotation, this action occurs 1st of every month...',
    )
    await rotateKeys()
  } catch (error) {
    console.error('Error during key rotation sequence:', error)
  }
}
