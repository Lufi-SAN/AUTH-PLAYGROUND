import { generateSecret, generateURI } from 'otplib'
import {
  getUserDetailsDB,
  updateUserTotpSecretDB,
} from '../repositories/totpRepo.js'
import { appConfig } from '../config/app.js'
import { UserNotFoundError } from '../errors/AppErrors.js'
import QRCode from 'qrcode'

async function callDBForDetails(userId: string) {
  return await getUserDetailsDB(userId)
}

function generateTotpSecret() {
  return generateSecret()
}

function createOtpURI(secret: string, email: string) {
  return generateURI({
    issuer: appConfig.appName,
    label: email,
    secret,
  })
}

async function generateQRCode(otpURI: string): Promise<string> {
  return await QRCode.toDataURL(otpURI)
}

async function updateUserTotpSecretInDB(userId: string, secret: string) {
  await updateUserTotpSecretDB(userId, secret)
}

export async function enrollTotpOrchestrator(userId: string) {
  const email = await callDBForDetails(userId)
  if (!email) {
    throw new UserNotFoundError('User not found')
  }
  const secret = generateTotpSecret()
  const otpURI = createOtpURI(secret, email)
  await updateUserTotpSecretInDB(userId, secret)

  const qrCodeDataURL = await generateQRCode(otpURI)

  return { otpURI, qrCodeDataURL }
}
