import {
  getUserTotpSecretDB,
  updateUserTotpEnabledDB,
} from '../repositories/totpRepo.js'
import { verify } from 'otplib'
import { MissingAuthCredentialsError } from '../errors/AppErrors.js'

async function getUserTotpSecretFromDB(userId: string): Promise<string | null> {
  return await getUserTotpSecretDB(userId)
}

async function updateToTotpEnabledInDB(userId: string) {
  await updateUserTotpEnabledDB(userId)
}

export async function verifyTotpOrchestrator(userId: string, code: string) {
  const secret = await getUserTotpSecretFromDB(userId)
  if (!secret) {
    throw new MissingAuthCredentialsError('TOTP secret not found for user')
  }
  const verification = await verify({
    secret,
    token: code,
  })
  if (verification.valid) {
    await updateToTotpEnabledInDB(userId)
    return { message: 'TOTP verification successful' }
  } else {
    throw new MissingAuthCredentialsError('Invalid TOTP code')
  }
}
