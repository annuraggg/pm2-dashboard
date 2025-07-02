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
    console.log("User services:", services);
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

    const s = await getServicesForUser(user);

    if (
      user.role !== "admin" &&
      !s.some((s: any) => s._id.toString() === service._id?.toString())
    ) {
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

    const s = await getServicesForUser(user);

    if (
      user.role !== "admin" &&
      !s.some((s: any) => s._id.toString() === service._id?.toString())
    ) {
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
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const serviceId = c.req.param("id");
    if (!serviceId) {
      return c.json({ error: "Service ID missing" }, 400);
    }

    const service = await getServiceById(serviceId);
    if (!service) {
      return c.json({ error: "Not found" }, 404);
    }

    const assignedUserIds = service.assignedUsers.map((u: any) =>
      typeof u === "object" && u._id ? u._id.toString() : u.toString()
    );

    const s = await getServicesForUser(user);

    if (
      user.role !== "admin" &&
      !s.some((s: any) => s._id.toString() === service._id?.toString())
    ) {
      return c.json({ error: "Forbidden" }, 403);
    }

    if (!service.deploy_script_path) {
      return c.json({ error: "No deploy script path specified." }, 400);
    }

    const scriptPath = service.deploy_script_path;
    const cwd = process.cwd();

    const child = spawn("bash", [scriptPath], { cwd });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        c.json({
          success: true,
          msg: "Deploy script executed successfully",
          output: stdout.trim(),
        });
      } else {
        c.json({
          success: false,
          msg: `Deploy script failed with exit code ${code}`,
          error: stderr.trim(),
        });
      }
    });

    child.on("error", (err) => {
      c.json(
        { error: "Failed to start deploy script", details: err.toString() },
        500
      );
    });

    return c.json({
      success: true,
      msg: "Deploy script is running",
      output: "The deploy script has been triggered.",
    });
  } catch (error) {
    return c.json({ error: "Failed to trigger deploy" }, 500);
  }
};
