// src/app/(admin)/admin/dashboard/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  RefreshCw,
  Eye,
  Edit3,
  Trash2,
  Cookie,
  TrendingUp,
  Calendar,
  ChefHat,
  Star,
  Heart,
  Settings,
  LogOut
} from "lucide-react";

// Mock Data - Replace with real API calls later
const mockOrdersData = [
  {
    id: "FS250614001",
    customerName: "Emma Thompson",
    email: "emma@example.com",
    items: [
      { name: "Chocolate Chip Cookies", quantity: 2, price: 45 },
      { name: "Double Chocolate Brownies", quantity: 6, price: 60 }
    ],
    total: 105,
    status: "pending",
    deliveryMethod: "pickup",
    createdAt: new Date("2025-06-14T09:30:00"),
    deliveryDate: new Date("2025-06-18T14:00:00")
  },
  {
    id: "FS250614002", 
    customerName: "James Wilson",
    email: "james@example.com",
    items: [
      { name: "Chocolate Chip Cookies", quantity: 2, price: 80 },
      { name: "Double Chocolate Brownies", quantity: 1, price: 60 }
    ],
    total: 120,
    status: "pending",
    deliveryMethod: "shipping",
    createdAt: new Date("2025-06-13T15:45:00"),
    deliveryDate: new Date("2025-06-18T14:00:00")
  },
  {
    id: "FS250614003",
    customerName: "Sophie Chen", 
    email: "sophie@example.com",
    items: [
      { name: "Chocolate Chip Cookies", quantity: 1, price: 45 },
      { name: "Double Chocolate Brownies", quantity: 1, price: 60 },
      { name: "Red Velvet Cupcakes", quantity: 8, price: 85 }
    ],
    total: 125,
    status: "pending",
    deliveryMethod: "pickup",
    createdAt: new Date("2025-06-12T11:20:00"),
    deliveryDate: new Date("2025-06-18T14:00:00")
  },
  {
    id: "FS250614004",
    customerName: "Mike Rodriguez",
    email: "mike@example.com", 
    items: [
      { name: "Oatmeal Raisin Cookies", quantity: 12, price: 65 }
    ],
    total: 105,
    status: "pending",
    deliveryMethod: "shipping",
    createdAt: new Date("2025-06-11T16:30:00"),
    deliveryDate: new Date("2025-06-15T14:00:00")
  },
  {
    id: "FS250614005",
    customerName: "Lisa Park",
    email: "lisa@example.com", 
    items: [
      { name: "Vanilla Sugar Cookies", quantity: 6, price: 40 }
    ],
    total: 80,
    status: "baking",
    deliveryMethod: "pickup",
    createdAt: new Date("2025-06-11T14:20:00"),
    deliveryDate: new Date("2025-06-18T14:00:00")
  },
  {
    id: "FS250614006",
    customerName: "David Kim",
    email: "david@example.com", 
    items: [
      { name: "Snickerdoodles", quantity: 10, price: 50 }
    ],
    total: 90,
    status: "delivered",
    deliveryMethod: "shipping",
    createdAt: new Date("2025-06-10T16:30:00"),
    deliveryDate: new Date("2025-06-15T14:00:00")
  }
];

const mockRevenueData = [
  { day: "Mon", revenue: 850, orders: 8 },
  { day: "Tue", revenue: 1200, orders: 12 },
  { day: "Wed", revenue: 950, orders: 9 },
  { day: "Thu", revenue: 1450, orders: 15 },
  { day: "Fri", revenue: 1800, orders: 18 },
  { day: "Sat", revenue: 2100, orders: 21 },
  { day: "Sun", revenue: 1650, orders: 16 }
];

const mockProducts = [
  {
    id: "1",
    name: "Chocolate Chip Cookies",
    price: 45,
    stock: "in_stock",
    image: "🍪",
    orders: 24
  },
  {
    id: "2", 
    name: "Double Chocolate Brownies",
    price: 60,
    stock: "low_stock",
    image: "🧁",
    orders: 18
  },
  {
    id: "3",
    name: "Vanilla Sugar Cookies", 
    price: 40,
    stock: "in_stock",
    image: "🍪",
    orders: 15
  }
];

