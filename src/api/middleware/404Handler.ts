import type { Request, Response } from '../../types/user.types.js'

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    status: 404,
    title: 'Not Found',
    detail: 'The requested resource was not found on this server.',
  })
}
