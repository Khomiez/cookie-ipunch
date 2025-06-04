// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const runtime = 'nodejs';

interface AdminSession {
  adminId: string;
  username: string;
  role: string;
  permissions: {
    products: boolean;
    orders: boolean;
    customers: boolean;
    analytics: boolean;
    settings: boolean;
    users: boolean;
  };
}

function adminAuthMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for login page and public admin assets
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/_next") ||
    pathname.startsWith("/admin/api/auth/login")
  ) {
    return NextResponse.next();
  }

  // Check for admin session
  const adminSession = request.cookies.get("fatsprinkle_admin_session");

  if (!adminSession) {
    // Redirect to login if no session
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(
      adminSession.value,
      process.env.JWT_SECRET || "fallback-secret-key"
    ) as AdminSession;

    // Check if accessing API endpoints
    if (pathname.startsWith("/api/admin/")) {
      // Add admin session to headers for API routes
      const response = NextResponse.next();
      response.headers.set(
        "x-admin-session",
        JSON.stringify({
          adminId: decoded.adminId,
          username: decoded.username,
          role: decoded.role,
          permissions: decoded.permissions,
        })
      );
      return response;
    }

    // Check permissions for specific routes
    if (
      pathname.startsWith("/admin/products") &&
      !decoded.permissions.products
    ) {
      return NextResponse.redirect(
        new URL("/admin/dashboard?error=insufficient_permissions", request.url)
      );
    }

    if (pathname.startsWith("/admin/orders") && !decoded.permissions.orders) {
      return NextResponse.redirect(
        new URL("/admin/dashboard?error=insufficient_permissions", request.url)
      );
    }

    if (
      pathname.startsWith("/admin/customers") &&
      !decoded.permissions.customers
    ) {
      return NextResponse.redirect(
        new URL("/admin/dashboard?error=insufficient_permissions", request.url)
      );
    }

    if (
      pathname.startsWith("/admin/analytics") &&
      !decoded.permissions.analytics
    ) {
      return NextResponse.redirect(
        new URL("/admin/dashboard?error=insufficient_permissions", request.url)
      );
    }

    if (
      pathname.startsWith("/admin/settings") &&
      !decoded.permissions.settings
    ) {
      return NextResponse.redirect(
        new URL("/admin/dashboard?error=insufficient_permissions", request.url)
      );
    }

    if (pathname.startsWith("/admin/users") && !decoded.permissions.users) {
      return NextResponse.redirect(
        new URL("/admin/dashboard?error=insufficient_permissions", request.url)
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    // Invalid token, redirect to login
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url)
    );
    response.cookies.delete("fatsprinkle_admin_session");
    return response;
  }
}

export function middleware(request: NextRequest) {
  // Apply admin authentication middleware
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminAuthMiddleware(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
}; 