// Helper function to get emoji for cookie types
const getProductEmoji = (productName: string) => {
  const name = productName.toLowerCase();
  if (name.includes('chocolate chip')) return '🍪';
  if (name.includes('brownie') || name.includes('chocolate')) return '🧁';
  if (name.includes('vanilla') || name.includes('sugar')) return '🍪';
  if (name.includes('cupcake') || name.includes('velvet')) return '🧁';
  if (name.includes('oatmeal') || name.includes('raisin')) return '🍪';
  if (name.includes('snickerdoodle')) return '🍪';
  return '🍪'; // default cookie emoji
};

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Authentication check
  useEffect(() => {
    const session = sessionStorage.getItem("fatsprinkle_admin_session");
    if (!session) {
      router.push("/admin/login");
      return;
    }
    setIsAuthenticated(true);
  }, [router]);

  // Calculate aggregated baking quantities from ALL current orders (pending + baking)
  const calculateBakingList = () => {
    return mockOrdersData
      .filter(order => order.status === 'pending' || order.status === 'baking')
      .reduce((acc, order) => {
        order.items.forEach(item => {
          if (acc[item.name]) {
            acc[item.name].quantity += item.quantity;
            acc[item.name].orders += 1;
            acc[item.name].orderIds.push(order.id);
            acc[item.name].customerNames.push(order.customerName);
          } else {
            acc[item.name] = {
              quantity: item.quantity,
              orders: 1,
              emoji: getProductEmoji(item.name),
              orderIds: [order.id],
              customerNames: [order.customerName],
              completed: false
            };
          }
        });
        return acc;
      }, {} as Record<string, { 
        quantity: number; 
        orders: number; 
        emoji: string; 
        orderIds: string[]; 
        customerNames: string[];
        completed: boolean 
      }>);
  };

  // Calculate stats
  const bakingQueue = calculateBakingList();
  const totalBakingItems = Object.values(bakingQueue).reduce((sum, item) => sum + item.quantity, 0);
  const totalRevenue = mockRevenueData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = mockOrdersData.length;
  const totalCustomers = new Set(mockOrdersData.map(order => order.email)).size;
  const pendingOrders = mockOrdersData.filter(order => order.status === 'pending').length;
  const activeBakingOrders = mockOrdersData.filter(order => order.status === 'pending' || order.status === 'baking').length;

  // Filter orders
  const filteredOrders = selectedStatus === 'all' 
    ? mockOrdersData 
    : mockOrdersData.filter(order => order.status === selectedStatus);

  // Order status distribution for pie chart
  const statusCounts = mockOrdersData.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/login', { method: 'DELETE' });
      sessionStorage.removeItem("fatsprinkle_admin_session");
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.push("/admin/login");
    }
  };

  const markOrderReady = (orderId: string) => {
    // TODO: Implement real API call
    console.log(`Marking order ${orderId} as ready to bake`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'baking': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'ready': return 'text-green-600 bg-green-50 border-green-200';
      case 'delivered': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock size={14} />;
      case 'baking': return <ChefHat size={14} />;
      case 'ready': return <CheckCircle size={14} />;
      case 'delivered': return <Package size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8f6f0" }}>
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
          borderColor: "rgba(127, 105, 87, 0.1)"
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
                  <h1 className="text-2xl font-bold comic-text" style={{ color: "#7f6957" }}>
                    fatsprinkle.co
                  </h1>
                  <p className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
                    Admin Dashboard
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-lg font-bold comic-text" style={{ color: "#7f6957" }}>
                    {totalRevenue.toLocaleString()}.-
                  </div>
                  <div className="text-xs opacity-75 comic-text" style={{ color: "#7f6957" }}>
                    Week Revenue
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold comic-text" style={{ color: "#7f6957" }}>
                    {pendingOrders}
                  </div>
                  <div className="text-xs opacity-75 comic-text" style={{ color: "#7f6957" }}>
                    Pending Orders
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => router.push('/admin/products')}
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
                <p className="text-sm font-medium opacity-75 comic-text" style={{ color: "#7f6957" }}>
                  Total Revenue
                </p>
                <p className="text-2xl font-bold mt-2 comic-text" style={{ color: "#7f6957" }}>
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
              <span className="text-sm opacity-75 ml-2 comic-text" style={{ color: "#7f6957" }}>
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
                <p className="text-sm font-medium opacity-75 comic-text" style={{ color: "#7f6957" }}>
                  Total Orders
                </p>
                <p className="text-2xl font-bold mt-2 comic-text" style={{ color: "#7f6957" }}>
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
              <span className="text-sm opacity-75 ml-2 comic-text" style={{ color: "#7f6957" }}>
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
                <p className="text-sm font-medium opacity-75 comic-text" style={{ color: "#7f6957" }}>
                  Customers
                </p>
                <p className="text-2xl font-bold mt-2 comic-text" style={{ color: "#7f6957" }}>
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
              <span className="text-sm font-medium comic-text" style={{ color: "#7f6957" }}>
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
                <p className="text-sm font-medium opacity-75 comic-text" style={{ color: "#7f6957" }}>
                  Pending Orders
                </p>
                <p className="text-2xl font-bold mt-2 comic-text" style={{ color: "#7f6957" }}>
                  {pendingOrders}
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
              <ChefHat size={16} style={{ color: "#7f6957" }} className="mr-1" />
              <span className="text-sm font-medium comic-text" style={{ color: "#7f6957" }}>
                Ready to bake!
              </span>
            </div>
          </div>
        </div>

        {/* Baking Queue Component - Todo List Style */}
        <div 
          className="rounded-2xl p-6 shadow-sm border border-white/50 mb-8"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold comic-text flex items-center space-x-2" style={{ color: "#7f6957" }}>
              <ChefHat size={20} />
              <span>Today's Baking List ✅</span>
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-sm comic-text opacity-75" style={{ color: "#7f6957" }}>
                {activeBakingOrders} active orders • {totalBakingItems} total items to bake
              </span>
              <button 
                className="p-2 hover:bg-gray-100 rounded-lg"
                title="Refresh list"
              >
                <RefreshCw size={16} style={{ color: "#7f6957" }} />
              </button>
            </div>
          </div>
          
          {(() => {
            const bakingItems = Object.entries(bakingQueue);

            if (bakingItems.length === 0) {
              return (
                <div className="text-center py-12">
                  <div
                    className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    style={{ backgroundColor: "#eaf7ff" }}
                  >
                    <CheckCircle size={40} style={{ color: "#7f6957" }} />
                  </div>
                  <h4 className="text-xl font-bold mb-2 comic-text" style={{ color: "#7f6957" }}>
                    All done for today! 🎉
                  </h4>
                  <p className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
                    No items on your baking list right now
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-3">
                {/* Summary Stats */}
                <div 
                  className="p-4 rounded-xl border-2 border-dashed mb-4"
                  style={{ borderColor: "#7f6957", backgroundColor: "#eaf7ff" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold comic-text" style={{ color: "#7f6957" }}>
                        📊 Baking Summary
                      </h4>
                      <p className="text-sm opacity-75 comic-text mt-1" style={{ color: "#7f6957" }}>
                        Total items to bake across all active orders
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold comic-text" style={{ color: "#7f6957" }}>
                        {totalBakingItems}
                      </div>
                      <div className="text-xs opacity-75 comic-text" style={{ color: "#7f6957" }}>
                        items total
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Baking Tasks */}
                {bakingItems
                  .sort(([, a], [, b]) => b.quantity - a.quantity) // Sort by quantity (highest first)
                  .map(([cookieName, data], index) => (
                  <div 
                    key={cookieName}
                    className="flex items-center space-x-4 p-4 rounded-xl border-2 hover:shadow-md transition-all group"
                    style={{ 
                      backgroundColor: data.completed ? "#f0fdf4" : "#fefbdc",
                      borderColor: data.completed ? "#10b981" : "#e5e7eb"
                    }}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => console.log(`Toggle completion for ${cookieName}`)}
                      className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        data.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 hover:border-[#7f6957] hover:bg-gray-50'
                      }`}
                    >
                      {data.completed && <CheckCircle size={16} className="text-white" />}
                    </button>

                    {/* Cookie Info */}
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.8)" }}
                      >
                        {data.emoji}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className={`font-bold comic-text ${data.completed ? 'line-through opacity-60' : ''}`} 
                              style={{ color: "#7f6957" }}>
                            Bake {data.quantity}x {cookieName}
                          </h4>
                          <div
                            className="px-3 py-1 rounded-full text-sm font-bold"
                            style={{ 
                              backgroundColor: data.completed ? "#dcfce7" : "#7f6957", 
                              color: data.completed ? "#059669" : "white" 
                            }}
                          >
                            {data.quantity}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-1">
                          <p className="text-xs opacity-75 comic-text" style={{ color: "#7f6957" }}>
                            For {data.orders} order{data.orders !== 1 ? 's' : ''}: {data.orderIds.slice(0, 2).join(', ')}
                            {data.orderIds.length > 2 && ` +${data.orderIds.length - 2} more`}
                          </p>
                          <p className="text-xs opacity-60 comic-text" style={{ color: "#7f6957" }}>
                            Customers: {data.customerNames.slice(0, 2).join(', ')}
                            {data.customerNames.length > 2 && ` +${data.customerNames.length - 2} more`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Priority Badge & Action Button */}
                    <div className="flex items-center space-x-2">
                      {index === 0 && !data.completed && (
                        <div
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
                        >
                          HIGHEST QTY
                        </div>
                      )}
                      
                      {/* Action Button */}
                      <button
                        onClick={() => console.log(`Start baking ${cookieName} - Total: ${data.quantity} items`)}
                        className={`p-2 rounded-lg transition-all ${
                          data.completed 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-white hover:scale-110'
                        }`}
                        style={{ backgroundColor: data.completed ? "#e5e7eb" : "#7f6957" }}
                        disabled={data.completed}
                        title={data.completed ? "Already completed" : `Start baking ${data.quantity}x ${cookieName}`}
                      >
                        {data.completed ? <CheckCircle size={16} /> : <ChefHat size={16} />}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Progress Bar */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium comic-text" style={{ color: "#7f6957" }}>
                      Baking Progress
                    </span>
                    <span className="text-sm comic-text" style={{ color: "#7f6957" }}>
                      {bakingItems.filter(([_, data]) => data.completed).length} of {bakingItems.length} types completed
                    </span>
                  </div>
                  <div 
                    className="w-full h-3 rounded-full"
                    style={{ backgroundColor: "#e5e7eb" }}
                  >
                    <div 
                      className="h-3 rounded-full transition-all duration-500"
                      style={{ 
                        backgroundColor: "#10b981",
                        width: `${bakingItems.length > 0 ? (bakingItems.filter(([_, data]) => data.completed).length / bakingItems.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div 
            className="rounded-2xl p-6 shadow-sm border border-white/50"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold comic-text" style={{ color: "#7f6957" }}>
                Daily Revenue 📈
              </h3>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border-2 rounded-xl text-sm comic-text"
                style={{ 
                  backgroundColor: "#fefbdc", 
                  borderColor: "#e5e7eb",
                  color: "#7f6957"
                }}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between h-40 space-x-2">
              {mockRevenueData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full rounded-t-lg transition-all hover:opacity-80"
                    style={{ 
                      height: `${(data.revenue / Math.max(...mockRevenueData.map(d => d.revenue))) * 120}px`,
                      backgroundColor: "#7f6957"
                    }}
                    title={`${data.revenue}.- THB`}
                  />
                  <span className="text-xs mt-2 comic-text" style={{ color: "#7f6957" }}>
                    {data.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Chart */}
          <div 
            className="rounded-2xl p-6 shadow-sm border border-white/50"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
          >
            <h3 className="text-lg font-bold mb-6 comic-text" style={{ color: "#7f6957" }}>
              Order Status 📊
            </h3>
            
            <div className="space-y-4">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                      <span className="text-sm font-medium comic-text capitalize">
                        {status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold comic-text" style={{ color: "#7f6957" }}>
                      {count}
                    </span>
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        width: `${(count / totalOrders) * 60}px`,
                        backgroundColor: status === 'pending' ? '#f59e0b' : 
                                       status === 'baking' ? '#3b82f6' :
                                       status === 'ready' ? '#10b981' : '#6b7280'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div 
          className="rounded-2xl shadow-sm border border-white/50 overflow-hidden"
          style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold comic-text" style={{ color: "#7f6957" }}>
                Recent Orders 🍪
              </h3>
              <div className="flex items-center space-x-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border-2 rounded-xl text-sm comic-text"
                  style={{ 
                    backgroundColor: "#fefbdc", 
                    borderColor: "#e5e7eb",
                    color: "#7f6957"
                  }}
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="baking">Baking</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                </select>
                
                {pendingOrders > 0 && (
                  <button
                    onClick={() => markOrderReady(mockOrdersData.find(o => o.status === 'pending')?.id || '')}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white font-medium comic-text hover:scale-105 transition-transform"
                    style={{ backgroundColor: "#7f6957" }}
                  >
                    <ChefHat size={16} />
                    <span>Bake Next</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr 
                  className="border-b"
                  style={{ backgroundColor: "#fefbdc", borderColor: "rgba(127, 105, 87, 0.1)" }}
                >
                  <th className="text-left py-3 px-6 font-medium comic-text" style={{ color: "#7f6957" }}>
                    Order ID
                  </th>
                  <th className="text-left py-3 px-6 font-medium comic-text" style={{ color: "#7f6957" }}>
                    Customer
                  </th>
                  <th className="text-left py-3 px-6 font-medium comic-text" style={{ color: "#7f6957" }}>
                    Items
                  </th>
                  <th className="text-left py-3 px-6 font-medium comic-text" style={{ color: "#7f6957" }}>
                    Total
                  </th>
                  <th className="text-left py-3 px-6 font-medium comic-text" style={{ color: "#7f6957" }}>
                    Status
                  </th>
                  <th className="text-left py-3 px-6 font-medium comic-text" style={{ color: "#7f6957" }}>
                    Delivery
                  </th>
                  <th className="text-left py-3 px-6 font-medium comic-text" style={{ color: "#7f6957" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm font-medium" style={{ color: "#7f6957" }}>
                        {order.id}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium comic-text" style={{ color: "#7f6957" }}>
                          {order.customerName}
                        </div>
                        <div className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
                          {order.email}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm comic-text" style={{ color: "#7f6957" }}>
                        {order.items.map((item, idx) => (
                          <div key={idx}>
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold comic-text" style={{ color: "#7f6957" }}>
                        {order.total}.-
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-medium comic-text capitalize">
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm comic-text" style={{ color: "#7f6957" }}>
                        <div className="capitalize font-medium">{order.deliveryMethod}</div>
                        <div className="opacity-75">
                          {order.deliveryDate.toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="View Order"
                        >
                          <Eye size={16} style={{ color: "#7f6957" }} />
                        </button>
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => markOrderReady(order.id)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Start Baking"
                          >
                            <ChefHat size={16} style={{ color: "#7f6957" }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => router.push('/admin/products')}
            className="p-6 rounded-2xl border-2 border-dashed hover:scale-105 transition-transform text-left"
            style={{ borderColor: "#7f6957" }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#eaf7ff" }}
              >
                <Package size={24} style={{ color: "#7f6957" }} />
              </div>
              <span className="font-bold text-lg comic-text" style={{ color: "#7f6957" }}>
                Manage Products
              </span>
            </div>
            <p className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
              Add, edit, or remove cookies from your menu
            </p>
          </button>

          <button className="p-6 rounded-2xl border-2 border-dashed hover:scale-105 transition-transform text-left"
            style={{ borderColor: "#7f6957" }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#fef3c7" }}
              >
                <Calendar size={24} style={{ color: "#7f6957" }} />
              </div>
              <span className="font-bold text-lg comic-text" style={{ color: "#7f6957" }}>
                Delivery Schedule
              </span>
            </div>
            <p className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
              Plan your baking and delivery dates
            </p>
          </button>

          <button className="p-6 rounded-2xl border-2 border-dashed hover:scale-105 transition-transform text-left"
            style={{ borderColor: "#7f6957" }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#f0fdf4" }}
              >
                <Star size={24} style={{ color: "#7f6957" }} />
              </div>
              <span className="font-bold text-lg comic-text" style={{ color: "#7f6957" }}>
                Customer Reviews
              </span>
            </div>
            <p className="text-sm opacity-75 comic-text" style={{ color: "#7f6957" }}>
              See what customers love about your cookies
            </p>
          </button>
        </div>
      </main>
    </div>
  );
}