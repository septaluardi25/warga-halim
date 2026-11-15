import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js'
import { adminRouter } from './routes/admin.routes.js'
import { authRouter } from './routes/auth.routes.js'
import { publicRouter } from './routes/public.routes.js'
import { wargaRouter } from './routes/warga.routes.js'

export const app = express()

const allowedOrigins = new Set([env.CLIENT_URL, 'https://wargahalim.vercel.app'])

app.use(
  cors({
    origin: (requestOrigin, callback) => {
      callback(null, !requestOrigin || allowedOrigins.has(requestOrigin))
    },
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (_req, res) => {
  res.status(200).json({ message: 'Warga Halim API is running' })
})

app.use('/api', publicRouter)
app.use('/api/auth', authRouter)
app.use('/api/warga', wargaRouter)
app.use('/api/admin', adminRouter)

app.use(notFoundHandler)
app.use(errorHandler)
