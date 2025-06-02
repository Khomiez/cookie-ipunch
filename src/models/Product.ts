// src/models/Product.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  stripeProductId: string;
  stripePriceId: string;
  name: string;
  description: string;
  price: number; // Price in Baht
  images: string[];
  tag?: string;
  category?: string;
  active: boolean;
  inventory?: {
    enabled: boolean;
    stock: number;
    lowStockThreshold: number;
  };
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    stripeProductId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stripePriceId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        type: String,
      },
    ],
    tag: {
      type: String,
      index: true,
    },
    category: {
      type: String,
      default: "cookies",
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    inventory: {
      enabled: { type: Boolean, default: false },
      stock: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 5 },
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ProductSchema.index({ active: 1, category: 1 });
ProductSchema.index({ name: "text", description: "text" });

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
