import type { Request, Response, NextFunction } from '../../types/user.types.js'
import { generateSecure6DigitString } from '../../utils/generateSecure6DigitString.js'
import argon2id from '@node-rs/argon2'
import { argon2Config } from '../../config/argon2.js'
import { redisKeys } from '../../config/redis.js'
import { redis } from '../../loaders/loadRedis.js'
import { enqueueOTPEmailJob } from '../../jobs/enqueueOTPEmailJob.js'

export function resendOtp(req: Request, res: Response) {}
