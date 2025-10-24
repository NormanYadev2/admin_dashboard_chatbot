import mongoose from "mongoose";

const AdminCredentialsSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  tenantId: {
    type: String,
    required: true,
    trim: true,
  },
  databaseName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    default: "admin",
    enum: ["admin", "superadmin"],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
});

// Prevent re-compilation in development
export const AdminCredentials = 
  mongoose.models.AdminCredentials || 
  mongoose.model("AdminCredentials", AdminCredentialsSchema);