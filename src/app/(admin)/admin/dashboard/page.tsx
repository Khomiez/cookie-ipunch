// src/app/(admin)/admin/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Calendar,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  Plus,
  Eye,
  Filter,
  Download,
  BarChart3,
  Cookie,
  Truck,
  Store,
  Heart,
  Star,
  ArrowUp,
  ArrowDown
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const session = sessionStorage.getItem("fatsprinkle_admin_session");
      if (!session) {
        router.push("/admin/login");
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("fatsprinkle_admin_session");
    router.push("/admin/login");
  };

  // Compact stats data
  const stats = [
    {
      title: "Orders",
      value: "156",
      change: "+12%",
      changeType: "positive",
      icon: ShoppingCart,
      color: "#7f6957",
      bgColor: "#eaf7ff",
      period: "this month"
    },
    {
      title: "Revenue",
      value: "15.2K",
      change: "+8.2%",
      changeType: "positive",
      icon: DollarSign,
      color: "#16a34a",
      bgColor: "#dcfce7",
      period: "THB"
    },
    {
      title: "Products",
      value: "24",
      change: "+2",
      changeType: "positive",
      icon: Package,
      color: "#ea580c",
      bgColor: "#fed7aa",
      period: "active"
    },
    {
      title: "Customers",
      value: "89",
      change: "+15%",
      changeType: "positive",
      icon: Users,
      color: "#7c3aed",
      bgColor: "#e9d5ff",
      period: "total"
    }
  ];

  const recentOrders = [
    {
      id: "FS250604001",
      customer: "Siriporn K.",
      items: "3 cookies",
      total: "147.-",
      status: "confirmed",
      method: "pickup",
      time: "2h ago"
    },
    {
      id: "FS250604002",
      customer: "Thanawat S.",
      items: "5 cookies",
      total: "245.-",
      status: "preparing",
      method: "shipping",
      time: "4h ago"
    },
    {
      id: "FS250604003",
      customer: "Nuttaporn L.",
      items: "2 cookies",
      total: "98.-",
      status: "ready",
      method: "pickup",
      time: "6h ago"
    },
    {
      id: "FS250604004",
      customer: "Apinya M.",
      items: "4 cookies",
      total: "196.-",
      status: "delivered",
      method: "shipping",
      time: "1d ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "text-blue-600 bg-blue-50";
      case "preparing": return "text-orange-600 bg-orange-50";
      case "ready": return "text-green-600 bg-green-50";
      case "delivered": return "text-gray-600 bg-gray-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const quickActions = [
    { icon: Package, label: "Products", color: "#7f6957", bgColor: "#eaf7ff" },
    { icon: ShoppingCart, label: "Orders", color: "#7f6957", bgColor: "#eaf7ff" },
    { icon: BarChart3, label: "Analytics", color: "#7f6957", bgColor: "#eaf7ff" },
    { icon: Users, label: "Customers", color: "#7f6957", bgColor: "#eaf7ff" }
  ];

  if (isLoading || !isAuthenticated) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#f8f6f0" }}
      >
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7f6957]"></div>
          <span className="text-lg font-medium comic-text" style={{ color: "#7f6957" }}>
            {isLoading ? "Loading dashboard..." : "Redirecting..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f6f0" }}>
      {/* Cozy Header */}
      <header 
        className="border-b shadow-sm"
        style={{ 
          backgroundColor: "rgba(255, 255, 255, 0.95)", 
          borderColor: "rgba(127, 105, 87, 0.1)",
          backdropFilter: "blur(10px)"
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg relative"
                style={{ backgroundColor: "#7f6957" }}
              >
                <Cookie size={24} className="text-white" />
                <div 
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#eaf7ff" }}
                >
                  <span className="text-xs">✨</span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold comic-text" style={{ color: "#7f6957" }}>
                  fatsprinkle.co
                </h1>
                <p className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
                  Admin Dashboard
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                className="p-2 rounded-xl transition-colors"
                style={{ backgroundColor: "#eaf7ff" }}
              >
                <Bell size={18} style={{ color: "#7f6957" }} />
              </button>
              <button 
                className="p-2 rounded-xl transition-colors"
                style={{ backgroundColor: "#eaf7ff" }}
              >
                <Settings size={18} style={{ color: "#7f6957" }} />
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} className="text-red-500" />
                <span className="text-sm font-medium text-red-500 comic-text">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div 
            className="rounded-3xl p-6 shadow-sm border border-white/50"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: "#eaf7ff" }}
                >
                  <span className="text-3xl">🌅</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1 comic-text" style={{ color: "#7f6957" }}>
                    Good morning! 
                  </h2>
                  <p className="opacity-80 comic-text" style={{ color: "#7f6957" }}>
                    Your cookie shop is doing great today ✨
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl border-2 border-dashed hover:scale-105 transition-transform comic-text"
                  style={{ borderColor: "#7f6957", color: "#7f6957" }}
                >
                  <Plus size={16} />
                  <span>Add Product</span>
                </button>
                <button 
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white hover:scale-105 transition-transform comic-text"
                  style={{ backgroundColor: "#7f6957" }}
                >
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Compact Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="rounded-2xl p-4 shadow-sm border border-white/50 hover:shadow-md transition-all"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <stat.icon size={18} style={{ color: stat.color }} />
                  </div>
                  <div className="flex items-center space-x-1">
                    {stat.changeType === 'positive' ? (
                      <ArrowUp size={12} className="text-green-500" />
                    ) : (
                      <ArrowDown size={12} className="text-red-500" />
                    )}
                    <span 
                      className={`text-xs font-medium comic-text ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {stat.change}
                    </span>
                  </div>
                </div>
                <h3 className="text-xs font-medium opacity-75 mb-1 comic-text" style={{ color: "#7f6957" }}>
                  {stat.title}
                </h3>
                <p className="text-xl font-bold comic-text mb-1" style={{ color: "#7f6957" }}>
                  {stat.value}
                </p>
                <p className="text-xs opacity-60 comic-text" style={{ color: "#7f6957" }}>
                  {stat.period}
                </p>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div 
              className="lg:col-span-2 rounded-3xl p-6 shadow-sm border border-white/50"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#eaf7ff" }}
                  >
                    <ShoppingCart size={18} style={{ color: "#7f6957" }} />
                  </div>
                  <h3 className="text-lg font-bold comic-text" style={{ color: "#7f6957" }}>
                    Recent Orders
                  </h3>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Filter size={16} style={{ color: "#7f6957" }} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye size={16} style={{ color: "#7f6957" }} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-2xl border hover:shadow-sm transition-all"
                    style={{ backgroundColor: "#fefbdc", borderColor: "rgba(127, 105, 87, 0.1)" }}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: "#eaf7ff" }}
                      >
                        {order.method === 'pickup' ? (
                          <Store size={16} style={{ color: "#7f6957" }} />
                        ) : (
                          <Truck size={16} style={{ color: "#7f6957" }} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-sm comic-text" style={{ color: "#7f6957" }}>
                            {order.id}
                          </p>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full comic-text ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
                          {order.customer} • {order.items}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold comic-text" style={{ color: "#7f6957" }}>
                        {order.total}
                      </p>
                      <p className="text-xs opacity-75 comic-text" style={{ color: "#7f6957" }}>
                        {order.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <button 
                  className="text-sm font-medium hover:underline comic-text"
                  style={{ color: "#7f6957" }}
                >
                  View all orders →
                </button>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div 
                className="rounded-3xl p-6 shadow-sm border border-white/50"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#eaf7ff" }}
                  >
                    <Star size={18} style={{ color: "#7f6957" }} />
                  </div>
                  <h3 className="text-lg font-bold comic-text" style={{ color: "#7f6957" }}>
                    Quick Actions
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <button 
                      key={index}
                      className="flex flex-col items-center space-y-2 p-3 rounded-2xl hover:scale-105 transition-transform"
                      style={{ backgroundColor: action.bgColor }}
                    >
                      <action.icon size={20} style={{ color: action.color }} />
                      <span className="text-xs font-medium comic-text" style={{ color: action.color }}>
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Today's Summary */}
              <div 
                className="rounded-3xl p-6 shadow-sm border border-white/50"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "#eaf7ff" }}
                  >
                    <BarChart3 size={18} style={{ color: "#7f6957" }} />
                  </div>
                  <h3 className="text-lg font-bold comic-text" style={{ color: "#7f6957" }}>
                    Today's Summary
                  </h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Orders Today", value: "8", icon: "📦" },
                    { label: "Revenue Today", value: "1,240.-", icon: "💰" },
                    { label: "Pickup Orders", value: "5", icon: "🏪" },
                    { label: "Delivery Orders", value: "3", icon: "🚚" }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm comic-text flex items-center space-x-2" style={{ color: "#7f6957" }}>
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <span className="font-bold comic-text" style={{ color: "#7f6957" }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Delivery Day */}
              <div 
                className="rounded-3xl p-6 shadow-sm border border-white/50"
                style={{ backgroundColor: "#eaf7ff" }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
                  >
                    <Calendar size={18} style={{ color: "#7f6957" }} />
                  </div>
                  <h3 className="text-lg font-bold comic-text" style={{ color: "#7f6957" }}>
                    Next Delivery
                  </h3>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold mb-2 comic-text" style={{ color: "#7f6957" }}>
                    Friday, June 6 🗓️
                  </p>
                  <p className="text-sm opacity-80 mb-4 comic-text" style={{ color: "#7f6957" }}>
                    12 orders ready for pickup/delivery
                  </p>
                  <button 
                    className="w-full py-3 rounded-2xl text-white font-medium hover:scale-105 transition-transform comic-text shadow-lg"
                    style={{ backgroundColor: "#7f6957" }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Prepare Orders</span>
                      <span>🍪</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Motivation Card */}
              <div 
                className="rounded-3xl p-6 shadow-sm border border-white/50 text-center"
                style={{ backgroundColor: "rgba(254, 243, 199, 0.8)" }}
              >
                <div className="mb-3">
                  <Heart size={24} style={{ color: "#7f6957" }} className="mx-auto" />
                </div>
                <p className="text-sm comic-text leading-relaxed" style={{ color: "#7f6957" }}>
                  "Every cookie tells a story of sweetness and joy! Keep spreading happiness! 🍪💕"
                </p>
                <div className="mt-3 flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={12} fill="#7f6957" style={{ color: "#7f6957" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}