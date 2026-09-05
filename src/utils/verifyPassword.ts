import argon2id from '@node-rs/argon2'
import { argon2Config } from '../config/argon2.js'

export async function verifyPassword(password: string, passwordHash: string) {
  return await argon2id.verify(passwordHash, password, {
    memoryCost: argon2Config.memoryCost,
  })
}
