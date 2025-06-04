// src/scripts/createFirstAdmin.ts
import connectToDatabase from "@/lib/mongodb";
import Admin from "@/models/Admin";

export async function createFirstAdmin() {
  try {
    await connectToDatabase();

    // Check if any admin already exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      console.log("Admin account already exists. Skipping creation.");
      return { success: false, message: "Admin already exists" };
    }

    // Create the first super admin
    const firstAdmin = new Admin({
      username: "judzuii",
      email: "admin@fatsprinkle.co",
      password: "devbyjudzuii", // This will be hashed automatically
      firstName: "judezuii",
      lastName: "dev",
      role: "super_admin",
      permissions: {
        products: true,
        orders: true,
        customers: true,
        analytics: true,
        settings: true,
        users: true,
      },
      isActive: true,
    });

    await firstAdmin.save();

    console.log("First admin account created successfully!");
    console.log("⚠️  Please change the password after first login!");

    return {
      success: true,
      admin: {
        username: firstAdmin.username,
        email: firstAdmin.email,
        role: firstAdmin.role,
        id: firstAdmin._id,
      },
    };
  } catch (error) {
    console.error("Error creating first admin:", error);
    return { success: false, message: "Failed to create admin" };
  }
}
