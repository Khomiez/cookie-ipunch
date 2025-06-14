// src/app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth, hasPermission } from "@/lib/adminAuth";
import stripe from "@/lib/stripe-server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

interface DashboardStats {
  totalCustomers: {
    value: number;
    change: string;
    changeType: "positive" | "negative";
    period: string;
  };
  totalRevenue: {
    value: number;
    change: string;
    changeType: "positive" | "negative";
    period: string;
    currency: string;
  };
  totalOrders: {
    value: number;
    change: string;
    changeType: "positive" | "negative";
    period: string;
  };
  earningsChart: Array<{
    month: string;
    revenue: number;
    orders: number;
    customers: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    category: string;
    sales: number;
    revenue: number;
    stock: "In Stock" | "Low Stock" | "Out of Stock";
    image: string;
  }>;
  topCountries: Array<{
    country: string;
    percentage: number;
    orders: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: "order" | "customer" | "product";
    description: string;
    timestamp: Date;
    value?: number;
  }>;
}

interface ProductDocument {
  _id: string;
  stripeProductId: string;
  inventory?: {
    enabled: boolean;
    stock: number;
    lowStockThreshold: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = await requireAdminAuth();

    if (!hasPermission(adminSession, "analytics")) {
      return NextResponse.json(
        { error: "Insufficient permissions to view dashboard" },
        { status: 403 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Get time ranges
    const now = new Date();
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
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Parallel data fetching
    const [
      totalCustomersCount,
      lastMonthCustomersCount,
      monthlyRevenue,
      lastMonthRevenue,
      monthlyOrders,
      lastMonthOrders,
      yearlyOrdersData,
      topProductsData,
      stripeCharges,
    ] = await Promise.all([
      // Total unique customers this month
      Order.distinct("customerDetails.email", {
        paymentStatus: "paid",
        createdAt: { $gte: startOfMonth },
      }),

      // Last month customers for comparison
      Order.distinct("customerDetails.email", {
        paymentStatus: "paid",
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),

      // This month revenue
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

      // This month orders
      Order.countDocuments({
        paymentStatus: "paid",
        createdAt: { $gte: startOfMonth },
      }),

      // Last month orders
      Order.countDocuments({
        paymentStatus: "paid",
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),

      // Yearly data for charts (monthly breakdown)
      Order.aggregate([
        {
          $match: {
            paymentStatus: "paid",
            createdAt: { $gte: startOfYear },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
            customers: { $addToSet: "$customerDetails.email" },
          },
        },
        {
          $project: {
            month: "$_id",
            revenue: 1,
            orders: 1,
            customers: { $size: "$customers" },
          },
        },
        { $sort: { month: 1 } },
      ]),

      // Top products analysis
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            name: { $first: "$items.name" },
            category: { $first: "$items.tag" },
            totalSales: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
            image: { $first: "$items.image" },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]),

      // Get Stripe charges for additional revenue validation
      fetchStripeCharges(),
    ]);

    // Calculate percentage changes
    const customerChange = calculatePercentageChange(
      totalCustomersCount.length,
      lastMonthCustomersCount.length
    );

    const revenueChange = calculatePercentageChange(
      monthlyRevenue[0]?.total || 0,
      lastMonthRevenue[0]?.total || 0
    );

    const ordersChange = calculatePercentageChange(
      monthlyOrders,
      lastMonthOrders
    );

    // Format earnings chart data
    const monthNames = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    const earningsChart = monthNames.map((monthName, index) => {
      const monthData = yearlyOrdersData.find((d) => d.month === index + 1);
      return {
        month: monthName,
        revenue: monthData?.revenue || 0,
        orders: monthData?.orders || 0,
        customers: monthData?.customers || 0,
      };
    });

    // Format top products
    const topProducts = await Promise.all(
      topProductsData.map(async (product) => {
        // Get current stock status from Product model
        const productDoc = await Product.findOne({
          stripeProductId: product._id,
        }).lean() as ProductDocument | null;

        let stockStatus: "In Stock" | "Low Stock" | "Out of Stock" = "In Stock";

        if (productDoc?.inventory?.enabled) {
          if (productDoc.inventory.stock === 0) {
            stockStatus = "Out of Stock";
          } else if (
            productDoc.inventory.stock <= productDoc.inventory.lowStockThreshold
          ) {
            stockStatus = "Low Stock";
          }
        }

        return {
          id: product._id,
          name: product.name,
          category: product.category || "General",
          sales: product.totalSales,
          revenue: product.totalRevenue,
          stock: stockStatus,
          image: getProductEmoji(product.category || product.name),
        };
      })
    );

    // Mock top countries data (you can enhance this with real geolocation data)
    const topCountries = [
      {
        country: "Thailand",
        percentage: 65.2,
        orders: monthlyOrders * 0.652,
        revenue: (monthlyRevenue[0]?.total || 0) * 0.652,
      },
      {
        country: "Singapore",
        percentage: 18.3,
        orders: monthlyOrders * 0.183,
        revenue: (monthlyRevenue[0]?.total || 0) * 0.183,
      },
      {
        country: "Malaysia",
        percentage: 11.1,
        orders: monthlyOrders * 0.111,
        revenue: (monthlyRevenue[0]?.total || 0) * 0.111,
      },
      {
        country: "Others",
        percentage: 5.4,
        orders: monthlyOrders * 0.054,
        revenue: (monthlyRevenue[0]?.total || 0) * 0.054,
      },
    ];

    // Get recent activity
    const recentOrders = await Order.find({ paymentStatus: "paid" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentActivity = recentOrders.map((order) => ({
      id: order.orderId,
      type: "order" as const,
      description: `New order from ${order.customerDetails.name}`,
      timestamp: order.createdAt,
      value: order.total,
    }));

    const dashboardStats: DashboardStats = {
      totalCustomers: {
        value: totalCustomersCount.length,
        change: customerChange.percentage,
        changeType: customerChange.type,
        period: "This month",
      },
      totalRevenue: {
        value: monthlyRevenue[0]?.total || 0,
        change: revenueChange.percentage,
        changeType: revenueChange.type,
        period: "This month",
        currency: "THB",
      },
      totalOrders: {
        value: monthlyOrders,
        change: ordersChange.percentage,
        changeType: ordersChange.type,
        period: "This month",
      },
      earningsChart,
      topProducts,
      topCountries,
      recentActivity,
    };

    return NextResponse.json({
      success: true,
      data: dashboardStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

// Helper functions
function calculatePercentageChange(
  current: number,
  previous: number
): {
  percentage: string;
  type: "positive" | "negative";
} {
  if (previous === 0) {
    return {
      percentage: current > 0 ? "+100%" : "0%",
      type: current > 0 ? "positive" : "negative",
    };
  }

  const change = ((current - previous) / previous) * 100;
  const isPositive = change >= 0;

  return {
    percentage: `${isPositive ? "+" : ""}${change.toFixed(1)}%`,
    type: isPositive ? "positive" : "negative",
  };
}

async function fetchStripeCharges() {
  try {
    const charges = await stripe.charges.list({
      limit: 100,
      created: {
        gte: Math.floor(
          new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1
          ).getTime() / 1000
        ),
      },
    });
    return charges.data;
  } catch (error) {
    console.warn("Failed to fetch Stripe charges:", error);
    return [];
  }
}

function getProductEmoji(categoryOrName: string): string {
  const lower = categoryOrName.toLowerCase();
  if (lower.includes("chocolate") || lower.includes("brownie")) return "🍫";
  if (lower.includes("cupcake") || lower.includes("muffin")) return "🧁";
  if (lower.includes("cookie")) return "🍪";
  if (lower.includes("cake")) return "🎂";
  if (lower.includes("donut")) return "🍩";
  if (lower.includes("bread")) return "🍞";
  return "🍪"; // default
}

// Optional: Add caching for better performance
export const revalidate = 300; // Cache for 5 minutes