import { Router } from 'express'
import { getAlbumsHandler, getHomeHandler } from '../controllers/mediaController.js'

export const publicRouter = Router()

publicRouter.get('/home', getHomeHandler)
publicRouter.get('/albums', getAlbumsHandler)
