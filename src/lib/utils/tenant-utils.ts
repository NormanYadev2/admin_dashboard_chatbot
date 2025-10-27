import { getAdminCredentialsModel } from "@/lib/db/credentials";
import { buildTenantDatabaseName } from "@/lib/utils/mongodb-utils";

// Define interface for Mongoose model methods we need
interface MongooseModel {
  find(query: Record<string, unknown>): {
    lean(): Promise<AdminRecord[]>;
  };
  aggregate(pipeline: Record<string, unknown>[]): Promise<TenantAggregateResult[]>;
}

// Define interfaces for the data structures
interface AdminRecord {
  tenantId: string;
  role: string;
  isActive: boolean;
}

interface TenantAggregateResult {
  _id: string;
  adminCount: number;
  databaseName?: string;
}

/**
 * Gets all available tenant databases by querying admin credentials
 * @returns Array of database names that exist for different tenants
 */
export async function getAllTenantDatabases(): Promise<string[]> {
  try {
    const AdminCredentials = await getAdminCredentialsModel();
    
    // Get all unique tenant IDs from admin credentials, excluding superadmin
    const adminRecords = await ((AdminCredentials as unknown) as MongooseModel).find({
      role: "admin", // Only get regular admins (not superadmin)
      isActive: true, // Only active tenants
      tenantId: { $exists: true, $ne: null } // Ensure tenantId exists
    }).lean();
    
    // Extract unique tenant IDs
    const allTenantIds = adminRecords
      .map((record: AdminRecord) => record.tenantId)
      .filter((tenantId: string): tenantId is string => 
        typeof tenantId === 'string' && tenantId.trim() !== ''
      );
    
    const tenantIds = Array.from(new Set(allTenantIds)) as string[];
    
    console.log(" Found active tenant IDs:", tenantIds);
    
    // Convert tenant IDs to database names
    const databases: string[] = [];
    for (const tenantId of tenantIds) {
      databases.push(buildTenantDatabaseName(tenantId));
    }
    
    console.log(" Generated tenant database names:", databases);
    
    // If no databases found, return empty array
    if (databases.length === 0) {
      console.log(" No tenant databases found, returning empty array");
      return [];
    }
    
    return databases;
  } catch (error) {
    console.error(" Error getting tenant databases:", error);
    // Return empty array on error
    console.log(" Returning empty array due to error");
    return [];
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
    const tenants = await ((AdminCredentials as unknown) as MongooseModel).aggregate([
      {
        $group: {
          _id: "$tenantId",
          adminCount: { $sum: 1 },
          databaseName: { $first: "$databaseName" }
        }
      }
    ]);
    
    return tenants.map((tenant: TenantAggregateResult) => ({
      tenantId: tenant._id,
      databaseName: tenant.databaseName || buildTenantDatabaseName(tenant._id),
      adminCount: tenant.adminCount
    }));
  } catch (error) {
    console.error("Error getting all tenants:", error);
    return [];
  }
}