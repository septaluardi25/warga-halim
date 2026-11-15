import { Router } from 'express'
import {
  loginHandler,
  meHandler,
  registerHandler,
} from '../controllers/authController.js'
import { auth } from '../middlewares/auth.js'
import { loginRateLimiter, registerRateLimiter } from '../middlewares/rateLimiter.js'

export const authRouter = Router()

authRouter.post('/register', registerRateLimiter, registerHandler)
authRouter.post('/login', loginRateLimiter, loginHandler)
authRouter.get('/me', auth, meHandler)
