// src/app/(admin)/admin/dashboard/page.tsx - Final Updated Version with Real Data
"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingDown,
  Bell,
  Zap,
  Activity,
  BarChart3,
} from "lucide-react";
import { useAdminDashboardOrders } from "@/hooks/useAdminOrders";
import BakingSummarySection from "@/components/admin/BakingSummarySection";

// Types for real dashboard data
interface DashboardData {
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
  pendingOrders: {
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
  recentActivity: Array<{
    id: string;
    type: "order" | "customer" | "product";
    description: string;
    timestamp: Date;
    value?: number;
  }>;
  orderStatusBreakdown: Record<string, number>;
  paymentStatusBreakdown: Record<string, number>;
  deliveryMethodBreakdown: Record<string, number>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isStartingBaking, setIsStartingBaking] = useState(false);

  // Use the real orders hook
  const {
    orders,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
    updateOrderStatus,
    getStatusCounts,
    getTotalRevenue,
    getUniqueCustomers,
    getPendingOrders,
    getActiveOrders,
    getRecentOrders,
    startBakingAll,
    lastUpdated,
  } = useAdminDashboardOrders();

  // Authentication check
  useEffect(() => {
    const session = sessionStorage.getItem("fatsprinkle_admin_session");
    if (!session) {
      router.push("/admin/login");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsDashboardLoading(true);
      setDashboardError(null);

      const response = await fetch("/api/admin/dashboard");

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to load dashboard");
      }

      setDashboardData(result.data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardError(error instanceof Error ? error.message : "Failed to load dashboard");
    } finally {
      setIsDashboardLoading(false);
    }
  }, []);

  // Initial data fetch and auto-refresh setup
  useEffect(() => {
    if (!isAuthenticated) return;

    let intervalId: NodeJS.Timeout | null = null;

    // Initial fetch
    fetchDashboardData();

    // Set up auto-refresh every 5 minutes
    intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isAuthenticated, fetchDashboardData]);

