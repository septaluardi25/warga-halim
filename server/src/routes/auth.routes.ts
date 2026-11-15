import { Router } from 'express'
import {
  loginHandler,
  meHandler,
  registerHandler,
} from '../controllers/authController.js'
import { auth } from '../middlewares/auth.js'
import { loginRateLimiter } from '../middlewares/rateLimiter.js'

export const authRouter = Router()

authRouter.post('/register', registerHandler)
authRouter.post('/login', loginRateLimiter, loginHandler)
authRouter.get('/me', auth, meHandler)
