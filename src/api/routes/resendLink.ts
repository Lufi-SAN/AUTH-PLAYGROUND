import { Router } from 'express'
import { z } from 'zod'
import type { Request } from '../../types/user.types.js'
import { resendLink } from '../controllers/resendLinkController.js'
import { sanitiserMiddleware } from '../middleware/inputSanitiser.js'
import { resendLinkSchema } from './schemas/SCHEMA_SINK.js'

export function resendLinkRoute() {
  const router = Router()

  router.post(
    '/:email',
    sanitiserMiddleware(
      'params',
      resendLinkSchema,
      (req: Request, parsedData: z.infer<typeof resendLinkSchema>) => {
        req.validatedData = parsedData
      },
    ),
    resendLink,
  )

  return router
}
