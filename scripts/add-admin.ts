/**
 * Add New Admin Utility
 * 
 * This utility helps you add new admin users with properly hashed passwords
 * 
 * Usage: tsx scripts/add-admin.ts
 */

import dotenv from 'dotenv';
import { getAdminCredentialsModel } from "../src/lib/db/credentials";
import { hashPassword } from "../src/lib/utils/password";
import { buildTenantDatabaseName } from "../src/lib/utils/mongodb-utils";

// Load environment variables
dotenv.config();

interface NewAdminData {
  name?: string;
  username: string;
  password: string;
  tenantId: string;
  databaseName?: string;
  role?: "admin" | "superadmin";
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
    console.log(`🔐 Adding new admin: ${username}`);
    
    const AdminCredentials = await getAdminCredentialsModel();
    
    // Check if username already exists
    const existingAdmin = await (AdminCredentials as any).findOne({ username });
    if (existingAdmin) {
      throw new Error(`Admin with username '${username}' already exists`);
    }
    
    // Hash the password
    console.log("🔄 Hashing password...");
    const hashedPassword = await hashPassword(plainPassword);
    
    // Create new admin data
    const adminData: NewAdminData = {
      name: name || username,
      username,
      password: hashedPassword,
      tenantId,
      databaseName: buildTenantDatabaseName(tenantId),
      role,
      isActive: true,
    };
    
    // Create and save new admin
    const newAdmin = new (AdminCredentials as any)(adminData);
    await newAdmin.save();
    
    console.log(`✅ Successfully added admin: ${username}`);
    console.log(`   - Role: ${role}`);
    console.log(`   - Tenant: ${tenantId}`);
    console.log(`   - Database: ${adminData.databaseName}`);
    
    return {
      success: true,
      admin: {
        username: adminData.username,
        role: adminData.role,
        tenantId: adminData.tenantId,
        databaseName: adminData.databaseName,
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
    // Add admin for 'newclient' tenant
    await addNewAdmin(
      "john_newclient",    // username
      "securePassword123", // password
      "newclient",         // tenantId
      "admin",             // role
      "John Smith"         // name (optional)
    );
    
    // Add admin for 'company' tenant
    await addNewAdmin(
      "admin_company",
      "myPassword456",
      "company",
      "admin",
      "Company Admin"
    );
    
    console.log("🎉 All example admins added successfully!");
    
  } catch (error) {
    console.error("❌ Failed to add example admins:", error);
  }
}

// Uncomment and run to add example admins:
// addExampleAdmins();