import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAdmin extends Document {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "super_admin" | "admin" | "manager";
  permissions: {
    products: boolean;
    orders: boolean;
    customers: boolean;
    analytics: boolean;
    settings: boolean;
    users: boolean;
  };
  isActive: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementLoginAttempts(): Promise<void>;
  isLocked(): boolean;
}

interface IAdminModel extends mongoose.Model<IAdmin> {
  getAuthenticated(
    username: string,
    password: string
  ): Promise<{ admin?: IAdmin; reason?: 'NOT_FOUND' | 'PASSWORD_INCORRECT' | 'MAX_ATTEMPTS' }>;
}

const AdminSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    role: {
      type: String,
      enum: ["super_admin", "admin", "manager"],
      default: "admin",
      index: true,
    },
    permissions: {
      products: { type: Boolean, default: true },
      orders: { type: Boolean, default: true },
      customers: { type: Boolean, default: true },
      analytics: { type: Boolean, default: true },
      settings: { type: Boolean, default: false },
      users: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for full name
AdminSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
AdminSchema.virtual("isLocked").get(function (this: IAdmin) {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

// Constants for account locking
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

// Pre-save middleware to hash password
AdminSchema.pre("save", async function (this: IAdmin, next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
AdminSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error("Password comparison failed");
  }
};

// Method to increment login attempts
AdminSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  // Lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  return this.updateOne(updates);
};

// Static method to find admin by credentials
AdminSchema.statics.getAuthenticated = async function (
  username: string,
  password: string
) {
  const admin = await this.findOne({
    $or: [{ username }, { email: username }],
    isActive: true,
  }).select("+password");

  if (!admin) {
    return { reason: "NOT_FOUND" };
  }

  // Check if account is locked
  if (admin.isLocked) {
    // Increment attempts if account is already locked
    await admin.incrementLoginAttempts();
    return { reason: "MAX_ATTEMPTS" };
  }

  // Test password
  const isMatch = await admin.comparePassword(password);

  if (isMatch) {
    // Reset login attempts and update last login
    const updates: any = {
      $unset: { loginAttempts: 1, lockUntil: 1 },
      $set: { lastLogin: new Date() },
    };
    await admin.updateOne(updates);
    return { admin };
  }

  // Password is incorrect, increment login attempts
  await admin.incrementLoginAttempts();
  return { reason: "PASSWORD_INCORRECT" };
};

// Indexes
AdminSchema.index({ username: 1 });
AdminSchema.index({ email: 1 });
AdminSchema.index({ isActive: 1 });
AdminSchema.index({ role: 1 });
AdminSchema.index({ lockUntil: 1 });

export default mongoose.models.Admin ||
  mongoose.model<IAdmin, IAdminModel>("Admin", AdminSchema);
