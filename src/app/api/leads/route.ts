import { NextResponse } from "next/server";
import { getTenantModel } from "@/lib/db/mongodb";
import { headers } from "next/headers";
import { getAllTenantDatabases } from "@/lib/utils/tenant-utils";
import { LeadSchema } from "@/lib/schema/lead";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const userDatabase = headersList.get("x-user-database");
    const userRole = headersList.get("x-user-role");
    const userTenant = headersList.get("x-user-tenant");

    // Check for specific database selection from URL params
    const url = new URL(request.url);
    const selectedDb = url.searchParams.get("db");

    console.log(" Leads API - User Role:", userRole);
    console.log(" Leads API - User Database:", userDatabase);
    console.log(" Leads API - User Tenant:", userTenant);
    console.log(" Leads API - Selected DB:", selectedDb);

    if (!userRole) {
      console.log(" No user role found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userRole === "superadmin") {
      // If superadmin selected a specific database
      if (selectedDb) {
        console.log(" Superadmin accessing specific database:", selectedDb);
        try {
          const specificDbName = `${selectedDb}_chatbot`;
          const Lead = await getTenantModel(specificDbName, "Lead", LeadSchema);
          const leads = await Lead.find().sort({ createdAt: -1 });
          
          const leadsWithTenant = leads.map(lead => ({
            ...lead.toObject(),
            _database: specificDbName,
            _tenant: selectedDb
          }));
          
          console.log(` Found ${leads.length} leads in ${specificDbName}`);
          return NextResponse.json(leadsWithTenant);
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
        
        const allLeads: Record<string, unknown>[] = [];
        
        for (const dbName of databases) {
          try {
            console.log(` Connecting to database: ${dbName}`);
            const Lead = await getTenantModel(dbName, "Lead", LeadSchema);
            const leads = await Lead.find().sort({ createdAt: -1 });
            
            // Add database info to each lead for identification
            const leadsWithDB = leads.map(lead => ({
              ...lead.toObject(),
              _database: dbName,
              _tenant: dbName.replace('_chatbot', '') // Extract tenant from database name
            }));
            
            allLeads.push(...leadsWithDB);
            console.log(` Found ${leads.length} leads in ${dbName}`);
          } catch (dbError: unknown) {
            const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
            console.log(` Could not access database ${dbName}:`, errorMessage);
          }
        }
        
        // Sort all leads by creation date
        allLeads.sort((a, b) => {
          const aRecord = a as Record<string, unknown>;
          const bRecord = b as Record<string, unknown>;
          const aTime = aRecord.createdAt || new Date(0);
          const bTime = bRecord.createdAt || new Date(0);
          return new Date(bTime as Date).getTime() - new Date(aTime as Date).getTime();
        });
        
        console.log(" Total leads for superadmin:", allLeads.length);
        return NextResponse.json(allLeads);
      } catch (error) {
        console.error(" Error accessing databases for superadmin:", error);
        return NextResponse.json({ error: "Failed to access databases" }, { status: 500 });
      }
    } else if (userDatabase && userTenant) {
      // Regular admin accesses their specific database
      console.log(" Regular admin accessing database:", userDatabase, "for tenant:", userTenant);
      
      try {
        const Lead = await getTenantModel(userDatabase, "Lead", LeadSchema);
        
        // For existing data without tenantId field, show all leads from their database
        // In the future, you can add tenantId field and filter properly
        const leads = await Lead.find().sort({ createdAt: -1 });
        
        // Add tenant info to leads for consistency
        const leadsWithTenant = leads.map(lead => ({
          ...lead.toObject(),
          _tenant: userTenant
        }));
        
        console.log(" Found", leads.length, "leads for tenant:", userTenant);
        return NextResponse.json(leadsWithTenant);
      } catch (error) {
        console.error(` Error accessing database ${userDatabase}:`, error);
        return NextResponse.json({ error: "Failed to access database" }, { status: 500 });
      }
    } else {
      console.log(" Unable to determine database context");
      return NextResponse.json({ error: "Unable to determine user context" }, { status: 400 });
    }
  } catch (err) {
    console.error(" Failed to fetch leads:", err);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}