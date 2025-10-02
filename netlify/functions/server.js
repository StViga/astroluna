// Netlify serverless function for AstroLuna (CommonJS)
const { default: app } = require('../../dist/_worker.js')

export const handler = async (event, context) => {
  // Build URL with query parameters
  const url = `https://${event.headers.host || 'localhost'}${event.path}`
  const searchParams = new URLSearchParams()
  
  if (event.queryStringParameters) {
    Object.entries(event.queryStringParameters).forEach(([key, value]) => {
      if (value !== null) searchParams.set(key, value)
    })
  }
  
  const fullUrl = searchParams.toString() ? `${url}?${searchParams}` : url

  // Create request options - only include body for non-GET/HEAD methods
  const requestOptions = {
    method: event.httpMethod,
    headers: event.headers
  }

  // Only add body for methods that can have one
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' && event.body) {
    if (event.isBase64Encoded) {
      requestOptions.body = Buffer.from(event.body, 'base64')
    } else {
      requestOptions.body = event.body
    }
  }

  try {
    const request = new Request(fullUrl, requestOptions)
    const response = await app.fetch(request)
    const body = await response.text()
    
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: body,
      isBase64Encoded: false
    }
  } catch (error) {
    console.error('Netlify function error:', error)
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      })
    }
  }
}