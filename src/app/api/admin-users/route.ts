import { NextResponse } from "next/server";
import { getAdminCredentialsModel } from "@/lib/db/credentials";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const userRole = headersList.get("x-user-role");

    // Only superadmin can create new admin users
    if (userRole !== "superadmin") {
      return NextResponse.json(
        { error: "Only superadmin can create admin users" },
        { status: 403 }
      );
    }

    const { username, password, tenantId, databaseName } = await req.json();

    if (!username || !password || !tenantId || !databaseName) {
      return NextResponse.json(
        { error: "All fields are required: username, password, tenantId, databaseName" },
        { status: 400 }
      );
    }

    const AdminCredentials = await getAdminCredentialsModel();

    // Check if username already exists
    const existingAdmin = await AdminCredentials.findOne({ username });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // Create new admin
    const newAdmin = new AdminCredentials({
      username,
      password, // In production, hash this password!
      tenantId,
      databaseName,
      role: "admin",
      isActive: true,
    });

    await newAdmin.save();

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      admin: {
        username,
        tenantId,
        databaseName,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const headersList = await headers();
    const userRole = headersList.get("x-user-role");

    // Only superadmin can list admin users
    if (userRole !== "superadmin") {
      return NextResponse.json(
        { error: "Only superadmin can list admin users" },
        { status: 403 }
      );
    }

    const AdminCredentials = await getAdminCredentialsModel();
    const admins = await AdminCredentials.find(
      {},
      { password: 0 } // Exclude password from response
    ).sort({ createdAt: -1 });

    return NextResponse.json(admins);
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}