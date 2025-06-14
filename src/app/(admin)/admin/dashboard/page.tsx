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
  ArrowDown,
  Search,
  MoreHorizontal,
  ChevronDown,
  Activity,
  PieChart,
  Globe,
  User,
  HelpCircle,
} from "lucide-react";

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
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  period: string;
  bgColor: string;
  chartData: number[];
}

interface CountryData {
  name: string;
  value: number;
  color: string;
  flag: string;
}

interface ProductData {
  id: string;
  name: string;
  category: string;
  stock: "In Stock" | "Low Stock" | "Out of Stock";
  stockColor: string;
  sales: string;
  image: string;
  revenue: string;
}

export default function ModernAdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check authentication and fetch data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we're authenticated by making a request to the dashboard API
        const response = await fetch('/api/admin/dashboard');
        if (!response.ok) {
          if (response.status === 401) {
            setIsAuthenticated(false);
            router.push("/admin/login");
            return;
          }
          throw new Error('Failed to fetch dashboard data');
        }
        
        setIsAuthenticated(true);
        const result = await response.json();
        setDashboardData(result.data);
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          setIsAuthenticated(false);
          router.push("/admin/login");
          return;
        }
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Call logout API
      await fetch('/api/admin/auth/login', { method: 'DELETE' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      router.push("/admin/login");
    }
  };

  // Use real data or fallback to mock data
  const stats: StatCard[] = dashboardData ? [
    {
      title: "Total Customers",
      value: dashboardData.totalCustomers.value.toLocaleString(),
      change: dashboardData.totalCustomers.change,
      changeType: dashboardData.totalCustomers.changeType,
      period: dashboardData.totalCustomers.period,
      bgColor: "#EEF2FF",
      chartData: dashboardData.earningsChart.slice(-9).map(d => d.customers)
    },
    {
      title: "Total Revenue", 
      value: `${dashboardData.totalRevenue.value.toLocaleString()} THB`,
      change: dashboardData.totalRevenue.change,
      changeType: dashboardData.totalRevenue.changeType,
      period: dashboardData.totalRevenue.period,
      bgColor: "#F0FDF4",
      chartData: dashboardData.earningsChart.slice(-9).map(d => d.revenue / 1000)
    },
    {
      title: "Total Orders",
      value: dashboardData.totalOrders.value.toLocaleString(), 
      change: dashboardData.totalOrders.change,
      changeType: dashboardData.totalOrders.changeType,
      period: dashboardData.totalOrders.period,
      bgColor: "#FFFBEB",
      chartData: dashboardData.earningsChart.slice(-9).map(d => d.orders)
    }
  ] : [
    {
      title: "Total Customers",
      value: "156",
      change: "+12%",
      changeType: "positive",
      period: "This month",
      bgColor: "#EEF2FF",
      chartData: [20, 15, 30, 25, 40, 35, 45, 40, 55]
    },
    {
      title: "Total Revenue", 
      value: "15,200 THB",
      change: "+8.2%",
      changeType: "positive",
      period: "This month",
      bgColor: "#F0FDF4",
      chartData: [35, 40, 30, 35, 25, 30, 20, 25, 35]
    },
    {
      title: "Total Orders",
      value: "89", 
      change: "+15%",
      changeType: "positive",
      period: "This month",
      bgColor: "#FFFBEB",
      chartData: [15, 20, 25, 30, 35, 40, 45, 50, 55]
    }
  ];

  // Simple SVG chart component
  const MiniChart = ({ data, color = "#4F46E5", positive = true }: { data: number[], color?: string, positive?: boolean }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1; // Prevent division by zero
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 60;
      const y = 25 - ((value - min) / range) * 20;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width="60" height="30" viewBox="0 0 60 30" className="flex-shrink-0">
        <polyline
          points={points}
          fill="none"
          stroke={positive ? "#10B981" : "#EF4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  // Large earnings chart component with real data
  const EarningsChart = () => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    
    // Use real data if available, otherwise use mock data
    const grossData = dashboardData ? 
      dashboardData.earningsChart.map(d => d.revenue / 1000) :
      [85, 95, 110, 100, 115, 140, 130, 145, 135, 155, 165, 180];
    
    const netData = dashboardData ? 
      dashboardData.earningsChart.map(d => d.orders * 10) : // Scale orders for visual comparison
      [65, 78, 90, 81, 95, 120, 110, 125, 115, 135, 145, 160];
    
    const maxValue = Math.max(...grossData, ...netData) || 1;
    const chartHeight = 200;
    
    // Calculate current period highlight
    const currentMonth = new Date().getMonth();
    
    return (
      <div className="relative">
        <div className="absolute top-4 left-4 bg-[#7f6957] text-white px-3 py-2 rounded-lg text-sm font-medium z-10">
          {dashboardData ? 
            `${(dashboardData.totalRevenue.value / 1000).toFixed(1)}K THB` : 
            '307.48K THB'
          }
          <div className="text-xs text-gray-300 mt-1">
            {months[currentMonth]} {new Date().getFullYear()}
          </div>
        </div>
        
        <svg width="100%" height="240" viewBox="0 0 800 240" className="mt-4">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="60"
              y1={40 + i * 40}
              x2="760"
              y2={40 + i * 40}
              stroke="#f0f0f0"
              strokeDasharray="3,3"
            />
          ))}
          
          {/* Gross revenue area */}
          <path
            d={`M 60,${240 - (grossData[0] / maxValue) * chartHeight} ${grossData.map((value, index) => 
              `L ${60 + (index * 58.33)},${240 - (value / maxValue) * chartHeight}`
            ).join(' ')} L 760,240 L 60,240 Z`}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3B82F6"
            strokeWidth="2"
          />
          
          {/* Net revenue area */}
          <path
            d={`M 60,${240 - (netData[0] / maxValue) * chartHeight} ${netData.map((value, index) => 
              `L ${60 + (index * 58.33)},${240 - (value / maxValue) * chartHeight}`
            ).join(' ')} L 760,240 L 60,240 Z`}
            fill="rgba(16, 185, 129, 0.1)"
            stroke="#10B981"
            strokeWidth="2"
          />
          
          {/* X-axis labels */}
          {months.map((month, index) => (
            <text
              key={month}
              x={60 + (index * 58.33)}
              y={235}
              textAnchor="middle"
              className={`text-xs ${index === currentMonth ? 'fill-gray-900 font-semibold' : 'fill-gray-500'}`}
            >
              {month}
            </text>
          ))}
          
          {/* Data points */}
          {grossData.map((value, index) => (
            <circle
              key={`gross-${index}`}
              cx={60 + (index * 58.33)}
              cy={240 - (value / maxValue) * chartHeight}
              r={index === currentMonth ? "4" : "3"}
              fill="#3B82F6"
              className={index === currentMonth ? "drop-shadow-lg" : ""}
            />
          ))}
          {netData.map((value, index) => (
            <circle
              key={`net-${index}`}
              cx={60 + (index * 58.33)}
              cy={240 - (value / maxValue) * chartHeight}
              r={index === currentMonth ? "4" : "3"}
              fill="#10B981"
              className={index === currentMonth ? "drop-shadow-lg" : ""}
            />
          ))}
        </svg>
      </div>
    );
  };

  const topCountriesData: CountryData[] = dashboardData ? dashboardData.topCountries.map((country, index) => ({
    name: country.country,
    value: country.percentage,
    color: ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B'][index] || '#6B7280',
    flag: {'Thailand': 'TH', 'Singapore': 'SG', 'Malaysia': 'MY', 'Others': '🌏'}[country.country] || '🌏'
  })) : [
    { name: 'Thailand', value: 65.2, color: '#4F46E5', flag: '🇹🇭' },
    { name: 'Singapore', value: 18.3, color: '#06B6D4', flag: '🇸🇬' },
    { name: 'Malaysia', value: 11.1, color: '#10B981', flag: '🇲🇾' },
    { name: 'Others', value: 5.4, color: '#F59E0B', flag: '🌏' }
  ];

  const topProductsData: ProductData[] = dashboardData ? dashboardData.topProducts.slice(0, 4).map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    stock: product.stock,
    stockColor: product.stock === 'In Stock' ? 'text-green-600 bg-green-50' : 
                product.stock === 'Low Stock' ? 'text-orange-600 bg-orange-50' : 
                'text-red-600 bg-red-50',
    sales: product.sales.toLocaleString(),
    image: product.image,
    revenue: (product.revenue / 1000).toFixed(1) + 'K'
  })) : [
    {
      id: "PR001",
      name: "Chocolate Chip Cookies",
      category: "Classic",
      stock: "In Stock",
      stockColor: "text-green-600 bg-green-50",
      sales: "2.4K",
      image: "🍪",
      revenue: "48.2K"
    },
    {
      id: "PR002", 
      name: "Double Chocolate Brownies",
      category: "Premium",
      stock: "Low Stock",
      stockColor: "text-orange-600 bg-orange-50",
      sales: "1.8K",
      image: "🧁",
      revenue: "36.8K"
    },
    {
      id: "PR003",
      name: "Vanilla Sugar Cookies",
      category: "Classic", 
      stock: "In Stock",
      stockColor: "text-green-600 bg-green-50",
      sales: "1.5K",
      image: "🍪",
      revenue: "32.4K"
    },
    {
      id: "PR004",
      name: "Red Velvet Cupcakes",
      category: "Special",
      stock: "Out of Stock",
      stockColor: "text-red-600 bg-red-50",
      sales: "1.2K", 
      image: "🧁",
      revenue: "28.9K"
    }
  ];

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf7ff]">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7f6957]"></div>
          <span className="text-lg font-medium text-gray-700">
            {isLoading ? "Loading dashboard..." : "Redirecting..."}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#eaf7ff]">
        <div className="text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#7f6957] text-white rounded-lg hover:bg-[#6d5a47] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaf7ff]">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-white shadow-sm border-r border-gray-200 z-40">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-[#7f6957] rounded-lg flex items-center justify-center">
              <Cookie size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">fatsprinkle</span>
          </div>

          <nav className="space-y-2">
            {[
              { icon: BarChart3, label: "Home", active: true },
              { icon: Activity, label: "Analytics" },
              { icon: Globe, label: "Explore" },
              { icon: Package, label: "Shop", onClick: () => router.push('/admin/products') },
              { icon: ShoppingCart, label: "Orders" },
            ].map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  item.active 
                    ? 'bg-[#7f6957] text-white' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-12">
            <h3 className="text-sm font-medium text-gray-500 mb-4">Tools</h3>
            <nav className="space-y-2">
              {[
                { icon: Settings, label: "Settings" },
                { icon: HelpCircle, label: "Help" },
                { icon: User, label: "Manage user" },
              ].map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl text-left transition-colors"
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl text-left transition-colors mt-8"
          >
            <LogOut size={20} />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome Back, Admin!</h1>
              <p className="text-gray-600 mt-1">Here's what's happening with your store today</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell size={20} />
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <MiniChart 
                      data={stat.chartData} 
                      positive={stat.changeType === 'positive'}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`flex items-center text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.changeType === 'positive' ? (
                        <ArrowUp size={16} className="mr-1" />
                      ) : (
                        <ArrowDown size={16} className="mr-1" />
                      )}
                      {stat.change}
                    </span>
                    <span className="text-gray-500 text-sm">{stat.period}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Earnings Chart */}
            <div className="col-span-2 bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Revenue Trends</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Orders</span>
                  </div>
                </div>
              </div>
              
              <EarningsChart />
            </div>

            {/* Top Countries */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Top Countries</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {topCountriesData.map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{country.flag}</span>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: country.color }}
                        ></div>
                      </div>
                      <span className="text-gray-900 font-medium">{country.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-900 font-semibold">{country.value.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {dashboardData ? 
                      dashboardData.totalOrders.value.toLocaleString() : 
                      '89'
                    }
                  </div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="mt-8 bg-white rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top selling products</h3>
              <div className="flex items-center space-x-3">
                <button className="text-gray-400 hover:text-gray-600">
                  <Filter size={20} />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Download size={20} />
                </button>
                <button 
                  onClick={() => router.push('/admin/products')}
                  className="px-4 py-2 bg-[#7f6957] text-white rounded-lg hover:bg-[#6d5a47] transition-colors text-sm font-medium"
                >
                  <Plus size={16} className="inline mr-2" />
                  Add Product
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">S/NO.</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Product Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Total sales</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductsData.map((product, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-gray-600 font-medium">{String(index + 1).padStart(2, '0')}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-lg">
                            {product.image}
                          </div>
                          <span className="font-medium text-gray-900">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-600">{product.category}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stockColor}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-semibold text-gray-900">{product.sales}</div>
                          <div className="text-xs text-gray-500">{product.revenue} THB</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/admin/products')}
              className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow text-left"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package size={20} className="text-blue-600" />
                </div>
                <span className="font-semibold text-gray-900">Products</span>
              </div>
              <p className="text-sm text-gray-600">Manage your inventory and product catalog</p>
            </button>

            <button className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow text-left">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart size={20} className="text-green-600" />
                </div>
                <span className="font-semibold text-gray-900">Orders</span>
              </div>
              <p className="text-sm text-gray-600">View and manage customer orders</p>
            </button>

            <button className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow text-left">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-purple-600" />
                </div>
                <span className="font-semibold text-gray-900">Customers</span>
              </div>
              <p className="text-sm text-gray-600">Customer data and analytics</p>
            </button>

            <button className="bg-white p-6 rounded-2xl border border-gray-200 hover:shadow-md transition-shadow text-left">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 size={20} className="text-orange-600" />
                </div>
                <span className="font-semibold text-gray-900">Analytics</span>
              </div>
              <p className="text-sm text-gray-600">Detailed reports and insights</p>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}