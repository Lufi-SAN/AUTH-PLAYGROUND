import { Router } from 'express'
import {
  registerRouter,
  verifyEmailRouter,
  resendLinkRouter,
  loginRouter,
  refreshRouter,
  changePasswordRouter,
  logoutRouter,
  authRouter,
  totpRouter,
  changeEmailRouter,
} from '../api/routes/ROUTER_SINK.js'

export function loadRouter() {
  const router = Router()

  router.use('/auth', authRouter())
  router.use('/register', registerRouter())
  router.use('/totp', totpRouter())
  router.use('/verify-email', verifyEmailRouter())
  router.use('/resend-verification', resendLinkRouter())
  router.use('/login', loginRouter())
  router.use('/refresh', refreshRouter())
  router.use('/change-password', changePasswordRouter())
  router.use('/change-email', changeEmailRouter())
  // router.use('/delete-account')
  router.use('/logout', logoutRouter())

  return router
}
