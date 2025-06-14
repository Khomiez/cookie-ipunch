// src/app/api/admin/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, hasPermission } from "@/lib/adminAuth";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

// GET - Get single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const adminSession = await requireAdminAuth();

    if (!hasPermission(adminSession, "orders")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const orderId = params.id;

    // Connect to database
    await connectToDatabase();

    // Find order by orderId or MongoDB _id
    const order = await Order.findOne({
      $or: [{ orderId }, { _id: orderId }],
    }).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Transform order for admin interface
    const transformedOrder = {
      id: order.orderId,
      customerName: order.customerDetails.name,
      email: order.customerDetails.email,
      phone: order.customerDetails.phone,
      address: order.customerDetails.address,
      items: order.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
        tag: item.tag,
        total: item.price * item.quantity,
      })),
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      deliveryMethod: order.deliveryMethod,
      deliveryDate: order.deliveryDate,
      deliveryTimeSlot: order.deliveryTimeSlot,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customerNotes: order.customerNotes,
      adminNotes: order.adminNotes,
      statusHistory: order.statusHistory,
      stripeSessionId: order.stripeSessionId,
      stripePaymentIntentId: order.stripePaymentIntentId,
      source: order.source,
      orderType: order.orderType,
    };

    return NextResponse.json({ order: transformedOrder });
  } catch (error) {
    console.error("Error fetching order:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PUT - Update order status and details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const adminSession = await requireAdminAuth();

    if (!hasPermission(adminSession, "orders")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const orderId = params.id;
    const body = await request.json();
    const { 
      status, 
      paymentStatus, 
      adminNotes, 
      deliveryDate, 
      deliveryTimeSlot,
      statusNotes 
    } = body;

    // Connect to database
    await connectToDatabase();

    // Find order
    const order = await Order.findOne({
      $or: [{ orderId }, { _id: orderId }],
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (deliveryDate !== undefined) updateData.deliveryDate = new Date(deliveryDate);
    if (deliveryTimeSlot !== undefined) updateData.deliveryTimeSlot = deliveryTimeSlot;

    // Handle status update with validation
    if (status !== undefined && status !== order.status) {
      // Validate status transition
      const validStatuses = [
        "pending",
        "confirmed", 
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled"
      ];

      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }

      // Check if status transition is valid based on current status
      const statusFlow = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"];
      const currentIndex = statusFlow.indexOf(order.status);
      const newIndex = statusFlow.indexOf(status);

      // Allow status to move forward, backward, or to cancelled
      if (status !== "cancelled" && currentIndex !== -1 && newIndex !== -1) {
        const maxJump = 2; // Allow jumping up to 2 steps
        if (newIndex > currentIndex + maxJump) {
          return NextResponse.json(
            { error: `Cannot jump from ${order.status} to ${status}` },
            { status: 400 }
          );
        }
      }

      updateData.status = status;

      // Add to status history
      updateData.$push = {
        statusHistory: {
          status,
          timestamp: new Date(),
          updatedBy: adminSession.adminId,
          notes: statusNotes || `Status updated to ${status}`,
        },
      };
    }

    // Update order
    const updatedOrder = await Order.findOneAndUpdate(
      { $or: [{ orderId }, { _id: orderId }] },
      updateData,
      { new: true, lean: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    // Transform response
    const transformedOrder = {
      id: updatedOrder.orderId,
      customerName: updatedOrder.customerDetails.name,
      email: updatedOrder.customerDetails.email,
      status: updatedOrder.status,
      paymentStatus: updatedOrder.paymentStatus,
      total: updatedOrder.total,
      updatedAt: updatedOrder.updatedAt,
      statusHistory: updatedOrder.statusHistory,
    };

    return NextResponse.json({
      success: true,
      order: transformedOrder,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("Error updating order:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

// DELETE - Cancel order (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const adminSession = await requireAdminAuth();

    if (!hasPermission(adminSession, "orders")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const orderId = params.id;

    // Connect to database
    await connectToDatabase();

    // Find and update order to cancelled status
    const cancelledOrder = await Order.findOneAndUpdate(
      { $or: [{ orderId }, { _id: orderId }] },
      {
        status: "cancelled",
        $push: {
          statusHistory: {
            status: "cancelled",
            timestamp: new Date(),
            updatedBy: adminSession.adminId,
            notes: "Order cancelled by admin",
          },
        },
      },
      { new: true, lean: true }
    );

    if (!cancelledOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling order:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}