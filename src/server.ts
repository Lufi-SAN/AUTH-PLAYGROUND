import { createApp } from './app.js'
import { appConfig } from './config/app.js'
import { loadPostgres } from './loaders/loadPostgres.js'
import { loadRedis } from './loaders/loadRedis.js'

async function startServer() {
  await loadPostgres()
  await loadRedis()
  const app = createApp()

  const server = app.listen(appConfig.port, () => {
    console.log(`Server is running on port 3000`)
  })
}

startServer()
