import { appConfig } from './config/app.js'
import { setupAppState } from './lifecycle/appState.js'
import {
  loadPostgres,
  loadRedis,
  loadMailer,
  loadQueues,
  loadWorkers,
} from './loaders/LOADER_SINK.js'
import { registerProcessHandlers } from './lifecycle/processHandlers.js'
import { createApp } from './app.js'
import { scheduleCronJobs } from './jobs/cronjobs.js'

async function startServer() {
  setupAppState()
  const pg = await loadPostgres()
  const redis = await loadRedis()
  const mailer = await loadMailer()
  loadQueues()
  loadWorkers()
  scheduleCronJobs()

  const app = createApp()

  const server = app.listen(appConfig.port, () => {
    console.log(`Server is running on port ${appConfig.port}`)
  })

  registerProcessHandlers({ server, pg, redis, mailer })
}

startServer()
