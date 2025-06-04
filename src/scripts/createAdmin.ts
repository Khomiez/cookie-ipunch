import connectToDatabase from '../lib/mongodb';
import Admin from '../models/Admin';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    await connectToDatabase();

    // Check if admin exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new Admin({
      username: 'admin',
      email: 'admin@fatsprinkle.co',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'super_admin',
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

    await admin.save();
    console.log('Admin user created successfully');
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    process.exit();
  }
}

createAdmin(); 