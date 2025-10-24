import { getAdminCredentialsModel } from "@/lib/db/credentials";
import { buildTenantDatabaseName } from "@/lib/utils/mongodb-utils";

/**
 * Gets all available tenant databases by querying admin credentials
 * @returns Array of database names that exist for different tenants
 */
export async function getAllTenantDatabases(): Promise<string[]> {
  try {
    const AdminCredentials = await getAdminCredentialsModel();
    
    // Get all unique tenant IDs from admin credentials
    const tenants = await AdminCredentials.distinct("tenantId");
    
    // Convert tenant IDs to database names
    const databases = tenants.map(tenantId => 
      buildTenantDatabaseName(tenantId)
    );
    
    console.log("Available tenant databases:", databases);
    return databases;
  } catch (error) {
    console.error("Error getting tenant databases:", error);
    // Return known databases as fallback
    return ["ai_chatbot"];
  }
}

/**
 * Gets all tenants for superadmin access
 * @returns Array of tenant objects with their info
 */
export async function getAllTenants(): Promise<Array<{tenantId: string, databaseName: string, adminCount: number}>> {
  try {
    const AdminCredentials = await getAdminCredentialsModel();
    
    // Get all admins grouped by tenant
    const tenants = await AdminCredentials.aggregate([
      {
        $group: {
          _id: "$tenantId",
          adminCount: { $sum: 1 },
          databaseName: { $first: "$databaseName" }
        }
      }
    ]);
    
    return tenants.map(tenant => ({
      tenantId: tenant._id,
      databaseName: tenant.databaseName || buildTenantDatabaseName(tenant._id),
      adminCount: tenant.adminCount
    }));
  } catch (error) {
    console.error("Error getting all tenants:", error);
    return [];
  }
}