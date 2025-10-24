import mongoose from "mongoose";
import { buildMongoURI } from "@/lib/utils/mongodb-utils";

let defaultConnection: mongoose.Connection | null = null;
const tenantConnections: { [key: string]: mongoose.Connection } = {};

export async function connectDB(databaseName?: string) {
  // If no specific database requested, return default connection or null
  if (!databaseName) {
    return defaultConnection;
  }
  
  // If we already have a connection for this database, return it
  if (tenantConnections[databaseName]) {
    return tenantConnections[databaseName];
  }

  try {
    const mongoURI = buildMongoURI(databaseName);
    
    // Create a new connection for this database
    const connection = mongoose.createConnection(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      retryReads: true,
    });
    
    tenantConnections[databaseName] = connection;
    
    // If this is the first connection, also set it as default (for backward compatibility)
    if (!defaultConnection) {
      defaultConnection = connection;
      // Also connect mongoose default for existing models
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
        retryReads: true,
      });
    }
    
    console.log(`MongoDB connection created for database: ${databaseName}`);
    return connection;
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

// Helper function to get a model for a specific tenant database
export async function getTenantModel<T>(
  databaseName: string,
  modelName: string,
  schema: mongoose.Schema
): Promise<mongoose.Model<T>> {
  const connection = await connectDB(databaseName) as mongoose.Connection;
  
  // Check if model already exists on this connection
  if (connection.models[modelName]) {
    return connection.models[modelName];
  }
  
  // Create the model on this connection
  return connection.model<T>(modelName, schema);
}
