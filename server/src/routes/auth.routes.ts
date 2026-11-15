import { Router } from 'express'
import {
  loginHandler,
  meHandler,
  registerHandler,
} from '../controllers/authController.js'
import { auth } from '../middlewares/auth.js'

export const authRouter = Router()

authRouter.post('/register', registerHandler)
authRouter.post('/login', loginHandler)
authRouter.get('/me', auth, meHandler)
