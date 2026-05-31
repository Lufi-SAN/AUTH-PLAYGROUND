import { generateSecure6DigitString } from '../../utils/generateSecure6DigitString.js'
import argon2id from '@node-rs/argon2'
import { argon2Config } from '../../config/argon2.js'
import { saveNewUserDB } from '../../repositories/register/registerRepo.js'
import { redisKeys } from '../../config/redis.js'
import { DatabaseError } from 'pg'
import { UserAlreadyExists } from '../../errors/AppErrors.js'

export async function saveNewUser(
  username: string,
  email: string,
  password: string,
) {
  const otp = generateSecure6DigitString()
  const [passwordHash, otpHash] = await Promise.all([
    argon2id.hash(password, {
      memoryCost: argon2Config.memoryCost,
    }),
    argon2id.hash(otp, {
      memoryCost: argon2Config.memoryCost,
    }),
  ])
  try {
    const newUserData = await saveNewUserDB(username, email, passwordHash)
    redisKeys.emailVerificationOTP(newUserData.id, newUserData.email)
    return newUserData
  } catch (error) {
    if (error instanceof DatabaseError && error.code === '23505') {
      if (error.constraint === 'users_email_unique_idx') {
        throw new UserAlreadyExists('Email already exists')
      } else if (error.constraint === 'users_username_unique_idx') {
        throw new UserAlreadyExists('Username already exists')
      }
    }
    throw error
  }
}
