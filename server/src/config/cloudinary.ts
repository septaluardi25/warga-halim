import { v2 as cloudinary } from 'cloudinary'
import { env } from './env.js'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
})

/** Check whether all required Cloudinary credentials are set in environment variables. */
export function isCloudinaryConfigured(): boolean {
  return Boolean(
    env.CLOUDINARY_CLOUD_NAME.trim() &&
      env.CLOUDINARY_API_KEY.trim() &&
      env.CLOUDINARY_API_SECRET.trim(),
  )
}

export { cloudinary }
