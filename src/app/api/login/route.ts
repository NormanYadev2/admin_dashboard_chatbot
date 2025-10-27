import { NextResponse } from "next/server";
import { verifyLogin, generateToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    console.log("Login attempt started");
    
    // Check if request has a body
    const contentType = req.headers.get("content-type");
    console.log("Content-Type:", contentType);
    
    if (!contentType || !contentType.includes("application/json")) {
      console.log("Invalid content-type");
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 400 }
      );
    }

    // Try to parse JSON with better error handling
    let body;
    try {
      const rawBody = await req.text(); // Get raw text first
      console.log("Raw body length:", rawBody.length);
      console.log("Raw body preview:", rawBody.substring(0, 50) + "..."); // Only show preview
      
      if (!rawBody.trim()) {
        console.log("Empty request body");
        return NextResponse.json(
          { error: "Request body is empty" },
          { status: 400 }
        );
      }
      
      body = JSON.parse(rawBody);
      console.log("Parsed body successfully");
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { username, password } = body;

    if (!username || !password) {
      console.log("Missing credentials");
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    console.log("Verifying login for username:", username);
    const adminUser = await verifyLogin(username, password);

    if (!adminUser) {
      console.log("Login failed for username:", username);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    console.log("Login successful for username:", username, "role:", adminUser.role);

    // Generate JWT token with admin user information
    const token = generateToken(adminUser);

    const response = NextResponse.json({
      success: true,
      user: {
        username: adminUser.username,
        role: adminUser.role,
        tenantId: adminUser.tenantId,
      },
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 1 day
      path: "/", // important for middleware access
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
