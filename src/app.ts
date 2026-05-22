import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { appConfig } from './config/app.js'
import { loadRouter } from './loaders/loadRouter.js'

export function createApp() {
  const app = express()

  //express instance settings/config
  app.disable('x-powered-by')

  //express instance listeners (all routes)
  app.use(helmet())
  app.use(express.json())
  app.use(cookieParser())

  const v1Router = loadRouter()
  //express instance listeners (routes)
  app.use('/api/v1', v1Router)

  //listener for unhandled routes
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
  })

  //listener for global errors
  app.use((err: Error, req: express.Request, res: express.Response) => {
    console.error('Global error handler:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  })

  //return the express instance
  return app
}
