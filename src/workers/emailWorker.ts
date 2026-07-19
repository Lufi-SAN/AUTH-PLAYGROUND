//A Worker polling emailQueue
import { Worker } from 'bullmq'
import { sharedWorkerRedis } from './sharedRedisInstance.js'
import { mailer } from '../loaders/loadMailer.js'
import { appConfig } from '../config/app.js'

export function createEmailWorker() {
  const emailWorker = new Worker(
    'emailQueue',
    async (job) => {
      console.log(`Worker: ${job}`)
      const transporter = mailer.getTransporterInstance()
      const { email, otp } = job.data
      try {
        const info = await transporter.sendMail({
          from: '"Auth Playground" <onboarding@resend.dev>',
          to: email,
          subject: 'Your OTP Code',
          html: `<h1>Hello! Here's your OTP Code. Made easy through a verification link </h1><p>Click here: <a href="${appConfig.appDomain}/verify-email/${otp}">Verify Email</a></p>`,
        })

        console.log(`${appConfig.appDomain}/verify-email/${otp}/${email}`)
        console.log('Message sent ID:', info.messageId)
        console.log('Accepted Recipient List:', info.accepted) // Array of addresses that accepted the delivery
        console.log('Rejected Recipient List:', info.rejected) // Array of addresses that flat-out refused the message
        console.log('Raw SMTP Server Response:', info.response)
      } catch (error) {
        console.error('Nodemailer Runtime Execution Error:', error)
      }
    },
    {
      connection: sharedWorkerRedis as unknown as Worker['opts']['connection'],
    },
  )

  emailWorker.on('completed', (job) => {
    console.log(`Job with id ${job.id} has been completed`)
  })
}
