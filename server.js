import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import dotenv from 'dotenv'
import app from './app.js'

// Load environment variables
dotenv.config()

// Add static file serving for Node.js
app.use('/static/*', serveStatic({ root: './public' }))

const port = process.env.PORT || 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})