// src/app/(admin)/admin/dashboard/page.tsx - Updated with New Workflow
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Cookie,
  Heart,
  LogOut,
  Calendar,
  Star,
  ChevronRight,
  Truck,
  MessageSquare,
} from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import BakingSummarySection from "@/components/admin/BakingSummarySection";
import EnhancedOrdersTableUpdated from "@/components/admin/EnhancedOrdersTableUpdated";

// Updated mock data with new status system
const mockOrdersData: Order[] = [
  {
    id: "FS250614001",
    customerName: "Emma Thompson",
    email: "emma@example.com",
    items: [
      {
        productId: "1",
        name: "Chocolate Chip Cookies",
        quantity: 2,
        price: 45,
      },
      {
        productId: "2",
        name: "Double Chocolate Brownies",
        quantity: 6,
        price: 60,
      },
    ],
    total: 105,
    status: "pending",
    deliveryMethod: "pickup",
    createdAt: new Date("2025-06-14T09:30:00"),
    deliveryDate: new Date("2025-06-18T14:00:00"),
  },
  {
    id: "FS250614002",
    customerName: "James Wilson",
    email: "james@example.com",
    items: [
      {
        productId: "1",
        name: "Chocolate Chip Cookies",
        quantity: 2,
        price: 80,
      },
      { productId: "3", name: "Vanilla Sugar Cookies", quantity: 1, price: 40 },
    ],
    total: 120,
    status: "pending",
    deliveryMethod: "shipping",
    createdAt: new Date("2025-06-13T15:45:00"),
    deliveryDate: new Date("2025-06-18T14:00:00"),
  },
  {
    id: "FS250614003",
    customerName: "Sophie Chen",
    email: "sophie@example.com",
    items: [
      {
        productId: "1",
        name: "Chocolate Chip Cookies",
        quantity: 1,
        price: 45,
      },
      {
        productId: "2",
        name: "Double Chocolate Brownies",
        quantity: 1,
        price: 60,
      },
      { productId: "4", name: "Red Velvet Cupcakes", quantity: 8, price: 85 },
    ],
    total: 125,
    status: "baking",
    deliveryMethod: "pickup",
    createdAt: new Date("2025-06-12T11:20:00"),
    deliveryDate: new Date("2025-06-18T14:00:00"),
  },
  {
    id: "FS250614004",
    customerName: "Mike Rodriguez",
    email: "mike@example.com",
    items: [
      {
        productId: "5",
        name: "Oatmeal Raisin Cookies",
        quantity: 12,
        price: 65,
      },
    ],
    total: 105,
    status: "ready",
    deliveryMethod: "shipping",
    createdAt: new Date("2025-06-11T16:30:00"),
    deliveryDate: new Date("2025-06-15T14:00:00"),
  },
  {
    id: "FS250614005",
    customerName: "Lisa Park",
    email: "lisa@example.com",
    items: [
      { productId: "3", name: "Vanilla Sugar Cookies", quantity: 6, price: 40 },
    ],
    total: 80,
    status: "packed",
    deliveryMethod: "pickup",
    createdAt: new Date("2025-06-11T14:20:00"),
    deliveryDate: new Date("2025-06-18T14:00:00"),
  },
  {
    id: "FS250614006",
    customerName: "David Kim",
    email: "david@example.com",
    items: [
      { productId: "6", name: "Snickerdoodles", quantity: 10, price: 50 },
    ],
    total: 90,
    status: "delivered",
    deliveryMethod: "shipping",
    createdAt: new Date("2025-06-10T16:30:00"),
    deliveryDate: new Date("2025-06-15T14:00:00"),
  },
];

