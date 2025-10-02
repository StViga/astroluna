import { serve } from '@hono/node-server'
import { handle } from '@hono/node-server/netlify'
import app from '../../src/index.tsx'

export const handler = handle(app)