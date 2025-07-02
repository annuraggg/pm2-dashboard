import { type Context } from "hono";
import { getServicesForUser, getServiceById } from "../models/service.js";
import { restartPM2Process, getPM2Logs } from "../services/pm2/pm2service.js";

// GET /api/services/
export const listServices = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);
    const services = await getServicesForUser(user);
    return c.json({ services }, 200);
  } catch (error) {
    console.error("Error listing user services:", error);
    return c.json({ error: "Failed to fetch services" }, 500);
  }
};

// POST /api/services/:id/restart
export const restartService = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const serviceId = c.req.param("id");
    if (!serviceId) return c.json({ error: "Service ID missing" }, 400);

    const service = await getServiceById(serviceId);
    if (!service) return c.json({ error: "Not found" }, 404);

    if (user.role !== "admin" && !service.assignedUsers.includes(user.id)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await restartPM2Process(service.pm2_id);
    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Error restarting service:", error);
    return c.json({ error: "Failed to restart service" }, 500);
  }
};

// GET /api/services/:id/logs
export const getLogs = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const serviceId = c.req.param("id");
    if (!serviceId) return c.json({ error: "Service ID missing" }, 400);

    const service = await getServiceById(serviceId);
    if (!service) return c.json({ error: "Not found" }, 404);

    if (user.role !== "admin" && !service.assignedUsers.includes(user.id)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const logs = await getPM2Logs(service.pm2_id);
    return c.text(logs, 200);
  } catch (error) {
    console.error("Error fetching PM2 logs:", error);
    return c.json({ error: "Failed to fetch logs" }, 500);
  }
};

// POST /api/services/:id/deploy
export const forceDeploy = async (c: Context) => {
  try {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const serviceId = c.req.param("id");
    if (!serviceId) return c.json({ error: "Service ID missing" }, 400);

    const service = await getServiceById(serviceId);
    if (!service) return c.json({ error: "Not found" }, 404);

    if (user.role !== "admin" && !service.assignedUsers.includes(user.id)) {
      return c.json({ error: "Forbidden" }, 403);
    }

    return c.json(
      { success: true, msg: "Deploy script executed (placeholder)" },
      200
    );
  } catch (error) {
    console.error("Error executing deploy script:", error);
    return c.json({ error: "Failed to trigger deploy" }, 500);
  }
};
