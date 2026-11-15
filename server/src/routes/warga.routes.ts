import { Router } from 'express'
import {
  getWargaDetailHandler,
  listWargaHandler,
} from '../controllers/wargaController.js'
import { auth } from '../middlewares/auth.js'

export const wargaRouter = Router()

wargaRouter.use(auth)
wargaRouter.get('/', listWargaHandler)
wargaRouter.get('/:id', getWargaDetailHandler)
