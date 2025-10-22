import { NextResponse } from "next/server";
import { verifyLogin, generateToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!verifyLogin(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  //json web token is used to replace session memory and easier to scale compared to stateful memory
  const token = generateToken(username);

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: "token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 1 day
    path: "/", //  important for middleware access
  });

  return response;
}
