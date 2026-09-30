import type { Request, Response, NextFunction } from '../../types/user.types.js'
import type { PaginationSchema } from '../routes/schemas/pagination_schema.js'
import { getAllUsersOrchestrator } from '../../services/getAllUsersServices.js'
import { successResponse } from '../../utils/JSONGenerators.js'

export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    let { page, limit } = req.validatedData as PaginationSchema
    page = page ?? 1
    limit = limit ?? 10

    const { result, totalUsers, totalPages, pagesLeft } =
      await getAllUsersOrchestrator(page, limit)

    return res.status(200).json(
      successResponse('Users fetched successfully', {
        data: result,
        meta: {
          currentPage: page,
          limit,
          totalUsers,
          totalPages,
          pagesLeft,
        },
      }),
    )
  } catch (err) {
    next(err)
  }
}
