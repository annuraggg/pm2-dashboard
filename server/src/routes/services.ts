import { Hono } from 'hono'
import { listServices, restartService, getLogs, forceDeploy } from '../controllers/serviceController.js'
import { teamOnly, adminOnly } from '../middleware/auth.js'

export const serviceRoutes = new Hono()

// List services assigned to user or all if admin
serviceRoutes.get('/', listServices)

// Restart service - team can only restart their own
serviceRoutes.post('/:id/restart', teamOnly, restartService)

// View logs - team can only for their own
serviceRoutes.get('/:id/logs', teamOnly, getLogs)

// Force deploy (run script) - team can only for their own
serviceRoutes.post('/:id/deploy', teamOnly, forceDeploy)