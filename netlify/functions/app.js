const { Hono } = require('hono')

const app = new Hono()

// Simple fallback for Netlify
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AstroLuna - AI-Powered Astrology</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 min-h-screen">
        <div class="container mx-auto px-4 py-16">
            <div class="text-center mb-12">
                <h1 class="text-5xl font-bold text-white mb-4">🌙 AstroLuna</h1>
                <p class="text-xl text-purple-200 mb-8">AI-Powered Astrology & Tarot Platform</p>
                <p class="text-red-400 bg-red-900 p-4 rounded-lg inline-block">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    Netlify deployment in progress. Please try Vercel version: 
                    <a href="https://astroluna.vercel.app" class="text-blue-300 underline">astroluna.vercel.app</a>
                </p>
            </div>
        </div>
    </body>
    </html>
  `)
})

exports.handler = async (event, context) => {
  const request = new Request(
    \`https://\${event.headers.host}\${event.path || '/'}\`,
    {
      method: event.httpMethod,
      headers: event.headers,
      body: event.body
    }
  )

  const response = await app.fetch(request)
  const body = await response.text()

  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: body
  }
}