  // Handle manual refresh
  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchDashboardData(), refetchOrders()]);
  }, [fetchDashboardData, refetchOrders]);

  // Handle "Start Baking All" orders
  const handleStartBakingAll = async () => {
    const pendingOrders = getPendingOrders();
    
    if (pendingOrders.length === 0) {
      alert("No pending orders to start baking");
      return;
    }

    const confirmMessage = `Are you sure you want to start baking ${pendingOrders.length} pending orders? This will move them to confirmed status.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsStartingBaking(true);
    
    try {
      await startBakingAll();
      
      // Refresh dashboard data after bulk update
      await fetchDashboardData();
      
      console.log(`${pendingOrders.length} orders moved to confirmed status`);
    } catch (error) {
      console.error("Error in bulk baking operation:", error);
      alert(error instanceof Error ? error.message : "Failed to start bulk baking. Please try again.");
    } finally {
      setIsStartingBaking(false);
    }
  };

  // Handle individual order status changes
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus as any, `Status updated to ${newStatus} by admin`);
      
      // Refresh dashboard data to get updated counts
      await fetchDashboardData();
      
      console.log(`Order ${orderId} status changed to: ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(error instanceof Error ? error.message : "Failed to update order status");
    }
  };

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

  if (dashboardError && !dashboardData) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f8f6f0" }}>
        <div className="flex items-center justify-center min-h-screen">
          <div
            className="max-w-md w-full p-6 rounded-3xl text-center shadow-lg"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2 comic-text" style={{ color: "#7f6957" }}>
              Dashboard Error
            </h2>
            <p className="text-sm mb-4 comic-text" style={{ color: "#7f6957" }}>
              {dashboardError}
            </p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 rounded-2xl text-white font-medium comic-text hover:scale-105 transition-transform"
              style={{ backgroundColor: "#7f6957" }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate key metrics from real data
  const pendingOrdersCount = getPendingOrders().length;
  const activeOrdersCount = getActiveOrders().length;
  const totalRevenue = getTotalRevenue();
  const uniqueCustomers = getUniqueCustomers();
  const statusCounts = getStatusCounts();
  const recentOrders = getRecentOrders(5);

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
      title: "View All Orders",
      description: "Manage orders and track their progress",
      icon: ShoppingCart,
      bgColor: "#fef3c7",
      action: () => console.log("Navigate to orders page"),
    },
    {
      title: "Analytics Dashboard",
      description: "Deep dive into sales and performance metrics",
      icon: BarChart3,
      bgColor: "#f0fdf4",
      action: () => console.log("Navigate to analytics"),
    },
  ];

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
              {/* Real-time status indicator */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${ordersError ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <span className="text-xs comic-text" style={{ color: "#7f6957" }}>
                    {ordersError ? 'Offline' : 'Live'}
                  </span>
                </div>
                {lastUpdated && (
                  <div className="text-xs comic-text opacity-75" style={{ color: "#7f6957" }}>
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                )}
              </div>

              {/* Notifications */}
              {pendingOrdersCount > 0 && (
                <div className="relative">
                  <button className="p-2 hover:bg-gray-100 rounded-xl">
                    <Bell size={20} style={{ color: "#7f6957" }} />
                  </button>
                  <div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: "#f59e0b" }}
                  >
                    {pendingOrdersCount}
                  </div>
                </div>
              )}

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isDashboardLoading || ordersLoading}
                className="p-2 hover:bg-gray-100 rounded-xl disabled:opacity-50"
                title="Refresh dashboard data"
              >
                <RefreshCw 
                  size={20} 
                  className={(isDashboardLoading || ordersLoading) ? 'animate-spin' : ''} 
                  style={{ color: "#7f6957" }} 
                />
              </button>

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
        {(isDashboardLoading && !dashboardData) || (ordersLoading && orders.length === 0) ? (
          // Loading skeleton
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards with Real Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Revenue */}
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
                      {(dashboardData?.totalRevenue.value || totalRevenue).toLocaleString()}.-
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
                  {(dashboardData?.totalRevenue.changeType || "positive") === "positive" ? (
                    <TrendingUp size={16} className="text-green-600 mr-1" />
                  ) : (
                    <TrendingDown size={16} className="text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    (dashboardData?.totalRevenue.changeType || "positive") === "positive" ? "text-green-600" : "text-red-600"
                  }`}>
                    {dashboardData?.totalRevenue.change || "+0%"}
                  </span>
                  <span
                    className="text-sm opacity-75 ml-2 comic-text"
                    style={{ color: "#7f6957" }}
                  >
                    {dashboardData?.totalRevenue.period || "vs last month"}
                  </span>
                </div>
              </div>

              {/* Total Orders */}
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
                      {dashboardData?.totalOrders.value || orders.length}
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
                  {(dashboardData?.totalOrders.changeType || "positive") === "positive" ? (
                    <TrendingUp size={16} className="text-green-600 mr-1" />
                  ) : (
                    <TrendingDown size={16} className="text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    (dashboardData?.totalOrders.changeType || "positive") === "positive" ? "text-green-600" : "text-red-600"
                  }`}>
                    {dashboardData?.totalOrders.change || "+0%"}
                  </span>
                  <span
                    className="text-sm opacity-75 ml-2 comic-text"
                    style={{ color: "#7f6957" }}
                  >
                    {dashboardData?.totalOrders.period || "vs last month"}
                  </span>
                </div>
              </div>

              {/* Customers */}
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
                      {dashboardData?.totalCustomers.value || uniqueCustomers}
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
                    Happy customers! 💕
                  </span>
                </div>
              </div>

              {/* Pending Orders */}
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
                      Pending Orders
                    </p>
                    <p
                      className="text-2xl font-bold mt-2 comic-text"
                      style={{ color: "#7f6957" }}
                    >
                      {pendingOrdersCount}
                    </p>
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#fef2f2" }}
                  >
                    <Clock size={24} style={{ color: "#7f6957" }} />
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

            {/* Baking Summary Section with Real Data */}
            <BakingSummarySection 
              orders={orders} 
              onStartBaking={handleStartBakingAll}
              isProcessing={isStartingBaking}
            />

            {/* Top Products Section */}
            {dashboardData?.topProducts && dashboardData.topProducts.length > 0 && (
              <div
                className="rounded-2xl p-6 mb-8 shadow-sm border border-white/50"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              >
                <h3
                  className="text-lg font-bold mb-4 comic-text"
                  style={{ color: "#7f6957" }}
                >
                  Top Selling Products 🌟
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardData.topProducts.slice(0, 6).map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-3 p-3 rounded-xl border"
                      style={{
                        backgroundColor: index === 0 ? "#eaf7ff" : "#fefbdc",
                        borderColor: index === 0 ? "#7f6957" : "#e5e7eb",
                        borderWidth: index === 0 ? "2px" : "1px",
                      }}
                    >
                      <div className="text-2xl">{product.image}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4
                            className="text-sm font-bold comic-text truncate"
                            style={{ color: "#7f6957" }}
                            title={product.name}
                          >
                            {product.name}
                          </h4>
                          {index === 0 && (
                            <div
                              className="px-1 py-0.5 rounded text-xs font-bold"
                              style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
                            >
                              #1
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className="text-xs opacity-75 comic-text"
                            style={{ color: "#7f6957" }}
                          >
                            {product.sales} sold
                          </span>
                          <div
                            className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: "#7f6957" }}
                          >
                            {product.revenue.toLocaleString()}.-
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity with Real Data */}
            {recentOrders.length > 0 && (
              <div
                className="rounded-2xl p-6 mb-8 shadow-sm border border-white/50"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className="text-lg font-bold comic-text"
                    style={{ color: "#7f6957" }}
                  >
                    Recent Activity 📈
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Activity size={16} style={{ color: "#7f6957" }} />
                    <span className="text-sm comic-text" style={{ color: "#7f6957" }}>
                      Live updates
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ backgroundColor: "#fefbdc" }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: "#eaf7ff" }}
                        >
                          <ShoppingCart size={16} style={{ color: "#7f6957" }} />
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium comic-text"
                            style={{ color: "#7f6957" }}
                          >
                            New order from {order.customerName}
                          </p>
                          <p
                            className="text-xs opacity-75 comic-text"
                            style={{ color: "#7f6957" }}
                          >
                            {order.createdAt.toLocaleString()} • Order #{order.id}
                          </p>
                        </div>
                      </div>
                      <div
                        className="text-sm font-bold comic-text"
                        style={{ color: "#7f6957" }}
                      >
                        {order.total.toLocaleString()}.-
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Status Breakdown with Real Data */}
            {Object.keys(statusCounts).length > 0 && (
              <div
                className="rounded-2xl p-6 mb-8 shadow-sm border border-white/50"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              >
                <h3
                  className="text-lg font-bold mb-4 comic-text"
                  style={{ color: "#7f6957" }}
                >
                  Order Status Overview 📊
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div
                      key={status}
                      className="text-center p-4 rounded-xl"
                      style={{ backgroundColor: "#fefbdc" }}
                    >
                      <div
                        className="text-2xl font-bold comic-text"
                        style={{ color: "#7f6957" }}
                      >
                        {count}
                      </div>
                      <div
                        className="text-sm capitalize comic-text opacity-75"
                        style={{ color: "#7f6957" }}
                      >
                        {status.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          </>
        )}
      </main>
    </div>
  );
}