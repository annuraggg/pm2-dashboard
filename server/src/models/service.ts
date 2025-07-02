import mongoose, { Schema, Document, Types } from "mongoose";
import { UserModel } from "./user.js";

export interface IService extends Document {
  name: string;
  desc?: string;
  pm2_id: number;
  deploy_script_path?: string;
  assignedUsers: Types.ObjectId[]; // team users with access
}

const ServiceSchema: Schema<IService> = new Schema({
  name: { type: String, required: true },
  desc: { type: String },
  pm2_id: { type: Number, required: true, index: true },
  deploy_script_path: { type: String },
  assignedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

// --- Helper functions for controller use ---

export const getServiceById = (id: string) =>
  ServiceModel.findById(id).populate("assignedUsers", "username").exec();

export const getServiceByPM2Id = (pm2_id: number) =>
  ServiceModel.findOne({ pm2_id }).exec();

export const getAllServices = () =>
  ServiceModel.find().populate("assignedUsers", "username").exec();

export const addServiceToDb = (service: Partial<IService>) =>
  ServiceModel.create(service);

export const updateServiceInDb = (id: string, update: Partial<IService>) =>
  ServiceModel.findByIdAndUpdate(id, update, { new: true }).exec();

export const deleteServiceFromDb = (id: string) =>
  ServiceModel.findByIdAndDelete(id).exec();

// For teams: get only assigned services, for admin: get all
export const getServicesForUser = async (user: {
  id: string;
  role: string;
}) => {
  const u = await UserModel.findById(user.id);
  return user.role === "admin"
    ? getAllServices()
    : ServiceModel.find({
        _id: { $in: u?.assignedServices || [] },
      }).exec();
};

export const ServiceModel = mongoose.model<IService>("Service", ServiceSchema);
