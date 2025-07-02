import { type Context } from "hono";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUserInDb,
  getUserByUsername,
  getUserById,
  updateUserInDb,
  listUsersInDb,
  deleteUserInDb,
} from "../models/user.js";

// POST /auth/login
export const login = async (c: Context) => {
  try {
    const { username, password } = await c.req.json();
    if (typeof username !== "string" || typeof password !== "string") {
      return c.json({ error: "Missing or invalid credentials" }, 400);
    }
    const user = await getUserByUsername(username);
    if (!user) return c.json({ error: "Invalid username or password" }, 401);
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return c.json({ error: "Invalid username or password" }, 401);
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set");
      return c.json({ error: "Server misconfiguration" }, 500);
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    return c.json({
      token,
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error("Error in login:", err);
    return c.json({ error: "Login failed" }, 500);
  }
};

// POST /auth/users (admin only)
export const createUser = async (c: Context) => {
  try {
    const { username, password, role, assignedServices } = await c.req.json();
    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string"
    ) {
      return c.json({ error: "Missing or invalid fields" }, 400);
    }
    if (!["admin", "team"].includes(role)) {
      return c.json({ error: "Invalid role" }, 400);
    }
    const existing = await getUserByUsername(username);
    if (existing) return c.json({ error: "User already exists" }, 409);
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUserInDb({
      username,
      passwordHash,
      role: role as "admin" | "team",
      assignedServices: Array.isArray(assignedServices) ? assignedServices : [],
    });
    return c.json({ user }, 201);
  } catch (err) {
    console.error("Error creating user:", err);
    return c.json({ error: "Could not create user" }, 500);
  }
};

// PUT /auth/users/:id (admin only)
export const updateUser = async (c: Context) => {
  try {
    const userId = c.req.param("id");
    if (!userId) return c.json({ error: "User id required" }, 400);
    const { password, role, assignedServices } = await c.req.json();

    const update: any = {};
    if (password) {
      if (typeof password !== "string" || password.length < 4)
        return c.json({ error: "Password too short" }, 400);
      update.passwordHash = await bcrypt.hash(password, 12);
    }
    if (role) {
      if (!["admin", "team"].includes(role))
        return c.json({ error: "Invalid role" }, 400);
      update.role = role;
    }
    if (assignedServices) {
      if (!Array.isArray(assignedServices))
        return c.json({ error: "assignedServices must be an array" }, 400);
      update.assignedServices = assignedServices;
    }

    const result = await updateUserInDb(userId, update);
    if (!result) return c.json({ error: "User not found" }, 404);
    return c.json({ user: result }, 200);
  } catch (err) {
    console.error("Error updating user:", err);
    return c.json({ error: "Update failed" }, 500);
  }
};

// GET /auth/users (admin only)
export const listUsers = async (c: Context) => {
  try {
    const users = await listUsersInDb();
    return c.json({ users }, 200);
  } catch (err) {
    console.error("Error listing users:", err);
    return c.json({ error: "Could not fetch users" }, 500);
  }
};

// DELETE /auth/users/:id (admin only)
export const deleteUser = async (c: Context) => {
  try {
    const userId = c.req.param("id");
    if (!userId) return c.json({ error: "User id required" }, 400);
    const deleted = await deleteUserInDb(userId);
    if (!deleted) return c.json({ error: "User not found" }, 404);
    return c.json({ success: true }, 200);
  } catch (err) {
    console.error("Error deleting user:", err);
    return c.json({ error: "Delete failed" }, 500);
  }
};
