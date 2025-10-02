import app from '../../app.js'

export const handler = async (event, context) => {
  const request = new Request(
    `https://${event.headers.host || 'localhost'}${event.path}${event.multiValueQueryStringParameters ? '?' + new URLSearchParams(event.multiValueQueryStringParameters).toString() : ''}`,
    {
      method: event.httpMethod,
      headers: event.headers,
      body: event.body
    }
  )

  try {
    const response = await app.fetch(request)
    const body = await response.text()
    
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: body
    }
  } catch (error) {
    console.error('Function error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    }
  }
}