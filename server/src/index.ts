import { Hono } from "hono";
import { logger } from "./middleware/logger.js";
import { authMiddleware } from "./middleware/auth.js";
import { authRoutes } from "./routes/auth.js";
import { serviceRoutes } from "./routes/services.js";
import { adminRoutes } from "./routes/admin.js";
import { logsRoutes } from "./routes/logs.js";
import mongoose from "mongoose";
import { serve } from "@hono/node-server";
import dotenv from "dotenv";
import { cors } from "hono/cors";

dotenv.config();

const app = new Hono();

// Logger for all requests
app.use("*", logger);
app.use(
  cors({
    origin: "*", // Allow all origins for development; restrict in production
  })
);
// Public routes
app.route("/auth", authRoutes);

// Protected routes (JWT required)
app.use("/api/*", authMiddleware);
app.route("/api/services", serviceRoutes);
app.route("/api/admin", adminRoutes);
app.route("/api/logs", logsRoutes);

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/pm2dashboard";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

// Connect to MongoDB
mongoose
  .connect(MONGO_URI, {
    autoIndex: true,
  })
  .then(() => {
    console.log("MongoDB connected");
    serve({
      fetch: app.fetch,
      port: PORT,
    });
    console.log(`Server running on http://localhost:${PORT}`);
  })
  .catch((err) => {
    console.error("Mongo connection error:", err);
    process.exit(1);
  });

export default app;
