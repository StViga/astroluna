import fs from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load the compiled worker
const workerPath = join(__dirname, '../../dist/_worker.js')
const workerCode = fs.readFileSync(workerPath, 'utf8')

// Create a module from the worker code
const module = { exports: {} }
const require = (name) => {
  if (name === 'buffer') return { Buffer }
  if (name === 'stream') return {}
  if (name === 'util') return {}
  if (name === 'crypto') return {}
  return {}
}

// Evaluate the worker code
eval(workerCode + '\nmodule.exports = { default: exports.default || exports }')
const app = module.exports.default

export const handler = async (event, context) => {
  console.log('Netlify function called:', event.path)
  
  try {
    const url = `https://${event.headers.host || 'localhost'}${event.path || '/'}${event.rawQuery ? '?' + event.rawQuery : ''}`
    
    const request = new Request(url, {
      method: event.httpMethod || 'GET',
      headers: event.headers || {},
      body: event.body || null
    })

    console.log('Making request to app:', url)
    const response = await app.fetch(request)
    const responseText = await response.text()
    
    console.log('Got response:', response.status)
    
    return {
      statusCode: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseText
    }
  } catch (error) {
    console.error('Netlify function error:', error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Server Error', message: error.message })
    }
  }
}