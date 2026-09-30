import { getUsersDB } from '../repositories/getAllUsersRepo.js'

async function getUsers(start: number, end: number) {
  return await getUsersDB(start, end)
}

export async function getAllUsersOrchestrator(page: number, limit: number) {
  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const result = await getUsers(startIndex, endIndex)
  return result
}
