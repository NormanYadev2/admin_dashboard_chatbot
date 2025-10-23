import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB_NAME || "ai_chatbot";

if (!MONGODB_URI) throw new Error("MONGODB_URI not found in .env");

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;

  try {
    // Add timeout and retry options
    await mongoose.connect(MONGODB_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      retryReads: true,
    });
    isConnected = true;
    console.log(`MongoDB connected to database: ${DB_NAME}`);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    
    // More specific error handling
    if (err instanceof Error) {
      if (err.message.includes('EAI_AGAIN')) {
        console.error("DNS resolution failed. Check your internet connection and MongoDB Atlas network access settings.");
      } else if (err.message.includes('authentication failed')) {
        console.error("Authentication failed. Check your MongoDB credentials.");
      } else if (err.message.includes('serverSelectionTimeoutMS')) {
        console.error("Server selection timeout. Check if your IP is whitelisted in MongoDB Atlas.");
      }
    }
    
    throw err;
  }
}
