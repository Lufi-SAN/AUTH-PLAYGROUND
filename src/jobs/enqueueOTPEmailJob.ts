import { Queues } from '../loaders/loadQueues.js'

export async function enqueueOTPEmailJob(email: string, otp: string) {
  const emailQueue = Queues().emailQueue
  await emailQueue.add(
    'sendOTPEmail',
    { email, otp },
    { attempts: 5, backoff: { type: 'exponential', delay: 1000 } },
  )
}
