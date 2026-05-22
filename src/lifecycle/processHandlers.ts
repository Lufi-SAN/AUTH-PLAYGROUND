import type { Server, Pool, MyRedisClientType } from '../types/user.types.js'

export async function registerProcessHandlers({
  server,
  pg,
  redis,
}: {
  server: Server
  pg: Pool
  redis: MyRedisClientType
}) {
  let isShuttingDown = false

  async function gracefulShutdown() {
    if (isShuttingDown) return
    isShuttingDown = true
    console.log('Shutting down gracefully...')

    const forceShutdown = setTimeout(() => {
      console.log('Forcing shutdown after timeout...')
      process.exit(1)
    }, 10000) // Force shutdown after 10 seconds if not closed

    server.close(async () => {
      console.log('HTTP server closed.')
      try {
        await Promise.all([
          pg.end().then(() => console.log('PostgreSQL connection closed.')),
          redis.quit().then(() => console.log('Redis connection closed.')),
        ])
      } catch (err) {
        console.error('Error during shutdown:', err)
      } finally {
        clearTimeout(forceShutdown)
        process.exit(0)
      }
    })
  }

  function fatalShutdown(err: Error) {
    console.error('Fatal error occurred:', err)
    process.exit(1)
  }

  process.on('SIGINT', gracefulShutdown)
  process.on('SIGTERM', gracefulShutdown)
  process.on('uncaughtException', fatalShutdown)
  process.on('unhandledRejection', fatalShutdown)
}
