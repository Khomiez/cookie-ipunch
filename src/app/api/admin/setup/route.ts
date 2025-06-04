// src/app/api/admin/setup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createFirstAdmin } from "@/scripts/createFirstAdmin";

export async function POST(request: NextRequest) {
  try {
    // Optional: Add a secret key check to prevent unauthorized admin creation
    const { secretKey } = await request.json();

    // Use environment variable for security
    if (secretKey !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await createFirstAdmin();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "First admin account created successfully",
        admin: result.admin,
      });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error) {
    console.error("Admin setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup admin account" },
      { status: 500 }
    );
  }
}
