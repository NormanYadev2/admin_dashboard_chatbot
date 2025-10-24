import mongoose from "mongoose";
import { buildMongoURI, getCredentialsDatabase } from "@/lib/utils/mongodb-utils";

const CREDENTIALS_DB_NAME = getCredentialsDatabase();

let isCredentialsConnected = false;
let credentialsConnection: mongoose.Connection | null = null;

export async function connectCredentialsDB() {
  if (isCredentialsConnected && credentialsConnection) {
    return credentialsConnection;
  }

  try {
    const credentialsURI = buildMongoURI(CREDENTIALS_DB_NAME);
    
    // Create a separate connection for credentials database
    credentialsConnection = mongoose.createConnection(credentialsURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      retryReads: true,
    });

    isCredentialsConnected = true;
    console.log(`MongoDB Credentials DB connected to: ${CREDENTIALS_DB_NAME}`);
    
    return credentialsConnection;
  } catch (err) {
    console.error("MongoDB Credentials DB connection error:", err);
    throw err;
  }
}

// Function to get the admin credentials model with the correct connection
export async function getAdminCredentialsModel() {
  const connection = await connectCredentialsDB();
  
  // Check if model already exists on this connection
  if (connection.models.AdminCredentials) {
    return connection.models.AdminCredentials;
  }

  // Create the schema for this connection - matching the existing structure
  const AdminCredentialsSchema = new mongoose.Schema({
    name: {
      type: String,
      trim: true,
    },
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
  }, {
    collection: 'credentials' // Use the existing collection name
  });

  return connection.model("AdminCredentials", AdminCredentialsSchema);
}