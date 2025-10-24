import jwt from "jsonwebtoken";
import { getAdminCredentialsModel } from "@/lib/db/credentials";
import { getCredentialsDatabase, buildTenantDatabaseName } from "@/lib/utils/mongodb-utils";

const SECRET = process.env.JWT_SECRET!;
const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME!;
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD!;

export interface AdminUser {
  username: string;
  role: "superadmin" | "admin";
  tenantId?: string; // Only for regular admins, not superadmin
  databaseName?: string; // Only for regular admins, superadmin accesses all
}

export async function verifyLogin(username: string, password: string): Promise<AdminUser | null> {
  // Check if it's a superadmin login
  if (username === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD) {
    return {
      username,
      role: "superadmin",
      // No tenantId or databaseName - superadmin accesses all databases
    };
  }

  // Check if it's a regular admin from the database
  try {
    const AdminCredentials = await getAdminCredentialsModel();
    const admin = await AdminCredentials.findOne({
      username,
      password,
      // Don't check isActive if it's not set in existing data
    });
    
    if (admin) {
      // Update last login
      admin.lastLogin = new Date();
      await admin.save();

      // Regular admins get their specific tenant database
      const databaseName = admin.databaseName || buildTenantDatabaseName(admin.tenantId);

      return {
        username: admin.username,
        role: admin.role || "admin",
        tenantId: admin.tenantId, // Required for regular admins
        databaseName: databaseName, // Specific database for this admin
      };
    }
  } catch (error) {
    console.error("Error checking admin credentials:", error);
  }

  return null;
}

export function generateToken(adminUser: AdminUser) {
  return jwt.sign(
    {
      username: adminUser.username,
      role: adminUser.role,
      tenantId: adminUser.tenantId,
      databaseName: adminUser.databaseName,
    },
    SECRET,
    { expiresIn: "1d" }
  );
}

export function verifyToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, SECRET) as AdminUser;
    return decoded;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}
