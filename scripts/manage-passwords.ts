/**
 * Comprehensive Password Management Script
 * 
 * This script automatically handles:
 * - Migrating plain text passwords to hashed passwords
 * - Re-hashing existing passwords when AUTH_KEY changes
 * - Using plain text passwords from .env file as fallback
 * 
 * Usage: tsx scripts/manage-passwords.ts
 */

// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { hashPassword, isPasswordHashed } from "../src/lib/utils/password";

// Admin credentials from .env file
const knownCredentials = {
  'admin1': process.env.admin1_password,
  'vikasitha_admin': process.env.vikasitha_admin_password,
  'sas_admin': process.env.sas_admin_password,
};

async function managePasswords() {
  try {
    console.log("Starting comprehensive password management...");
    console.log(`Current AUTH_KEY: ${process.env.AUTH_KEY?.substring(0, 10)}...`);
    
    // Construct MongoDB URI for admin_credentials database
    const baseUri = process.env.MONGODB_BASE_URI;
    const options = process.env.MONGODB_OPTIONS;
    
    if (!baseUri) {
      throw new Error("MONGODB_BASE_URI environment variable is required");
    }
    
    const mongoUri = `${baseUri}/admin_credentials${options || ''}`;
    console.log("Connecting to admin_credentials database...");
    
    // Connect to MongoDB using Mongoose
    await mongoose.connect(mongoUri);
    
    // Define a simple schema for the credentials collection
    const credentialsSchema = new mongoose.Schema({
      username: String,
      password: String,
      role: String,
      tenantId: String,
      name: String,
      isActive: Boolean,
      createdAt: Date,
      lastLogin: Date,
    }, { collection: 'credentials' });
    
    const Credentials = mongoose.model('Credentials', credentialsSchema);
    
    // Find all admin records
    const admins = await Credentials.find({});
    console.log(`Found ${admins.length} admin records`);
    
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const admin of admins) {
      const username = admin.username;
      console.log(`\nProcessing ${username}...`);
      
      // Ensure admin.password exists
      if (!admin.password) {
        console.log(`   No password field found for ${username}`);
        skippedCount++;
        continue;
      }
      
      let plainPassword: string | undefined;
      
      // Step 1: Determine the plain text password
      if (knownCredentials[username as keyof typeof knownCredentials]) {
        // Use known password from .env
        plainPassword = knownCredentials[username as keyof typeof knownCredentials];
        console.log(`   Using password from .env file`);
      } else if (!isPasswordHashed(admin.password)) {
        // Password is still plain text in database
        plainPassword = admin.password;
        console.log(`   Using plain text password from database`);
      } else {
        // Password is already hashed, but we don't know the plain text
        console.log(`   Password is hashed and no plain text found in .env`);
        console.log(`   Add ${username}_password=your_password to .env file`);
        skippedCount++;
        continue;
      }
      
      // Ensure we have a plain password to work with
      if (!plainPassword) {
        console.log(`   No plain password available for ${username}`);
        skippedCount++;
        continue;
      }
      
      // Step 2: Test if current hash works with current AUTH_KEY
      if (isPasswordHashed(admin.password)) {
        try {
          const { verifyPassword } = await import("../src/lib/utils/password");
          const isValid = await verifyPassword(plainPassword, admin.password);
          
          if (isValid) {
            console.log(`   Current hash is valid - no changes needed`);
            skippedCount++;
            continue;
          } else {
            console.log(`   Current hash invalid with current AUTH_KEY - re-hashing...`);
          }
        } catch (error) {
          console.log(`   Error verifying current hash - re-hashing...`);
        }
      }
      
      // Step 3: Hash the password with current AUTH_KEY
      try {
        console.log(`   Hashing password with current AUTH_KEY...`);
        const hashedPassword = await hashPassword(plainPassword);
        
        // Update the admin record
        admin.password = hashedPassword;
        await admin.save();
        
        processedCount++;
        console.log(`   Successfully updated ${username}`);
        
      } catch (error) {
        console.error(`   Failed to hash password for ${username}:`, error);
        errorCount++;
      }
    }
    
    console.log("\nPassword management completed!");
    console.log(`Processed: ${processedCount} passwords`);
    console.log(`Skipped: ${skippedCount} passwords (already valid)`);
    if (errorCount > 0) {
      console.log(`Errors: ${errorCount} passwords`);
    }
    
    console.log("\nSummary:");
    console.log("- All passwords are now hashed with the current AUTH_KEY");
    console.log("- Admin users can log in with their credentials");
    console.log("- If any admins still can't log in, add their plain password to .env file");
    
  } catch (error) {
    console.error("Password management failed:", error);
    process.exit(1);
  } finally {
    // Clean up connection
    await mongoose.disconnect();
    console.log("Database connection closed");
  }
}

// Run password management
managePasswords()
  .then(() => {
    console.log("Password management script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Password management script failed:", error);
    process.exit(1);
  });

export { managePasswords };