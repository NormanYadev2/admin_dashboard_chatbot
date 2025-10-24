import { NextResponse } from "next/server";
import { verifyLogin, generateToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const adminUser = await verifyLogin(username, password);

    if (!adminUser) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

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
