import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB_NAME || "ai_chatbot";

if (!MONGODB_URI) throw new Error(" MONGODB_URI not found in .env");

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME, 
    });
    isConnected = true;
    console.log(` MongoDB connected to database: ${DB_NAME}`);
  } catch (err) {
    console.error(" MongoDB connection error:", err);
    throw err;
  }
}
