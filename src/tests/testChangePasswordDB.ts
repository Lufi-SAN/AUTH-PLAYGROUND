import { loadPostgres } from '../loaders/loadPostgres.js'
import { updatePasswordHashDB } from '../repositories/changePasswordRepo.js'

async function run() {
  await loadPostgres()
  const userId = 'your_user_id' // Replace with a valid user ID
  const currentPassword = 'current_password' // Replace with the current password
  const newPassword = 'new_password' // Replace with the new password

  const result = await updatePasswordHashDB(userId, currentPassword)
  console.log('Result:', result)
}
