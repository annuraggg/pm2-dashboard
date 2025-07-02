import { type MiddlewareHandler } from "hono";
import jwt from "jsonwebtoken";
import { getUserById } from "../models/user.js";

// Attach req.user and check roles
export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const token = c.req.header("authorization")?.replace("Bearer ", "");
  if (!token) return c.json({ error: "No token" }, 401);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
};

export const adminOnly: MiddlewareHandler = async (c, next) => {
  const user = c.get("user");
  if (user.role !== "admin") return c.json({ error: "Admin only" }, 403);
  await next();
};

export const teamOnly: MiddlewareHandler = async (c, next) => {
  // Allow if admin or team user
  const user = c.get("user");
  if (user.role === "admin" || user.role === "team") return await next();
  return c.json({ error: "Forbidden" }, 403);
};
