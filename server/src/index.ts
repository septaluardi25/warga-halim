import { app } from './app.js'
import { env } from './config/env.js'

if (!process.env.VERCEL) {
  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`)
  })
}

export default app
