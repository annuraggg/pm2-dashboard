import { type Context } from "hono";
import { getServicesForUser, getServiceById } from "../models/service.js";
import { restartPM2Process, getPM2Logs } from "../services/pm2/pm2service.js";
import { spawn } from "child_process";

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
    console.log("[forceDeploy] Called forceDeploy controller");
    const user = c.get("user");
    console.log("[forceDeploy] User from context:", user);
    if (!user) {
      console.log("[forceDeploy] No user, unauthorized");
      return c.json({ error: "Unauthorized" }, 401);
    }

    const serviceId = c.req.param("id");
    console.log("[forceDeploy] Service ID param:", serviceId);
    if (!serviceId) {
      console.log("[forceDeploy] No service ID provided");
      return c.json({ error: "Service ID missing" }, 400);
    }

    const service = await getServiceById(serviceId);
    console.log("[forceDeploy] Service fetched from DB:", service);
    if (!service) {
      console.log("[forceDeploy] Service not found in DB");
      return c.json({ error: "Not found" }, 404);
    }

    const assignedUserIds = service.assignedUsers.map((u: any) =>
      typeof u === "object" && u._id ? u._id.toString() : u.toString()
    );
    console.log("[forceDeploy] Assigned user IDs:", assignedUserIds);

    if (user.role !== "admin" && !assignedUserIds.includes(user.id)) {
      console.log("[forceDeploy] User forbidden to deploy this service");
      return c.json({ error: "Forbidden" }, 403);
    }

    if (!service.deploy_script_path) {
      console.log("[forceDeploy] No deploy_script_path found on service");
      return c.json({ error: "No deploy script path specified." }, 400);
    }

    const scriptPath = service.deploy_script_path;
    const cwd = process.cwd();
    console.log("[forceDeploy] Running script:", scriptPath, "cwd:", cwd);

    const child = spawn("sh", [scriptPath], { cwd });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      console.log("[forceDeploy] Script stdout chunk:", data.toString());
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      console.error("[forceDeploy] Script stderr chunk:", data.toString());
      stderr += data.toString();
    });

    child.on("close", (code) => {
      console.log("[forceDeploy] Script closed with code:", code);
      if (code === 0) {
        console.log(
          "[forceDeploy] Deploy script succeeded, output:",
          stdout.trim()
        );
        c.json({
          success: true,
          msg: "Deploy script executed successfully",
          output: stdout.trim(),
        });
      } else {
        console.error(
          "[forceDeploy] Deploy script failed, stderr:",
          stderr.trim()
        );
        c.json({
          success: false,
          msg: `Deploy script failed with exit code ${code}`,
          error: stderr.trim(),
        });
      }
    });

    child.on("error", (err) => {
      console.error("[forceDeploy] Failed to start deploy script:", err);
      c.json(
        { error: "Failed to start deploy script", details: err.toString() },
        500
      );
    });

    // Keep the function alive until the script finishes
    return new Promise(() => {});
  } catch (error) {
    console.error("[forceDeploy] Error executing deploy script:", error);
    return c.json({ error: "Failed to trigger deploy" }, 500);
  }
};
