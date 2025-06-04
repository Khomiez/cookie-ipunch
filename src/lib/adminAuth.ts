// src/lib/adminAuth.ts - Helper functions for admin authentication
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Admin from "@/models/Admin";
import connectToDatabase from "./mongodb";

export interface AdminSession {
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

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("fatsprinkle_admin_session")?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback-secret-key"
    ) as AdminSession;

    // Optionally verify admin still exists and is active
    await connectToDatabase();
    const admin = await Admin.findById(decoded.adminId);

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
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function hasPermission(
  session: AdminSession,
  permission: keyof AdminSession["permissions"]
): boolean {
  return session.role === "super_admin" || session.permissions[permission];
}
