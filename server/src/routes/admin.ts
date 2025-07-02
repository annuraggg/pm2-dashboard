import { Hono } from "hono";
import {
  listAllServices,
  editService,
  addService,
  deleteService,
} from "../controllers/adminController.js";
import { adminOnly } from "../middleware/auth.js";

export const adminRoutes = new Hono();

// Admin-only: manage services
adminRoutes.get("/services", adminOnly, listAllServices);
adminRoutes.post("/services", adminOnly, addService);
adminRoutes.put("/services/:id", adminOnly, editService);
adminRoutes.delete("/services/:id", adminOnly, deleteService);
