import { Hono } from "hono";
import {
  login,
  createUser,
  updateUser,
  listUsers,
  deleteUser,
} from "../controllers/authController.js";
import { authMiddleware, adminOnly } from "../middleware/auth.js";

export const authRoutes = new Hono();

authRoutes.post("/login", login);

// Admin-only user management
authRoutes.use("/users/*", authMiddleware, adminOnly);
authRoutes.post("/users", createUser);
authRoutes.put("/users/:id", updateUser);
authRoutes.get("/users", listUsers);
authRoutes.delete("/users/:id", deleteUser);
