import { type MiddlewareHandler } from 'hono'
import { logAction } from '../models/actionLog.js'

export const logger: MiddlewareHandler = async (c, next) => {
  await next()
  // Log only mutating requests
  if (['POST', 'PUT', 'DELETE'].includes(c.req.method)) {
    const user = c.get('user')
    await logAction({
      userId: user?.id || 'anonymous',
      action: c.req.method + ' ' + c.req.path,
      timestamp: new Date(),
      details: {
        body: {},
        query: c.req.query()
      }
    })
  }
}