//If a user is not logged in (no token): Redirect to /login.
//If a logged-in user tries to visit /login: Redirect to /admin.
//If the token is invalid or expired: Redirect to /login and clear the token.
//If the user has a valid token: Allow access to the requested /admin route.


export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";


export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.pathname;

  // User not logged in and trying to access /admin/*
  if (url.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // User logged in, but visiting /login again → redirect to /admin
  if (url === "/login" && token) {
    const decoded = verifyToken(token);
    if (decoded) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // Token present but invalid or expired
  if (token) {
    const decoded = verifyToken(token);
    if (!decoded) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("token");
      return res;
    }
  }

  return NextResponse.next();
}

// Include /login and /admin in the matcher
export const config = {
  matcher: ["/admin/:path*", "/login"],
};
