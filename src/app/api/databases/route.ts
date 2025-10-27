//This API endpoint provides a list of available tenant databases with metadata for 
// superadmin users to select and navigate between different tenant databases.

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAllTenantDatabases } from "@/lib/utils/tenant-utils";

export async function GET() {
  try {
    const headersList = await headers();
    const userRole = headersList.get("x-user-role");

    console.log(" Databases API - User Role:", userRole);

    if (userRole !== "superadmin") {
      console.log(" Access denied - not superadmin");
      return NextResponse.json({ error: "Access denied. Superadmin role required." }, { status: 403 });
    }

    console.log(" Superadmin requesting available databases");
    
    try {
      const databases = await getAllTenantDatabases();
      console.log(" Found databases:", databases);
      
      // Convert database names to more user-friendly format
      const databaseInfo = databases.map(dbName => ({
        name: dbName,
        displayName: dbName.replace('_chatbot', '').toUpperCase() + ' Database',
        tenantId: dbName.replace('_chatbot', ''),
        description: `Database for ${dbName.replace('_chatbot', '')} tenant`
      }));
      
      return NextResponse.json(databaseInfo);
    } catch (error) {
      console.error(" Error getting databases:", error);
      return NextResponse.json({ error: "Failed to fetch databases" }, { status: 500 });
    }
  } catch (err) {
    console.error(" Failed to process databases request:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}