import { Router } from 'express'
import { registerRoute, verifyEmailRoute } from '../api/routes/ROUTE_SINK.js'

export function loadRouter() {
  const router = Router()

  router.use('/register', registerRoute())
  router.use('/verify-email', verifyEmailRoute())
  // router.use('/login')
  // router.use('/profile')
  // router.use('/refresh')
  // router.use('/change-password')
  // router.use('/change-email')
  // router.use('/delete-account')
  // router.use('/logout')

  return router
}
