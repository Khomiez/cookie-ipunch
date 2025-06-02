// src/models/Order.ts
import mongoose, { Schema, Document } from "mongoose";

// Order Item Interface
export interface IOrderItem {
  productId: string;
  stripeProductId: string;
  stripePriceId: string;
  name: string;
  description: string;
  price: number; // Price in Baht
  quantity: number;
  image?: string;
  tag?: string;
}

// Customer Details Interface
export interface ICustomerDetails {
  name: string;
  email: string;
  phone: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

// Order Interface
export interface IOrder extends Document {
  orderId: string; // Human-readable order ID (e.g., "FS240601001")
  stripeSessionId: string;
  stripePaymentIntentId?: string;

  // Customer Information
  customerDetails: ICustomerDetails;

  // Order Details
  items: IOrderItem[];
  subtotal: number; // Items total in Baht
  shippingFee: number; // Shipping fee in Baht
  total: number; // Final total in Baht

  // Delivery Information
  deliveryMethod: "pickup" | "shipping";
  deliveryDate?: Date;
  deliveryTimeSlot?: string;

  // Order Status
  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "ready"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Notes
  customerNotes?: string;
  adminNotes?: string;

  // Metadata
  source: string; // e.g., 'fatsprinkle_website'
  orderType: string; // e.g., 'pre_order'
}

// Order Schema
const OrderSchema: Schema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      index: true,
    },

    // Customer Details
    customerDetails: {
      name: { type: String, required: true },
      email: {
        type: String,
        required: true,
        lowercase: true,
        index: true, // Important for email-based lookup
      },
      phone: { type: String, required: true },
      address: {
        line1: String,
        line2: String,
        city: String,
        state: String,
        postal_code: String,
        country: String,
      },
    },

    // Order Items
    items: [
      {
        productId: { type: String, required: true },
        stripeProductId: { type: String, required: true },
        stripePriceId: { type: String, required: true },
        name: { type: String, required: true },
        description: String,
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: String,
        tag: String,
      },
    ],

    // Pricing
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // Delivery
    deliveryMethod: {
      type: String,
      enum: ["pickup", "shipping"],
      required: true,
    },
    deliveryDate: Date,
    deliveryTimeSlot: String,

    // Status
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    // Notes
    customerNotes: String,
    adminNotes: String,

    // Metadata
    source: {
      type: String,
      default: "fatsprinkle_website",
    },
    orderType: {
      type: String,
      default: "pre_order",
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for efficient queries
OrderSchema.index({ "customerDetails.email": 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ deliveryDate: 1 });

// Generate readable order ID
OrderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderId) {
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, ""); // YYMMDD

    // Find the last order of today
    const lastOrder = await mongoose
      .model("Order")
      .findOne({
        orderId: new RegExp(`^FS${dateStr}`),
      })
      .sort({ orderId: -1 });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderId.slice(-3));
      sequence = lastSequence + 1;
    }

    this.orderId = `FS${dateStr}${sequence.toString().padStart(3, "0")}`;
  }
  next();
});

// Export the model
export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
