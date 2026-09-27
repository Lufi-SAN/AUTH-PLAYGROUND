import express from 'express'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { appConfig } from './config/app.js'
import { loadRouter } from './loaders/LOADER_SINK.js'
import {
  globalErrorHandler,
  notFoundHandler,
} from './api/middleware/MIDDLEWARE_SINK.js'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yaml'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function createApp() {
  const app = express()

  //express instance settings/config
  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  //express instance listeners (all routes)
  app.use(helmet())
  app.use(express.json())
  app.use(cookieParser())

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(
      YAML.parse(
        fs.readFileSync(
          path.join(__dirname, '..', '/openapi/openapi.yaml'),
          'utf8',
        ),
      ),
    ),
  )
  const v1Router = loadRouter()
  //express instance listeners (routes)
  app.use('/api/v1', v1Router)

  //listener for unhandled routes
  app.use(notFoundHandler)

  //listener for global errors
  app.use(globalErrorHandler)

  //return the express instance
  return app
}
