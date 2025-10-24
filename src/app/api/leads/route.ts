import { NextResponse } from "next/server";
import { connectDB, getTenantModel } from "@/lib/db/mongodb";
import { headers } from "next/headers";
import { getAllTenantDatabases } from "@/lib/utils/tenant-utils";
import mongoose from "mongoose";

// Lead schema
const LeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    conversation: [
      {
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
      },
    ],
    tenantId: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "leads",
  }
);

export async function GET() {
  try {
    const headersList = await headers();
    const userDatabase = headersList.get("x-user-database");
    const userRole = headersList.get("x-user-role");
    const userTenant = headersList.get("x-user-tenant");

    console.log("🔍 Leads API - User Role:", userRole);
    console.log("🔍 Leads API - User Database:", userDatabase);
    console.log("🔍 Leads API - User Tenant:", userTenant);

    if (!userRole) {
      console.log("❌ No user role found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (userRole === "superadmin") {
      // Superadmin can access ALL tenant databases
      console.log("🔍 Superadmin accessing all tenant databases");
      
      try {
        const databases = await getAllTenantDatabases();
        console.log("🔍 Available databases:", databases);
        
        const allLeads = [];
        
        for (const dbName of databases) {
          try {
            console.log(`🔍 Connecting to database: ${dbName}`);
            const Lead = await getTenantModel(dbName, "Lead", LeadSchema);
            const leads = await Lead.find().sort({ createdAt: -1 });
            
            // Add database info to each lead for identification
            const leadsWithDB = leads.map(lead => ({
              ...lead.toObject(),
              _database: dbName,
              _tenant: dbName.replace('_chatbot', '') // Extract tenant from database name
            }));
            
            allLeads.push(...leadsWithDB);
            console.log(`✅ Found ${leads.length} leads in ${dbName}`);
          } catch (dbError) {
            console.log(`⚠️ Could not access database ${dbName}:`, dbError.message);
          }
        }
        
        // Sort all leads by creation date
        allLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log("✅ Total leads for superadmin:", allLeads.length);
        return NextResponse.json(allLeads);
      } catch (error) {
        console.error("❌ Error accessing databases for superadmin:", error);
        return NextResponse.json({ error: "Failed to access databases" }, { status: 500 });
      }
    } else if (userDatabase && userTenant) {
      // Regular admin accesses their specific database
      console.log("🔍 Regular admin accessing database:", userDatabase, "for tenant:", userTenant);
      
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
        
        console.log("✅ Found", leads.length, "leads for tenant:", userTenant);
        return NextResponse.json(leadsWithTenant);
      } catch (error) {
        console.error(`❌ Error accessing database ${userDatabase}:`, error);
        return NextResponse.json({ error: "Failed to access database" }, { status: 500 });
      }
    } else {
      console.log("❌ Unable to determine database context");
      return NextResponse.json({ error: "Unable to determine user context" }, { status: 400 });
    }
  } catch (err) {
    console.error("❌ Failed to fetch leads:", err);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}
