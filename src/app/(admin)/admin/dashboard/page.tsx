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
  Store
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

  // Mock data for dashboard
  const stats = [
    {
      title: "Total Orders",
      value: "156",
      change: "+12%",
      changeType: "positive",
      icon: ShoppingCart,
      color: "#7f6957",
      bgColor: "#eaf7ff"
    },
    {
      title: "Revenue (THB)",
      value: "15,240",
      change: "+8.2%",
      changeType: "positive",
      icon: DollarSign,
      color: "#16a34a",
      bgColor: "#dcfce7"
    },
    {
      title: "Products",
      value: "24",
      change: "+2",
      changeType: "positive",
      icon: Package,
      color: "#ea580c",
      bgColor: "#fed7aa"
    },
    {
      title: "Customers",
      value: "89",
      change: "+15%",
      changeType: "positive",
      icon: Users,
      color: "#7c3aed",
      bgColor: "#e9d5ff"
    }
  ];

  const recentOrders = [
    {
      id: "FS250604001",
      customer: "Siriporn K.",
      items: "3 Chocolate Chip Cookies",
      total: "147.-",
      status: "confirmed",
      method: "pickup",
      time: "2 hours ago"
    },
    {
      id: "FS250604002",
      customer: "Thanawat S.",
      items: "5 Oatmeal Cookies",
      total: "245.-",
      status: "preparing",
      method: "shipping",
      time: "4 hours ago"
    },
    {
      id: "FS250604003",
      customer: "Nuttaporn L.",
      items: "2 White Chocolate Cookies",
      total: "98.-",
      status: "ready",
      method: "pickup",
      time: "6 hours ago"
    },
    {
      id: "FS250604004",
      customer: "Apinya M.",
      items: "4 Sugar Cookies",
      total: "196.-",
      status: "delivered",
      method: "shipping",
      time: "1 day ago"
    },
    {
      id: "FS250604005",
      customer: "Kamon P.",
      items: "6 Peanut Butter Cookies",
      total: "294.-",
      status: "confirmed",
      method: "pickup",
      time: "1 day ago"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "text-blue-600 bg-blue-100";
      case "preparing": return "text-orange-600 bg-orange-100";
      case "ready": return "text-green-600 bg-green-100";
      case "delivered": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "#fefbdc" }}
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
    <div className="min-h-screen" style={{ backgroundColor: "#fefbdc" }}>
      {/* Header */}
      <header 
        className="border-b shadow-sm"
        style={{ backgroundColor: "white", borderColor: "#7f6957" }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#7f6957" }}
              >
                <Cookie size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold comic-text" style={{ color: "#7f6957" }}>
                  fatsprinkle.co Admin
                </h1>
                <p className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
                  Dashboard Overview
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg hover:bg-[#eaf7ff] transition-colors">
                <Bell size={20} style={{ color: "#7f6957" }} />
              </button>
              <button className="p-2 rounded-lg hover:bg-[#eaf7ff] transition-colors">
                <Settings size={20} style={{ color: "#7f6957" }} />
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} className="text-red-600" />
                <span className="text-sm font-medium text-red-600 comic-text">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2 comic-text" style={{ color: "#7f6957" }}>
                  Good morning! 🌅
                </h2>
                <p className="opacity-75 comic-text" style={{ color: "#7f6957" }}>
                  Here's what's happening with your cookie shop today.
                </p>
              </div>
              <div className="flex space-x-3">
                <button 
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-dashed hover:scale-105 transition-transform"
                  style={{ borderColor: "#7f6957", color: "#7f6957" }}
                >
                  <Plus size={16} />
                  <span className="font-medium comic-text">Add Product</span>
                </button>
                <button 
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white hover:scale-105 transition-transform"
                  style={{ backgroundColor: "#7f6957" }}
                >
                  <Download size={16} />
                  <span className="font-medium comic-text">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-white/50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: stat.bgColor }}
                  >
                    <stat.icon size={24} style={{ color: stat.color }} />
                  </div>
                  <span 
                    className={`text-sm font-medium px-2 py-1 rounded-full ${
                      stat.changeType === 'positive' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-sm font-medium opacity-75 mb-1 comic-text" style={{ color: "#7f6957" }}>
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold comic-text" style={{ color: "#7f6957" }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-white/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold comic-text" style={{ color: "#7f6957" }}>
                  Recent Orders 📋
                </h3>
                <div className="flex space-x-2">
                  <button className="p-2 rounded-lg hover:bg-[#eaf7ff] transition-colors">
                    <Filter size={16} style={{ color: "#7f6957" }} />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-[#eaf7ff] transition-colors">
                    <Eye size={16} style={{ color: "#7f6957" }} />
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div 
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-xl border hover:shadow-sm transition-shadow"
                    style={{ backgroundColor: "#fefbdc", borderColor: "#7f6957" }}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
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
                          <p className="font-bold text-sm comic-text" style={{ color: "#7f6957" }}>
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

            {/* Quick Actions & Analytics */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-white/50">
                <h3 className="text-lg font-bold mb-4 comic-text" style={{ color: "#7f6957" }}>
                  Quick Actions ⚡
                </h3>
                <div className="space-y-3">
                  <button 
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:scale-105 transition-transform"
                    style={{ backgroundColor: "#eaf7ff" }}
                  >
                    <Package size={16} style={{ color: "#7f6957" }} />
                    <span className="font-medium comic-text" style={{ color: "#7f6957" }}>
                      Manage Products
                    </span>
                  </button>
                  <button 
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:scale-105 transition-transform"
                    style={{ backgroundColor: "#eaf7ff" }}
                  >
                    <ShoppingCart size={16} style={{ color: "#7f6957" }} />
                    <span className="font-medium comic-text" style={{ color: "#7f6957" }}>
                      View Orders
                    </span>
                  </button>
                  <button 
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:scale-105 transition-transform"
                    style={{ backgroundColor: "#eaf7ff" }}
                  >
                    <BarChart3 size={16} style={{ color: "#7f6957" }} />
                    <span className="font-medium comic-text" style={{ color: "#7f6957" }}>
                      Analytics
                    </span>
                  </button>
                  <button 
                    className="w-full flex items-center space-x-3 p-3 rounded-xl hover:scale-105 transition-transform"
                    style={{ backgroundColor: "#eaf7ff" }}
                  >
                    <Users size={16} style={{ color: "#7f6957" }} />
                    <span className="font-medium comic-text" style={{ color: "#7f6957" }}>
                      Customers
                    </span>
                  </button>
                </div>
              </div>

              {/* Today's Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-white/50">
                <h3 className="text-lg font-bold mb-4 comic-text" style={{ color: "#7f6957" }}>
                  Today's Summary 📊
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm comic-text" style={{ color: "#7f6957" }}>
                      Orders Today
                    </span>
                    <span className="font-bold comic-text" style={{ color: "#7f6957" }}>
                      8
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm comic-text" style={{ color: "#7f6957" }}>
                      Revenue Today
                    </span>
                    <span className="font-bold comic-text" style={{ color: "#7f6957" }}>
                      1,240.-
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm comic-text" style={{ color: "#7f6957" }}>
                      Pickup Orders
                    </span>
                    <span className="font-bold comic-text" style={{ color: "#7f6957" }}>
                      5
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm comic-text" style={{ color: "#7f6957" }}>
                      Delivery Orders
                    </span>
                    <span className="font-bold comic-text" style={{ color: "#7f6957" }}>
                      3
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Delivery Day */}
              <div 
                className="rounded-2xl p-6 shadow-sm border border-white/50"
                style={{ backgroundColor: "#eaf7ff" }}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <Calendar size={20} style={{ color: "#7f6957" }} />
                  <h3 className="text-lg font-bold comic-text" style={{ color: "#7f6957" }}>
                    Next Delivery
                  </h3>
                </div>
                <p className="text-2xl font-bold mb-2 comic-text" style={{ color: "#7f6957" }}>
                  Friday, June 6
                </p>
                <p className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
                  12 orders ready for pickup/delivery
                </p>
                <button 
                  className="mt-4 w-full py-2 rounded-lg text-white font-medium hover:scale-105 transition-transform comic-text"
                  style={{ backgroundColor: "#7f6957" }}
                >
                  Prepare Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}