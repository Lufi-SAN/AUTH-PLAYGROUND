import argon2id from '@node-rs/argon2'
import { argon2Config } from '../config/argon2.js'

export async function createPasswordHash(password: string) {
  const passwordHash = await argon2id.hash(password, {
    memoryCost: argon2Config.memoryCost,
  })
  return passwordHash
}
