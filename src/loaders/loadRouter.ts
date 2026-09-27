import { Router } from 'express'
import {
  verificationMethodRouter,
  registerRouter,
  verifyEmailRouter,
  resendLinkRouter,
  loginRouter,
  refreshRouter,
  changePasswordRouter,
  logoutRouter,
  authRouter,
} from '../api/routes/ROUTER_SINK.js'

export function loadRouter() {
  const router = Router()

  router.use('/auth', authRouter())
  router.use('/register', registerRouter())
  router.use('/verify-email', verifyEmailRouter())
  router.use('/resend-verification', resendLinkRouter())
  router.use('/login', loginRouter())
  router.use('/refresh', refreshRouter())
  router.use('/change-password', changePasswordRouter())
  // router.use('/change-email')
  // router.use('/delete-account')
  router.use('/logout', logoutRouter())

  return router
}
