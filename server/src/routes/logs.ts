import { Hono } from 'hono'
import { getActionLogs } from '../controllers/logsController.js'
import { adminOnly } from '../middleware/auth.js'

// Admin can view all logs
export const logsRoutes = new Hono()
logsRoutes.get('/', adminOnly, getActionLogs)