const mockRevenueData = [
  { day: "Mon", revenue: 850, orders: 8 },
  { day: "Tue", revenue: 1200, orders: 12 },
  { day: "Wed", revenue: 950, orders: 9 },
  { day: "Thu", revenue: 1450, orders: 15 },
  { day: "Fri", revenue: 1800, orders: 18 },
  { day: "Sat", revenue: 2100, orders: 21 },
  { day: "Sun", revenue: 1650, orders: 16 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>(mockOrdersData);
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");

  // Authentication check
  useEffect(() => {
    const session = sessionStorage.getItem("fatsprinkle_admin_session");
    if (!session) {
      router.push("/admin/login");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // Handle individual order status changes
  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              statusHistory: [
                ...(order.statusHistory || []),
                {
                  status: newStatus,
                  timestamp: new Date(),
                  updatedBy: "admin", // In real app, get from session
                },
              ],
            }
          : order
      )
    );

    console.log(`Order ${orderId} status changed to: ${newStatus}`);
  };

  // Handle "Bake All" - move all pending orders to baking status
  const handleBakeAllOrders = () => {
    setOrders((prev) =>
      prev.map((order) =>
        order.status === "pending"
          ? {
              ...order,
              status: "baking" as OrderStatus,
              statusHistory: [
                ...(order.statusHistory || []),
                {
                  status: "baking" as OrderStatus,
                  timestamp: new Date(),
                  updatedBy: "admin-bulk-action",
                },
              ],
            }
          : order
      )
    );

    console.log("All pending orders moved to baking status");
  };

  // Handle order viewing
  const handleViewOrder = (orderId: string) => {
    console.log(`View order details: ${orderId}`);
    // In real app, navigate to order detail page
    // router.push(`/admin/orders/${orderId}`);
  };

  // Calculate stats
  const totalRevenue = mockRevenueData.reduce(
    (sum, day) => sum + day.revenue,
    0
  );
  const totalOrders = orders.length;
  const totalCustomers = new Set(orders.map((order) => order.email)).size;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const activeBakingOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "baking"
  ).length;

  // Order status distribution
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/login", { method: "DELETE" });
      sessionStorage.removeItem("fatsprinkle_admin_session");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/admin/login");
    }
  };

  // Quick actions data
  const quickActions = [
    {
      title: "Manage Products",
      description: "Add, edit, or remove cookies from your menu",
      icon: Package,
      bgColor: "#eaf7ff",
      action: () => router.push("/admin/products"),
    },
    {
      title: "Delivery Schedule",
      description: "Plan your baking and delivery dates",
      icon: Calendar,
      bgColor: "#fef3c7",
      action: () => console.log("Navigate to delivery schedule"),
    },
    {
      title: "Customer Reviews",
      description: "See what customers love about your cookies",
      icon: Star,
      bgColor: "#f0fdf4",
      action: () => console.log("Navigate to customer reviews"),
    },
  ];

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f8f6f0" }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7f6957]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f6f0" }}>
      {/* Header */}
      <header
        className="border-b shadow-sm"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderColor: "rgba(127, 105, 87, 0.1)",
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: "#7f6957" }}
                >
                  <Cookie size={24} className="text-white" />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold comic-text"
                    style={{ color: "#7f6957" }}
                  >
                    fatsprinkle.co
                  </h1>
                  <p
                    className="text-sm opacity-75 comic-text"
                    style={{ color: "#7f6957" }}
                  >
                    Admin Dashboard
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div
                    className="text-lg font-bold comic-text"
                    style={{ color: "#7f6957" }}
                  >
                    {totalRevenue.toLocaleString()}.-
                  </div>
                  <div
                    className="text-xs opacity-75 comic-text"
                    style={{ color: "#7f6957" }}
                  >
                    Week Revenue
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-lg font-bold comic-text"
                    style={{ color: "#7f6957" }}
                  >
                    {pendingOrders}
                  </div>
                  <div
                    className="text-xs opacity-75 comic-text"
                    style={{ color: "#7f6957" }}
                  >
                    Pending Orders
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push("/admin/products")}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white font-medium comic-text hover:scale-105 transition-transform"
                style={{ backgroundColor: "#7f6957" }}
              >
                <Package size={16} />
                <span>Products</span>
              </button>

              <button
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded-xl"
                title="Logout"
              >
                <LogOut size={20} style={{ color: "#7f6957" }} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            className="rounded-2xl p-6 shadow-sm border border-white/50"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium opacity-75 comic-text"
                  style={{ color: "#7f6957" }}
                >
                  Total Revenue
                </p>
                <p
                  className="text-2xl font-bold mt-2 comic-text"
                  style={{ color: "#7f6957" }}
                >
                  {totalRevenue.toLocaleString()}.-
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#eaf7ff" }}
              >
                <DollarSign size={24} style={{ color: "#7f6957" }} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp size={16} className="text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">+12.5%</span>
              <span
                className="text-sm opacity-75 ml-2 comic-text"
                style={{ color: "#7f6957" }}
              >
                vs last week
              </span>
            </div>
          </div>

          <div
            className="rounded-2xl p-6 shadow-sm border border-white/50"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium opacity-75 comic-text"
                  style={{ color: "#7f6957" }}
                >
                  Total Orders
                </p>
                <p
                  className="text-2xl font-bold mt-2 comic-text"
                  style={{ color: "#7f6957" }}
                >
                  {totalOrders}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#fef3c7" }}
              >
                <ShoppingCart size={24} style={{ color: "#7f6957" }} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <TrendingUp size={16} className="text-green-600 mr-1" />
              <span className="text-sm font-medium text-green-600">+8.2%</span>
              <span
                className="text-sm opacity-75 ml-2 comic-text"
                style={{ color: "#7f6957" }}
              >
                vs last week
              </span>
            </div>
          </div>

          <div
            className="rounded-2xl p-6 shadow-sm border border-white/50"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium opacity-75 comic-text"
                  style={{ color: "#7f6957" }}
                >
                  Customers
                </p>
                <p
                  className="text-2xl font-bold mt-2 comic-text"
                  style={{ color: "#7f6957" }}
                >
                  {totalCustomers}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#f0fdf4" }}
              >
                <Users size={24} style={{ color: "#7f6957" }} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <Heart size={16} className="text-pink-600 mr-1" />
              <span
                className="text-sm font-medium comic-text"
                style={{ color: "#7f6957" }}
              >
                Happy customers!
              </span>
            </div>
          </div>

          <div
            className="rounded-2xl p-6 shadow-sm border border-white/50"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className="text-sm font-medium opacity-75 comic-text"
                  style={{ color: "#7f6957" }}
                >
                  Active Orders
                </p>
                <p
                  className="text-2xl font-bold mt-2 comic-text"
                  style={{ color: "#7f6957" }}
                >
                  {activeBakingOrders}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#fef2f2" }}
              >
                <Cookie size={24} style={{ color: "#7f6957" }} />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span
                className="text-sm font-medium comic-text"
                style={{ color: "#7f6957" }}
              >
                🔥 Ready to bake!
              </span>
            </div>
          </div>
        </div>

        {/* Baking Summary Section (Read-only) */}
        <BakingSummarySection orders={orders} />

        {/* Enhanced Orders Table with Bake All Button */}
        <EnhancedOrdersTableUpdated
          orders={orders}
          onOrderStatusChange={handleOrderStatusChange}
          onBakeAllOrders={handleBakeAllOrders}
          onViewOrder={handleViewOrder}
        />

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className="rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-all cursor-pointer group"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              onClick={action.action}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: action.bgColor }}
                >
                  <action.icon size={24} style={{ color: "#7f6957" }} />
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={20} style={{ color: "#7f6957" }} />
                </div>
              </div>
              <h3
                className="text-lg font-bold mb-2 comic-text"
                style={{ color: "#7f6957" }}
              >
                {action.title}
              </h3>
              <p
                className="text-sm opacity-75 comic-text"
                style={{ color: "#7f6957" }}
              >
                {action.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}