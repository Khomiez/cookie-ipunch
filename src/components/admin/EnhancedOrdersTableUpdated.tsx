// components/admin/EnhancedOrdersTableUpdated.tsx
"use client";

import React, { useState } from "react";
import { Eye, Filter, ChefHat, Zap } from "lucide-react";
import { Order, OrderStatus } from "@/types/order";
import OrderStatusBadge from "./OrderStatusBadge";
import OrderStatusControls from "./OrderStatusControls";

interface EnhancedOrdersTableUpdatedProps {
  orders: Order[];
  onOrderStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onBakeAllOrders: () => void;
  onViewOrder?: (orderId: string) => void;
}

const EnhancedOrdersTableUpdated: React.FC<EnhancedOrdersTableUpdatedProps> = ({
  orders,
  onOrderStatusChange,
  onBakeAllOrders,
  onViewOrder,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "status" | "total">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isProcessingBakeAll, setIsProcessingBakeAll] = useState(false);

  // Filter orders based on selected status
  const filteredOrders =
    selectedStatus === "all"
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case "status":
        const statusOrder = [
          "pending",
          "baking",
          "ready",
          "packed",
          "delivered",
        ];
        comparison =
          statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        break;
      case "total":
        comparison = a.total - b.total;
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    onOrderStatusChange(orderId, newStatus);
  };

  const handleViewOrder = (orderId: string) => {
    if (onViewOrder) {
      onViewOrder(orderId);
    } else {
      console.log(`View order: ${orderId}`);
    }
  };

  const handleBakeAll = async () => {
    const pendingOrders = orders.filter((order) => order.status === "pending");
    
    if (pendingOrders.length === 0) {
      return;
    }

    setIsProcessingBakeAll(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onBakeAllOrders();
    } finally {
      setIsProcessingBakeAll(false);
    }
  };

  // Get status counts for filter badges
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pendingOrdersCount = statusCounts["pending"] || 0;

  return (
    <div
      className="rounded-2xl shadow-sm border border-white/50 overflow-hidden"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
    >
      {/* Header with Filters and Bake All Button */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-lg font-bold comic-text"
            style={{ color: "#7f6957" }}
          >
            Orders Management 📋
          </h3>

          <div className="flex items-center space-x-3">
            {/* Bake All Button */}
            {pendingOrdersCount > 0 && (
              <button
                onClick={handleBakeAll}
                disabled={isProcessingBakeAll}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white font-medium comic-text hover:scale-105 transition-transform disabled:opacity-50 disabled:transform-none shadow-md"
                style={{ backgroundColor: "#7f6957" }}
                title={`Start baking all ${pendingOrdersCount} pending orders`}
              >
                {isProcessingBakeAll ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    <span>Bake All ({pendingOrdersCount})</span>
                  </>
                )}
              </button>
            )}

            {/* Sort Controls */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field as "date" | "status" | "total");
                setSortOrder(order as "asc" | "desc");
              }}
              className="px-3 py-2 border-2 rounded-xl text-sm comic-text"
              style={{
                backgroundColor: "#fefbdc",
                borderColor: "#e5e7eb",
                color: "#7f6957",
              }}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="status-asc">Status: Pending → Delivered</option>
              <option value="status-desc">Status: Delivered → Pending</option>
              <option value="total-desc">Highest Amount</option>
              <option value="total-asc">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Bake All Info Banner */}
        {pendingOrdersCount > 0 && (
          <div
            className="p-3 rounded-xl mb-4 border-2 border-dashed"
            style={{ borderColor: "#7f6957", backgroundColor: "#eaf7ff" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ChefHat size={16} style={{ color: "#7f6957" }} />
                <span
                  className="text-sm font-medium comic-text"
                  style={{ color: "#7f6957" }}
                >
                  {pendingOrdersCount} order{pendingOrdersCount !== 1 ? "s" : ""} ready to start baking
                </span>
              </div>
              <span
                className="text-xs opacity-75 comic-text"
                style={{ color: "#7f6957" }}
              >
                Click "Bake All" to move all pending orders to baking status
              </span>
            </div>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium comic-text transition-all ${
              selectedStatus === "all"
                ? "text-white shadow-md"
                : "text-[#7f6957] border-2 border-dashed hover:bg-gray-50"
            }`}
            style={{
              backgroundColor:
                selectedStatus === "all" ? "#7f6957" : "transparent",
              borderColor: selectedStatus === "all" ? "#7f6957" : "#7f6957",
            }}
          >
            All Orders ({orders.length})
          </button>

          {["pending", "baking", "ready", "packed", "delivered"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium comic-text transition-all capitalize ${
                  selectedStatus === status
                    ? "text-white shadow-md"
                    : "text-[#7f6957] border-2 border-dashed hover:bg-gray-50"
                }`}
                style={{
                  backgroundColor:
                    selectedStatus === status ? "#7f6957" : "transparent",
                  borderColor:
                    selectedStatus === status ? "#7f6957" : "#7f6957",
                }}
              >
                {status} ({statusCounts[status] || 0})
              </button>
            )
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="border-b"
              style={{
                backgroundColor: "#fefbdc",
                borderColor: "rgba(127, 105, 87, 0.1)",
              }}
            >
              <th
                className="text-left py-3 px-6 font-medium comic-text"
                style={{ color: "#7f6957" }}
              >
                Order ID
              </th>
              <th
                className="text-left py-3 px-6 font-medium comic-text"
                style={{ color: "#7f6957" }}
              >
                Customer
              </th>
              <th
                className="text-left py-3 px-6 font-medium comic-text"
                style={{ color: "#7f6957" }}
              >
                Items
              </th>
              <th
                className="text-left py-3 px-6 font-medium comic-text"
                style={{ color: "#7f6957" }}
              >
                Total
              </th>
              <th
                className="text-left py-3 px-6 font-medium comic-text"
                style={{ color: "#7f6957" }}
              >
                Status
              </th>
              <th
                className="text-left py-3 px-6 font-medium comic-text"
                style={{ color: "#7f6957" }}
              >
                Delivery
              </th>
              <th
                className="text-left py-3 px-6 font-medium comic-text"
                style={{ color: "#7f6957" }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center">
                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: "#eaf7ff" }}
                    >
                      <Filter size={32} style={{ color: "#7f6957" }} />
                    </div>
                    <h4
                      className="text-lg font-bold mb-2 comic-text"
                      style={{ color: "#7f6957" }}
                    >
                      No orders found
                    </h4>
                    <p
                      className="text-sm opacity-75 comic-text"
                      style={{ color: "#7f6957" }}
                    >
                      {selectedStatus === "all"
                        ? "No orders have been placed yet"
                        : `No orders with "${selectedStatus}" status`}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-4 px-6">
                    <span
                      className="font-mono text-sm font-medium"
                      style={{ color: "#7f6957" }}
                    >
                      {order.id}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <div>
                      <div
                        className="font-medium comic-text"
                        style={{ color: "#7f6957" }}
                      >
                        {order.customerName}
                      </div>
                      <div
                        className="text-sm opacity-75 comic-text"
                        style={{ color: "#7f6957" }}
                      >
                        {order.email}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div
                      className="text-sm comic-text"
                      style={{ color: "#7f6957" }}
                    >
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between"
                        >
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-xs opacity-60 ml-2">
                            {item.price}.-
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className="font-bold comic-text"
                      style={{ color: "#7f6957" }}
                    >
                      {order.total}.-
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <OrderStatusBadge status={order.status} />
                  </td>

                  <td className="py-4 px-6">
                    <div
                      className="text-sm comic-text"
                      style={{ color: "#7f6957" }}
                    >
                      <div className="capitalize font-medium">
                        {order.deliveryMethod}
                      </div>
                      <div className="opacity-75">
                        {order.deliveryDate.toLocaleDateString()}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      {/* View Order Button */}
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="View Order Details"
                      >
                        <Eye size={16} style={{ color: "#7f6957" }} />
                      </button>

                      {/* Status Controls */}
                      <OrderStatusControls
                        orderId={order.id}
                        currentStatus={order.status}
                        onStatusChange={handleStatusChange}
                        size="sm"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with Summary */}
      {sortedOrders.length > 0 && (
        <div
          className="p-4 border-t border-gray-200"
          style={{ backgroundColor: "#fefbdc" }}
        >
          <div className="flex items-center justify-between">
            <div className="text-sm comic-text" style={{ color: "#7f6957" }}>
              Showing {sortedOrders.length} of {orders.length} orders
              {selectedStatus !== "all" && ` with "${selectedStatus}" status`}
              {pendingOrdersCount > 0 && (
                <span className="ml-4 font-medium">
                  • {pendingOrdersCount} pending order{pendingOrdersCount !== 1 ? "s" : ""} ready for baking
                </span>
              )}
            </div>

            <div
              className="flex items-center space-x-4 text-sm comic-text"
              style={{ color: "#7f6957" }}
            >
              <span>
                Total Revenue:{" "}
                <strong>
                  {sortedOrders
                    .reduce((sum, order) => sum + order.total, 0)
                    .toLocaleString()}
                  .-
                </strong>
              </span>
              <span>
                Avg. Order:{" "}
                <strong>
                  {Math.round(
                    sortedOrders.reduce((sum, order) => sum + order.total, 0) /
                      sortedOrders.length || 0
                  )}
                  .-
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedOrdersTableUpdated;