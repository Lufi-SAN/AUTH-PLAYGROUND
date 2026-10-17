import { appConfig } from '../config/app.js'
import nodeCron from 'node-cron'
import { rotateKeys } from '../services/keyManager.js'

export async function scheduleCronJobs() {
  const JWKCronMonthly = '0-14 0 1 * *'
  const JWKCronDaily = '0-14 0 * * *'
  nodeCron.schedule(
    appConfig.keyRotation === 'daily' ? JWKCronDaily : JWKCronMonthly,
    generateAndStoreJWK,
    {
      timezone: 'UTC',
      name: 'Generate and store JWK',
    },
  )
}

async function generateAndStoreJWK() {
  try {
    console.log(
      'Generating and storing JWK for rotation, this action occurs 1st of every month or beginning of every day...',
    )
    await rotateKeys()
  } catch (error) {
    console.error('Error during key rotation sequence:', error)
  }
}
