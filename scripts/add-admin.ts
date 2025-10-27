/**
 * Add New Admin Utility
 * 
 * This utility helps you add new admin users with properly hashed passwords
 * 
 * Usage: tsx scripts/add-admin.ts
 */

// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

// Now import everything else
import { getAdminCredentialsModel } from "../src/lib/db/credentials";
import { hashPassword } from "../src/lib/utils/password";

interface NewAdminData {
  name?: string;
  username: string;
  password: string;
  role?: "admin" | "superadmin";
  tenantId: string;
  isActive?: boolean;
}

export async function addNewAdmin(
  username: string,
  plainPassword: string, 
  tenantId: string,
  role: "admin" | "superadmin" = "admin",
  name?: string
) {
  try {
    console.log(` Adding new admin: ${username}`);
    
    const AdminCredentials = await getAdminCredentialsModel();
    
    // Check if username already exists
    const existingAdmin = await (AdminCredentials as any).findOne({ username });
    if (existingAdmin) {
      throw new Error(`Admin with username '${username}' already exists`);
    }
    
    // Hash the password
    console.log("Hashing password...");
    const hashedPassword = await hashPassword(plainPassword);
    
    // Create new admin data with correct field order (role before tenantId)
    const adminData = {
      name: name || username,
      username,
      password: hashedPassword,
      role,
      tenantId,
      isActive: true,
    };
    
    // Create and save new admin
    const newAdmin = new (AdminCredentials as any)(adminData);
    await newAdmin.save();
    
    console.log(` Successfully added admin: ${username}`);
    console.log(`   - Role: ${role}`);
    console.log(`   - Tenant: ${tenantId}`);
    
    return {
      success: true,
      admin: {
        username: adminData.username,
        role: adminData.role,
        tenantId: adminData.tenantId,
      }
    };
    
  } catch (error) {
    console.error("❌ Failed to add admin:", error);
    throw error;
  }
}

// Example usage function
async function addExampleAdmins() {
  try {
    // Add admin for sas tenant
    await addNewAdmin(
      "",    // username
      "",       // password
      "",          // tenantId
      "",        // role
      ""     // name (matching the username for consistency)
    );
    
    console.log(" Admin added successfully!");
    
  } catch (error) {
    console.error(" Failed to add admin:", error);
    process.exit(1);
  } finally {
    // Close the database connection
    process.exit(0);
  }
}

// Run the script
addExampleAdmins();
