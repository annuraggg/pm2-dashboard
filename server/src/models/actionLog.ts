import mongoose, { Schema, Document, Types } from "mongoose";
import { UserModel } from "./user.js";

export interface IActionLog extends Document {
  userId: Types.ObjectId | string;
  action: string;
  timestamp: Date;
  details?: any;
}

const ActionLogSchema: Schema<IActionLog> = new Schema({
  userId: { type: Schema.Types.Mixed, required: true, ref: "User" },
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: Schema.Types.Mixed },
});

// --- Helper functions ---
export const logAction = (log: Partial<IActionLog>) =>
  ActionLogModel.create(log);

export const getActionLogsFromDb = async ({ limit = 50, page = 1 }) => {
  const data = await ActionLogModel.find()
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  for (const log of data) {
    if (Types.ObjectId.isValid(log.userId)) {
      const user = await UserModel.findById(log.userId)
        .select("username")
        .lean(); //@ts-expect-error
      log.userId = user || "Unknown";
    } else {
      log.userId = log.userId;
    }
  }

  return data;
};

export const ActionLogModel = mongoose.model<IActionLog>(
  "ActionLog",
  ActionLogSchema
);
