import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import app from './app.js'

// Load environment variables if available (optional)
try {
  const dotenv = await import('dotenv')
  dotenv.config()
} catch (e) {
  console.log('dotenv not available, using environment variables directly')
}

// Add static file serving for Node.js
app.use('/static/*', serveStatic({ root: './public' }))

const port = process.env.PORT || 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})