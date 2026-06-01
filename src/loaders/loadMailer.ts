import { mailConfig } from '../config/nodemailer.js'
import nodemailer from 'nodemailer'
import { testWithRetry } from '../utils/testConnectionsWithRetry.js'

export type MailerClientType = ReturnType<typeof nodemailer.createTransport>
let transporterInstance: MailerClientType | null = null

export async function loadMailer() {
  const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: true, // true for 465, false for other ports
    auth: {
      user: mailConfig.user,
      pass: mailConfig.password,
    },
  })

  await testWithRetry(() => transporter.verify(), {
    name: 'SMTP',
    fileName: '[loadMailer.ts]',
  })

  transporterInstance = transporter
  return transporter
}

export const mailer = {
  getTransporterInstance: () => {
    if (!transporterInstance) {
      throw new Error('Mailer transporter not initialized')
    }
    return transporterInstance
  },
}
