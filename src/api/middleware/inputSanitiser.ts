import { z } from 'zod'
import type { Request, Response, NextFunction } from '../../types/user.types.js'
import {
  BadRequestError,
  InvalidUserFormCredentials,
} from '../../errors/AppErrors.js'

export type SanitiserInputType =
  | 'body'
  | 'query'
  | 'params'
  | 'cookies'
  | 'headers'

export function sanitiserMiddleware(
  inputType: SanitiserInputType,
  schema: z.ZodSchema,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputData = req[inputType]

      const parsedData = sanitiser(inputData, schema) //op might throw
      req.validatedData = parsedData as Record<string, unknown>

      next()
    } catch (error) {
      console.error(`Error sanitising ${inputType}:`, error)

      //end request here, next(err) to global error handler
      if (error instanceof z.ZodError) {
        const isStructural = error.issues.some(
          (issue) =>
            issue.code === 'invalid_type' ||
            issue.code === 'invalid_union' ||
            issue.code === 'unrecognized_keys',
        )
        if (isStructural) {
          res.locals.errDetail = 'Malformed request structure.'
          return next(new BadRequestError())
        } else {
          res.locals.errDetail = 'Invalid data format or content.'
          return next(new InvalidUserFormCredentials())
        }
      }
    }
  }
}

function sanitiser(inputData: Record<string, unknown>, schema: z.ZodSchema) {
  const parsedData = schema.parse(inputData) //might throw if validation fails
  return parsedData
}
