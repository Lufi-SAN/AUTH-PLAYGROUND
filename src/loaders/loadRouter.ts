import { Router } from 'express'

export function loadRouter() {
  const router = Router()

  router.use('/register')
  router.use('/login')
  router.use('/profile')
  router.use('/refresh')
  router.use('/change-password')
  router.use('/change-email')
  router.use('/delete-account')
  router.use('/logout')

  return router
}
