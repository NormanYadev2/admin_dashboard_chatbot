import mongoose, { Schema, Model, models } from "mongoose";

// Define the *plain object* interface (no Document inheritance here)
export interface IApiUsage {
  model: string;
  openaiTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens: number;
  userType?: string;
  userMessage?: string;
  timestamp?: Date;
}

// Define the schema normally
const ApiUsageSchema = new Schema<IApiUsage>(
  {
    model: { type: String, required: true },
    openaiTokens: { type: Number, default: 0 },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, required: true },
    userType: { type: String, default: "client" },
    userMessage: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: "timestamp", updatedAt: false },
    collection: "apiusage",
  }
);

// Define the Mongoose model type explicitly
export const ApiUsage: Model<IApiUsage> =
  models.ApiUsage || mongoose.model<IApiUsage>("ApiUsage", ApiUsageSchema);
