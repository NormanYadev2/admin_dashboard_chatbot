import { NextResponse } from "next/server";
import { getTenantModel } from "@/lib/db/mongodb";
import { headers } from "next/headers";
import { getAllTenantDatabases } from "@/lib/utils/tenant-utils";
import { ApiUsageSchema } from "@/lib/schema/ApiUsage";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const userDatabase = headersList.get("x-user-database");
    const userRole = headersList.get("x-user-role");
    const userTenant = headersList.get("x-user-tenant");

    // Check for specific database selection from URL params
    const url = new URL(request.url);
    const selectedDb = url.searchParams.get("db");

    console.log(" Usage API - User Role:", userRole);
    console.log(" Usage API - User Database:", userDatabase);
    console.log(" Usage API - User Tenant:", userTenant);
    console.log(" Usage API - Selected DB:", selectedDb);

    if (!userRole) {
      console.log("❌ No user role found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userRole === "superadmin") {
      // If superadmin selected a specific database
      if (selectedDb) {
        console.log(" Superadmin accessing specific database:", selectedDb);
        try {
          const specificDbName = `${selectedDb}_chatbot`;
          const ApiUsage = await getTenantModel(specificDbName, "ApiUsage", ApiUsageSchema);
          const usage = await ApiUsage.find().sort({ timestamp: -1 });
          
          const usageWithTenant = usage.map(record => ({
            ...record.toObject(),
            _database: specificDbName,
            _tenant: selectedDb
          }));
          
          console.log(` Found ${usage.length} usage records in ${specificDbName}`);
          return NextResponse.json(usageWithTenant);
        } catch (error) {
          console.error(` Error accessing database ${selectedDb}_chatbot:`, error);
          return NextResponse.json({ error: "Failed to access selected database" }, { status: 500 });
        }
      }

      // Superadmin can access ALL tenant databases
      console.log(" Superadmin accessing all tenant databases");
      
      try {
        const databases = await getAllTenantDatabases();
        console.log(" Available databases:", databases);
        
        const allUsage: Record<string, unknown>[] = [];
        
        for (const dbName of databases) {
          try {
            console.log(` Connecting to database: ${dbName}`);
            const ApiUsage = await getTenantModel(dbName, "ApiUsage", ApiUsageSchema);
            const usage = await ApiUsage.find().sort({ timestamp: -1 });
            
            // Add database info to each usage record for identification
            const usageWithDB = usage.map(record => ({
              ...record.toObject(),
              _database: dbName,
              _tenant: dbName.replace('_chatbot', '') // Extract tenant from database name
            }));
            
            allUsage.push(...usageWithDB);
            console.log(` Found ${usage.length} usage records in ${dbName}`);
          } catch (dbError: unknown) {
            console.log(` Could not access database ${dbName}:`, dbError instanceof Error ? dbError.message : String(dbError));
          }
        }
        
        // Sort all usage by timestamp (timestamp field from timestamps: { createdAt: "timestamp" })
        allUsage.sort((a, b) => {
          const aRecord = a as Record<string, unknown>;
          const bRecord = b as Record<string, unknown>;
          const aTime = aRecord.timestamp || aRecord.createdAt || new Date(0);
          const bTime = bRecord.timestamp || bRecord.createdAt || new Date(0);
          return new Date(bTime as Date).getTime() - new Date(aTime as Date).getTime();
        });
        
        console.log(" Total usage records for superadmin:", allUsage.length);
        return NextResponse.json(allUsage);
      } catch (error) {
        console.error(" Error accessing databases for superadmin:", error);
        return NextResponse.json({ error: "Failed to access databases" }, { status: 500 });
      }
    } else if (userDatabase && userTenant) {
      // Regular admin accesses their specific database
      console.log(" Regular admin accessing database:", userDatabase, "for tenant:", userTenant);
      
      try {
        const ApiUsage = await getTenantModel(userDatabase, "ApiUsage", ApiUsageSchema);
        
        // For existing data without tenantId field, show all usage from their database
        // In the future, you can add tenantId field and filter properly
        const usage = await ApiUsage.find().sort({ timestamp: -1 });
        
        // Add tenant info to usage for consistency
        const usageWithTenant = usage.map(record => ({
          ...record.toObject(),
          _tenant: userTenant
        }));
        
        console.log(" Found", usage.length, "usage records for tenant:", userTenant);
        return NextResponse.json(usageWithTenant);
      } catch (error) {
        console.error(` Error accessing database ${userDatabase}:`, error);
        return NextResponse.json({ error: "Failed to access database" }, { status: 500 });
      }
    } else {
      console.log(" Unable to determine database context");
      return NextResponse.json({ error: "Unable to determine user context" }, { status: 400 });
    }
  } catch (err) {
    console.error(" Failed to fetch usage:", err);
    return NextResponse.json({ error: "Failed to fetch usage" }, { status: 500 });
  }
}
