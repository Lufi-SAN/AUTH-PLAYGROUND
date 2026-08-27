//Creating Queues
import { Queue } from 'bullmq'
import { Redis } from 'ioredis'

let emailQueue: Queue | null = null
let queueArray: (Queue | null)[] = []

export function loadQueues() {
  const sharedQueueRedis = new Redis({
    host: '127.0.0.1',
    port: 6379,
  })

  const email = new Queue('emailQueue', {
    connection: sharedQueueRedis as unknown as Queue['opts']['connection'],
  }) //any job added to this queue goes to emailQueue worker

  //Give them all variables to hold/reference them
  emailQueue = email
  //Store all the variables in an array
  queueArray = [emailQueue]
}

//(safe i.e. after init) function that returns all the Queues we have from the array
export const Queues = function () {
  if (queueArray.includes(null)) {
    throw new Error(`All queues not yet initialized: ${queueArray}`)
  }
  return {
    emailQueue: emailQueue as Queue,
  }
}
