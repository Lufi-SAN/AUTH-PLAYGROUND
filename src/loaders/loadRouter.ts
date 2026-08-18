import { Router } from 'express'
import {
  verificationMethodRoute,
  registerRoute,
  verifyEmailRoute,
  resendLinkRoute,
} from '../api/routes/ROUTE_SINK.js'

export function loadRouter() {
  const router = Router()

  router.use('/verification-method', verificationMethodRoute())
  router.use('/register', registerRoute())
  router.use('/verify-email', verifyEmailRoute())
  router.use('/resend-verification', resendLinkRoute())
  // router.use('/login')
  // router.use('/change-password')
  // router.use('/change-email')
  // router.use('/delete-account')
  // router.use('/logout')

  return router
}
