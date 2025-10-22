import mongoose, { Schema, Document, models } from "mongoose";

export interface ILead extends Document {
  name: string;
  email: string;
  message: string;
  conversation?: {
    role: "user" | "assistant";
    content: string;
  }[];
  createdAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    conversation: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "leads",
  }
);

export const Lead = models.Lead || mongoose.model<ILead>("Lead", LeadSchema);
