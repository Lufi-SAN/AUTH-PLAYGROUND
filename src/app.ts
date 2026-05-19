import express, { type Express } from 'express'
// import { appConfig } from './config/app.js'

export function createApp() {
  const app: Express = express()

  //express instance settings/config
  app.disable('x-powered-by')

  //express instance listeners (all routes)
  app.use(express.json())

  //express instance listeners (routes)

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
