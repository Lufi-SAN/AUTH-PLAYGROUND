export async function testWithRetry(
  operation: () => Promise<unknown>,
  options: {
    retries?: number
    delay?: number
    name: 'PostgreSQL' | 'Redis'
  },
) {
  const { retries = 5, delay = 2000, name } = options
  let fileName: string
  if (name === 'PostgreSQL') {
    fileName = '[loadPostgres.ts]'
  } else {
    fileName = '[loadRedis.ts]'
  }

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
