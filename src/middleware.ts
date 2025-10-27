//If a user is not logged in (no token): Redirect to /login.
//If a logged-in user tries to visit /login: Redirect to /admin.
//If the token is invalid or expired: Redirect to /login and clear the token.
//If the user has a valid token: Allow access to the requested /admin route.

export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, type AdminUser } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;  // Get jwt token from cookies
  const url = req.nextUrl.pathname;               // Get the requested URL path (like /login, /admin)


  // if token exist verfiy the token if valid then set the headers of jwt 
  // with username, role, tenant and database

  if (url.startsWith("/api/")) {
    if (token) {
      const decoded = verifyToken(token) as AdminUser | null;
      if (decoded) {
        const response = NextResponse.next();
        response.headers.set("x-user-username", decoded.username);
        response.headers.set("x-user-role", decoded.role);
        if (decoded.tenantId) {
          response.headers.set("x-user-tenant", decoded.tenantId);
        }
        if (decoded.databaseName) {
          response.headers.set("x-user-database", decoded.databaseName);
        }
        return response;
      }
    }
    // For API routes without valid token, continue without headers
    return NextResponse.next();
  }

  // User not logged in and trying to access /admin/*
  if (url.startsWith("/admin") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // User logged in, but visiting /login again then redirect to /admin
  if (url === "/login" && token) {
    const decoded = verifyToken(token);
    if (decoded) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  }

  // Token present but invalid or expired then redirect to login
  if (token) {
    const decoded = verifyToken(token) as AdminUser | null;
    if (!decoded) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("token");
      return res;
    }

    // Add user info to request headers for API routes to access
    const response = NextResponse.next();
    response.headers.set("x-user-username", decoded.username);
    response.headers.set("x-user-role", decoded.role);
    if (decoded.tenantId) {
      response.headers.set("x-user-tenant", decoded.tenantId);
    }
    if (decoded.databaseName) {
      response.headers.set("x-user-database", decoded.databaseName);
    }
    return response;
  }

  return NextResponse.next();
}

// Include API routes, /login and /admin in the matcher
export const config = {
  matcher: ["/admin/:path*", "/login", "/api/:path*"],
};
