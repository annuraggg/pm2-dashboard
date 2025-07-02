import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  passwordHash: string;
  role: "admin" | "team";
  assignedServices: Types.ObjectId[]; // services this user can access (team only)
}

const UserSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["admin", "team"], required: true },
  assignedServices: [{ type: Schema.Types.ObjectId, ref: "Service" }],
});

// --- Helper functions for controller use ---

export const getUserByUsername = (username: string) =>
  UserModel.findOne({ username }).exec();

export const getUserById = (id: string) => UserModel.findById(id).exec();

export const createUserInDb = (user: Partial<IUser>) => UserModel.create(user);

export const updateUserInDb = (id: string, update: Partial<IUser>) =>
  UserModel.findByIdAndUpdate(id, update, { new: true }).exec();

export const listUsersInDb = () =>
  UserModel.find().select("-passwordHash").exec();

export const deleteUserInDb = (id: string) =>
  UserModel.findByIdAndDelete(id).exec();

export const UserModel = mongoose.model<IUser>("User", UserSchema);
