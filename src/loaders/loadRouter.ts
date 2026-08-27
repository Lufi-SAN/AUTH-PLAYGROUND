import { Router } from 'express'
import {
  verificationMethodRouter,
  registerRouter,
  verifyEmailRouter,
  resendLinkRouter,
  loginRouter,
} from '../api/routes/ROUTER_SINK.js'

export function loadRouter() {
  const router = Router()

  router.use('/verification-method', verificationMethodRouter())
  router.use('/register', registerRouter())
  router.use('/verify-email', verifyEmailRouter())
  router.use('/resend-verification', resendLinkRouter())
  router.use('/login', loginRouter)
  // router.use('/change-password')
  // router.use('/change-email')
  // router.use('/delete-account')
  // router.use('/logout')

  return router
}
