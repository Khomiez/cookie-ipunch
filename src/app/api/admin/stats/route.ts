// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";

// Helper function to check admin authentication
async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("fatsprinkle_admin_session");
  return !!adminSession?.value;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to database
    await connectToDatabase();

    // Get current date ranges
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59
    );

    // Fetch orders data
    const [
      totalOrders,
      todayOrders,
      monthlyOrders,
      lastMonthOrders,
      totalRevenue,
      monthlyRevenue,
      lastMonthRevenue,
      recentOrders,
    ] = await Promise.all([
      // Total orders count
      Order.countDocuments({ paymentStatus: "paid" }),

      // Today's orders
      Order.countDocuments({
        paymentStatus: "paid",
        createdAt: { $gte: startOfToday },
      }),

      // This month's orders
      Order.countDocuments({
        paymentStatus: "paid",
        createdAt: { $gte: startOfMonth },
      }),

      // Last month's orders
      Order.countDocuments({
        paymentStatus: "paid",
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),

      // Total revenue
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),

      // Monthly revenue
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),

      // Last month revenue
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),

      // Recent orders (last 10)
      Order.find({ paymentStatus: "paid" })
        .sort({ createdAt: -1 })
        .limit(10)
        .select(
          "orderId customerDetails.name items total status deliveryMethod createdAt"
        ),
    ]);

    // Calculate growth percentages
    const orderGrowth =
      lastMonthOrders > 0
        ? (((monthlyOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(
            1
          )
        : "0";

    const revenueGrowth =
      lastMonthRevenue[0]?.total > 0
        ? (
            ((monthlyRevenue[0]?.total - lastMonthRevenue[0]?.total) /
              lastMonthRevenue[0]?.total) *
            100
          ).toFixed(1)
        : "0";

    // Format recent orders
    const formattedRecentOrders = recentOrders.map((order) => {
      const itemsCount = order.items.reduce(
        (sum: number, item: any) => sum + item.quantity,
        0
      );
      const timeAgo = getTimeAgo(order.createdAt);

      return {
        id: order.orderId,
        customer: order.customerDetails.name,
        items: `${itemsCount} ${itemsCount === 1 ? "cookie" : "cookies"}`,
        total: `${order.total}.-`,
        status: order.status,
        method: order.deliveryMethod,
        time: timeAgo,
      };
    });

    // Get unique customers count (simplified - in production, you might want a separate customers collection)
    const uniqueCustomers = await Order.distinct("customerDetails.email", {
      paymentStatus: "paid",
    });

    const stats = {
      totalOrders: totalOrders,
      orderGrowth: `${Number(orderGrowth) >= 0 ? "+" : ""}${orderGrowth}%`,
      totalRevenue: totalRevenue[0]?.total || 0,
      revenueGrowth: `${Number(revenueGrowth) >= 0 ? "+" : ""}${revenueGrowth}%`,
      totalCustomers: uniqueCustomers.length,
      todayOrders: todayOrders,
      todayRevenue: 0, // You can calculate this if needed
      pickupOrders: 0, // You can calculate this if needed
      deliveryOrders: 0, // You can calculate this if needed
      recentOrders: formattedRecentOrders,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
}
