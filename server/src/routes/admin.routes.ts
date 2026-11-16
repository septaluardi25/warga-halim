import { Router } from 'express'
import {
  addAlbumPhotosHandler,
  createAlbumHandler,
  deleteAlbumHandler,
  deleteVideoHandler,
  saveVideoHandler,
  updateAlbumHandler,
} from '../controllers/mediaController.js'
import {
  deleteUserHandler,
  listUsersHandler,
  updateUserHandler,
} from '../controllers/userAdminController.js'
import {
  createWargaHandler,
  deleteWargaHandler,
  updateWargaHandler,
} from '../controllers/wargaController.js'
import { auth } from '../middlewares/auth.js'
import { requireAdmin } from '../middlewares/role.js'
import { uploadAlbumPhotos, uploadWargaPhotos } from '../middlewares/upload.js'

export const adminRouter = Router()

adminRouter.use(auth, requireAdmin)

adminRouter.post('/warga', uploadWargaPhotos, createWargaHandler)
adminRouter.put('/warga/:id', uploadWargaPhotos, updateWargaHandler)
adminRouter.delete('/warga/:id', deleteWargaHandler)

adminRouter.get('/users', listUsersHandler)
adminRouter.put('/users/:id', updateUserHandler)
adminRouter.delete('/users/:id', deleteUserHandler)

adminRouter.post('/albums', uploadAlbumPhotos, createAlbumHandler)
adminRouter.put('/albums/:id', uploadAlbumPhotos, updateAlbumHandler)
adminRouter.post('/albums/:id/photos', uploadAlbumPhotos, addAlbumPhotosHandler)
adminRouter.delete('/albums/:id', deleteAlbumHandler)

adminRouter.post('/videos', saveVideoHandler)
adminRouter.delete('/videos/:id', deleteVideoHandler)
