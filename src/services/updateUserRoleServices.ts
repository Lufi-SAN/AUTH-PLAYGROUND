import { updateUserRoleDB } from '../repositories/updateUserRoleRepo.js'
import { UserNotFoundError } from '../errors/AppErrors.js'

async function updateUserRole(
  newRole: string,
  userId: string,
  oldRole: string,
) {
  return await updateUserRoleDB(newRole, userId, oldRole)
}

export async function updateUserRoleOrchestrator(
  newRole: string,
  userId: string,
  oldRole: string,
) {
  const result = await updateUserRole(newRole, userId, oldRole)
  if (!result) {
    throw new UserNotFoundError('User not found or role mismatch')
  }
  return result as { userId: string; role: string }
}
