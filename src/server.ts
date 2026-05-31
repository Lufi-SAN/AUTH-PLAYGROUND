import { appConfig } from './config/app.js'
import { loadPostgres, loadRedis } from './loaders/LOADER_SINK.js'
import { registerProcessHandlers } from './lifecycle/processHandlers.js'
import { createApp } from './app.js'

async function startServer() {
  const pg = await loadPostgres()
  const redis = await loadRedis()
  const app = createApp()

  const server = app.listen(appConfig.port, () => {
    console.log(`Server is running on port ${appConfig.port}`)
  })

  registerProcessHandlers({ server, pg, redis })
}

startServer()
