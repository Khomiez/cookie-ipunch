import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get authenticated admin
    const result = await (Admin as any).getAuthenticated(username, password);

    if (result.reason) {
      const errorMessages = {
        'NOT_FOUND': 'Invalid credentials',
        'PASSWORD_INCORRECT': 'Invalid credentials',
        'MAX_ATTEMPTS': 'Account temporarily locked due to too many failed login attempts'
      };

      return NextResponse.json(
        { error: errorMessages[result.reason as keyof typeof errorMessages] || 'Login failed' },
        { status: 401 }
      );
    }

    const admin = result.admin;

    // Create JWT token
    const token = jwt.sign(
      {
        adminId: admin._id,
        username: admin.username,
        role: admin.role,
        permissions: admin.permissions
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("fatsprinkle_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}

// Logout endpoint (unchanged)
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("fatsprinkle_admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}