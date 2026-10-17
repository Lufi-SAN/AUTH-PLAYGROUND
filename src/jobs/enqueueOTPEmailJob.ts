import { Queues } from '../loaders/loadQueues.js'
import type { verifyEmailType } from '../types/user.types.js'

export async function enqueueOTPEmailJob(
  email: string,
  otp: string,
  type: verifyEmailType,
) {
  const emailQueue = Queues().emailQueue
  await emailQueue.add(
    'sendOTPEmail',
    { email, otp, type },
    { attempts: 5, backoff: { type: 'exponential', delay: 1000 } },
  )
}
