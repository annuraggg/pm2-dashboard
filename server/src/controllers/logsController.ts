import { type Context } from "hono";
import { getActionLogsFromDb } from "../models/actionLog.js";

// GET /api/logs/
export const getActionLogs = async (c: Context) => {
  try {
    let limit = parseInt(c.req.query("limit") || "50", 10);
    let page = parseInt(c.req.query("page") || "1", 10);

    // Input validation
    if (isNaN(limit) || limit < 1 || limit > 200) limit = 50;
    if (isNaN(page) || page < 1) page = 1;

    const logs = await getActionLogsFromDb({ limit, page });

    return c.json({ logs, pagination: { limit, page } }, 200);
  } catch (error) {
    console.error("Error fetching action logs:", error);
    return c.json({ error: "Failed to fetch action logs" }, 500);
  }
};
