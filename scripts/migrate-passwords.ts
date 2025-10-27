/**
 * Password Migration Script
 * 
 * This script migrates existing plain text passwords in MongoDB to hashed passwords
 * Run this once to upgrade existing admin accounts
 * 
 * Usage: tsx scripts/migrate-passwords.ts
 */

// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { hashPassword, isPasswordHashed } from "../src/lib/utils/password";

async function migratePasswords() {
  try {
    console.log("🔄 Starting password migration...");
    
    // Construct MongoDB URI for admin_credentials database
    const baseUri = process.env.MONGODB_BASE_URI;
    const options = process.env.MONGODB_OPTIONS;
    
    if (!baseUri) {
      throw new Error("MONGODB_BASE_URI environment variable is required");
    }
    
    const mongoUri = `${baseUri}/admin_credentials${options || ''}`;
    console.log("🔗 Connecting to admin_credentials database...");
    
    // Connect to MongoDB using Mongoose
    await mongoose.connect(mongoUri);
    
    // Define a simple schema for the credentials collection
    const credentialsSchema = new mongoose.Schema({
      username: String,
      password: String,
    }, { collection: 'credentials' });
    
    const Credentials = mongoose.model('Credentials', credentialsSchema);
    
    // Find all admin records
    const admins = await Credentials.find({});
    console.log(`📋 Found ${admins.length} admin records`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const admin of admins) {
      // Check if password is already hashed
      if (isPasswordHashed(admin.password)) {
        console.log(`⏭️  Skipping ${admin.username} - already hashed`);
        skippedCount++;
        continue;
      }
      
      console.log(`🔐 Migrating password for ${admin.username}...`);
      
      // Hash the plain text password
      const hashedPassword = await hashPassword(admin.password);
      
      // Update the admin record
      admin.password = hashedPassword;
      await admin.save();
      
      migratedCount++;
      console.log(`✅ Migrated ${admin.username}`);
    }
    
    console.log("\n🎉 Migration completed!");
    console.log(`✅ Migrated: ${migratedCount} passwords`);
    console.log(`⏭️  Skipped: ${skippedCount} passwords (already hashed)`);
    
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    // Clean up connection
    await mongoose.disconnect();
    console.log("🔌 Database connection closed");
  }
}

// Run migration
migratePasswords()
  .then(() => {
    console.log("✅ Migration script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Migration script failed:", error);
    process.exit(1);
  });

export { migratePasswords };