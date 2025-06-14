// src/app/api/admin/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, hasPermission } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongodb";
import Order, { IOrder } from "@/models/Order";

// GET - List all orders for admin with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = await requireAdminAuth();

    if (!hasPermission(adminSession, "orders")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status"); // 'pending', 'confirmed', etc.
    const paymentStatus = searchParams.get("paymentStatus"); // 'paid', 'pending', etc.
    const deliveryMethod = searchParams.get("deliveryMethod"); // 'pickup', 'shipping'
    const search = searchParams.get("search") || ""; // Search customer name/email/order ID
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build query
    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus;
    }

    if (deliveryMethod && deliveryMethod !== "all") {
      query.deliveryMethod = deliveryMethod;
    }

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { "customerDetails.name": { $regex: search, $options: "i" } },
        { "customerDetails.email": { $regex: search, $options: "i" } },
      ];
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.createdAt.$lte = new Date(dateTo);
      }
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [orders, totalCount] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    // Transform orders for admin interface
    const transformedOrders = orders.map((order) => ({
      id: order.orderId,
      customerName: order.customerDetails.name,
      email: order.customerDetails.email,
      phone: order.customerDetails.phone,
      items: order.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        tag: item.tag,
      })),
      total: order.total,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      status: order.status,
      paymentStatus: order.paymentStatus,
      deliveryMethod: order.deliveryMethod,
      deliveryDate: order.deliveryDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customerNotes: order.customerNotes,
      adminNotes: order.adminNotes,
      statusHistory: order.statusHistory,
      stripeSessionId: order.stripeSessionId,
    }));

    return NextResponse.json({
      orders: transformedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching admin orders:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST - Create new order (for admin-created orders)
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = await requireAdminAuth();

    if (!hasPermission(adminSession, "orders")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      customerDetails,
      items,
      deliveryMethod,
      deliveryDate,
      customerNotes,
      adminNotes,
    } = body;

    // Validation
    if (!customerDetails || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer details and items are required" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
    const shippingFee = deliveryMethod === "shipping" ? 40 : 0;
    const total = subtotal + shippingFee;

    // Create new order
    const newOrder = new Order({
      customerDetails,
      items,
      subtotal,
      shippingFee,
      total,
      deliveryMethod,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
      status: "confirmed", // Admin-created orders start as confirmed
      paymentStatus: "paid", // Assume admin orders are already paid
      customerNotes,
      adminNotes,
      source: "admin_created",
      orderType: "admin_order",
      stripeSessionId: `admin_${Date.now()}`, // Placeholder for admin orders
      statusHistory: [
        {
          status: "confirmed",
          timestamp: new Date(),
          updatedBy: adminSession.adminId,
          notes: "Order created by admin",
        },
      ],
    });

    await newOrder.save();

    return NextResponse.json(
      {
        success: true,
        order: {
          id: newOrder.orderId,
          customerName: newOrder.customerDetails.name,
          email: newOrder.customerDetails.email,
          total: newOrder.total,
          status: newOrder.status,
          createdAt: newOrder.createdAt,
        },
        message: "Order created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}