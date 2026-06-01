export async function testWithRetry(
  operation: () => Promise<unknown>,
  options: {
    retries?: number
    delay?: number
    name: 'PostgreSQL' | 'Redis' | 'SMTP'
    fileName: '[loadPostgres.ts]' | '[loadRedis.ts]' | '[loadMailer.ts]'
  },
) {
  const { retries = 5, delay = 2000, name, fileName } = options

  for (let i = 0; i < retries; i++) {
    try {
      console.log(`${fileName} Attempting to connect to ${name}...`)
      await operation()
      console.log(`${fileName} Connected to ${name} successfully.`)
      break
    } catch (err) {
      console.error(
        `${fileName} ${name} connection attempt ${i + 1} failed:`,
        err,
      )
      if (i < retries - 1) {
        console.log(`${fileName} Retrying in ${(delay * i) / 1000} seconds...`)
        await new Promise((res) => setTimeout(res, delay * i))
      } else {
        console.error(`${fileName} All ${name} connection attempts failed.`)
        throw err
      }
    }
  }
}
