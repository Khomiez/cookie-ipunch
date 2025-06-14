import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import Admin, { IAdmin } from "@/models/Admin";
import connectToDatabase from "./mongodb";
import { NextResponse } from "next/server";

export interface AdminSession {
  id: string;
  adminId: string; // MongoDB _id of the admin
  username: string;
  email: string;
  role: "super_admin" | "admin" | "manager";
  permissions: {
    products: boolean;
    orders: boolean;
    customers: boolean;
    analytics: boolean;
    settings: boolean;
    users: boolean;
  };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    // Try to get from headers first (set by middleware for API routes)
    const headersList = await headers();
    const sessionHeader = headersList.get("x-admin-session");

    if (sessionHeader) {
      return JSON.parse(sessionHeader);
    }

    // Fallback to cookie verification
    const cookieStore = await cookies();
    const token = cookieStore.get("fatsprinkle_admin_session")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key"
    ) as AdminSession;

    // Verify admin still exists and is active
    await connectToDatabase();
    const admin = await Admin.findById(decoded.adminId).lean() as (IAdmin & { _id: string }) | null;

    if (!admin || !admin.isActive) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Error getting admin session:", error);
    return null;
  }
}

export async function requireAdminAuth(): Promise<AdminSession> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("fatsprinkle_admin_session");

  if (!adminSession?.value) {
    throw new Error("Unauthorized");
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }

    const decoded = jwt.verify(
      adminSession.value,
      process.env.JWT_SECRET
    ) as AdminSession;

    // Verify admin still exists and is active
    await connectToDatabase();
    const admin = await Admin.findById(decoded.adminId).lean() as (IAdmin & { _id: string }) | null;

    if (!admin || !admin.isActive) {
      throw new Error("Unauthorized");
    }

    return decoded;
  } catch (error) {
    throw new Error("Invalid session");
  }
}

export function hasPermission(session: AdminSession, permission: keyof AdminSession["permissions"]): boolean {
  return session.role === "super_admin" || session.permissions[permission];
}

export async function requirePermission(
  permission: keyof AdminSession["permissions"]
): Promise<AdminSession> {
  const session = await requireAdminAuth();

  if (!hasPermission(session, permission)) {
    throw new Error("Insufficient permissions");
  }

  return session;
}

// Audit logging for admin actions
export async function logAdminAction(
  adminId: string,
  action: string,
  resource: string,
  resourceId?: string,
  metadata?: any
) {
  try {
    await connectToDatabase();

    // You can create an AdminAuditLog model for this
    console.log("Admin Action:", {
      adminId,
      action,
      resource,
      resourceId,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement actual audit logging to database
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}

// Rate limiting for admin actions
const adminActionLimits = new Map<
  string,
  { count: number; resetTime: number }
>();

export function checkAdminRateLimit(
  adminId: string,
  action: string,
  maxAttempts: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = `${adminId}:${action}`;
  const now = Date.now();
  const current = adminActionLimits.get(key);

  if (!current || now > current.resetTime) {
    const newLimit = {
      count: 1,
      resetTime: now + windowMs,
    };
    adminActionLimits.set(key, newLimit);
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetTime: newLimit.resetTime,
    };
  }

  if (current.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: current.resetTime,
    };
  }

  current.count++;
  adminActionLimits.set(key, current);

  return {
    allowed: true,
    remaining: maxAttempts - current.count,
    resetTime: current.resetTime,
  };
}

export function handleAdminError(error: unknown) {
  console.error("Admin API error:", error);

  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error.message === "Invalid session") {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }
  }

  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 }
  );
}