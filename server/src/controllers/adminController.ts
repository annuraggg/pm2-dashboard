import { type Context } from "hono";
import {
  getAllServices,
  addServiceToDb,
  updateServiceInDb,
  deleteServiceFromDb,
  getServiceById,
} from "../models/service.js";

// GET /api/admin/services
export const listAllServices = async (c: Context) => {
  try {
    const services = await getAllServices();
    return c.json({ services }, 200);
  } catch (error) {
    console.error("Error fetching services:", error);
    return c.json({ error: "Failed to fetch services" }, 500);
  }
};

// POST /api/admin/services
export const addService = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { name, desc, pm2_id, deploy_script_path, assignedUsers } = body;

    if (
      typeof name !== "string" ||
      name.trim() === "" ||
      pm2_id === undefined ||
      pm2_id === null
    ) {
      return c.json(
        { error: "Missing or invalid required fields: name, pm2_id" },
        400
      );
    }

    const service = await addServiceToDb({
      name: name.trim(),
      desc,
      pm2_id,
      deploy_script_path,
      assignedUsers,
    });

    return c.json({ service }, 201);
  } catch (error) {
    console.error("Error adding service:", error);
    return c.json({ error: "Failed to add service" }, 500);
  }
};

// PUT /api/admin/services/:id
export const editService = async (c: Context) => {
  try {
    const serviceId = c.req.param("id");
    if (!serviceId) {
      return c.json({ error: "Missing service id" }, 400);
    }
    const updateFields = await c.req.json();

    const updated = await updateServiceInDb(serviceId, updateFields);
    if (!updated) {
      return c.json({ error: "Service not found or update failed" }, 404);
    }
    return c.json({ service: updated }, 200);
  } catch (error) {
    console.error("Error updating service:", error);
    return c.json({ error: "Failed to update service" }, 500);
  }
};

// DELETE /api/admin/services/:id
export const deleteService = async (c: Context) => {
  try {
    const serviceId = c.req.param("id");
    if (!serviceId) {
      return c.json({ error: "Missing service id" }, 400);
    }
    const deleted = await deleteServiceFromDb(serviceId);
    if (!deleted) {
      return c.json({ error: "Service not found or delete failed" }, 404);
    }
    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Error deleting service:", error);
    return c.json({ error: "Failed to delete service" }, 500);
  }
};
