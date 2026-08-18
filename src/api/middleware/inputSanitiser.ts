import { z } from 'zod'
import type { Request, Response, NextFunction } from '../../types/user.types.js'
import {
  BadRequestError,
  InvalidUserFormCredentialsError,
} from '../../errors/AppErrors.js'

export type SanitiserInputType =
  | 'body'
  | 'query'
  | 'params'
  | 'cookies'
  | 'headers'

export function sanitiserMiddleware<T extends z.ZodSchema>(
  inputType: SanitiserInputType,
  schema: T,
  callback: (req: Request, parsedData: z.infer<T>) => void,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const inputData = req[inputType]

      const parsedData = sanitiser(inputData, schema) //op might throw
      callback(req, parsedData)

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
          return next(new BadRequestError('Malformed request structure.'))
        } else {
          return next(
            new InvalidUserFormCredentialsError(
              'Invalid data format or content.',
            ),
          )
        }
      }
    }
  }
}

function sanitiser<T extends z.ZodSchema>(inputData: z.infer<T>, schema: T) {
  const parsedData = schema.parse(inputData) //might throw if validation fails
  return parsedData
}
