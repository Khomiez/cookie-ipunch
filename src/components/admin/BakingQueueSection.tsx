// components/admin/BakingQueueSection.tsx
"use client";

import React, { useState, useCallback } from "react";
import { ChefHat, CheckCircle, RefreshCw, Clock, Package } from "lucide-react";
import {
  Order,
  BakingQueue,
  OrderStatus,
  getOrdersToUpdateAfterBaking,
} from "@/types/order";

interface BakingQueueSectionProps {
  orders: Order[];
  onOrderStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  onBakingComplete: (cookieName: string) => void;
}

const BakingQueueSection: React.FC<BakingQueueSectionProps> = ({
  orders,
  onOrderStatusChange,
  onBakingComplete,
}) => {
  const [completedCookies, setCompletedCookies] = useState<Set<string>>(
    new Set()
  );

  // Helper function to get product emoji
  const getProductEmoji = (productName: string): string => {
    const name = productName.toLowerCase();
    if (name.includes("chocolate chip")) return "🍪";
    if (name.includes("brownie") || name.includes("chocolate")) return "🧁";
    if (name.includes("vanilla") || name.includes("sugar")) return "🍪";
    if (name.includes("cupcake") || name.includes("velvet")) return "🧁";
    if (name.includes("oatmeal") || name.includes("raisin")) return "🍪";
    if (name.includes("snickerdoodle")) return "🍪";
    return "🍪";
  };

  // Calculate baking queue from pending and baking orders
  const calculateBakingList = useCallback((): BakingQueue => {
    return orders
      .filter(
        (order) => order.status === "pending" || order.status === "baking"
      )
      .reduce((acc, order) => {
        order.items.forEach((item) => {
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
              completed: completedCookies.has(item.name),
            };
          }
        });
        return acc;
      }, {} as BakingQueue);
  }, [orders, completedCookies]);

  const bakingQueue = calculateBakingList();
  const bakingItems = Object.entries(bakingQueue);
  const totalBakingItems = Object.values(bakingQueue).reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const activeBakingOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "baking"
  ).length;

  // Handle completing a baking task
  const handleToggleBakingComplete = (cookieName: string) => {
    const newCompletedCookies = new Set(completedCookies);

    if (completedCookies.has(cookieName)) {
      // Uncomplete the cookie
      newCompletedCookies.delete(cookieName);
    } else {
      // Complete the cookie
      newCompletedCookies.add(cookieName);

      // Check which orders can now be moved to 'baking' status
      const ordersToUpdate = getOrdersToUpdateAfterBaking(
        orders,
        newCompletedCookies
      );

      // Auto-update order statuses
      ordersToUpdate.forEach((order) => {
        if (order.status === "pending") {
          onOrderStatusChange(order.id, "baking");
        }
      });

      // Notify parent component
      onBakingComplete(cookieName);
    }

    setCompletedCookies(newCompletedCookies);
  };

  // Check how many orders will be auto-updated when completing this cookie
  const getOrdersAffectedByCompletion = (cookieName: string): Order[] => {
    const tempCompleted = new Set([...completedCookies, cookieName]);
    return getOrdersToUpdateAfterBaking(orders, tempCompleted);
  };

  return (
    <div
      className="rounded-2xl p-6 shadow-sm border border-white/50 mb-8"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-lg font-bold comic-text flex items-center space-x-2"
          style={{ color: "#7f6957" }}
        >
          <ChefHat size={20} />
          <span>Today's Baking List ✅</span>
        </h3>
        <div className="flex items-center space-x-3">
          <span
            className="text-sm comic-text opacity-75"
            style={{ color: "#7f6957" }}
          >
            {activeBakingOrders} active orders • {totalBakingItems} total items
            to bake
          </span>
          <button
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Refresh list"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} style={{ color: "#7f6957" }} />
          </button>
        </div>
      </div>

      {bakingItems.length === 0 ? (
        <div className="text-center py-12">
          <div
            className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "#eaf7ff" }}
          >
            <CheckCircle size={40} style={{ color: "#7f6957" }} />
          </div>
          <h4
            className="text-xl font-bold mb-2 comic-text"
            style={{ color: "#7f6957" }}
          >
            All done for today! 🎉
          </h4>
          <p
            className="text-sm opacity-75 comic-text"
            style={{ color: "#7f6957" }}
          >
            No items on your baking list right now
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Summary Stats */}
          <div
            className="p-4 rounded-xl border-2 border-dashed mb-4"
            style={{ borderColor: "#7f6957", backgroundColor: "#eaf7ff" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h4
                  className="font-bold comic-text"
                  style={{ color: "#7f6957" }}
                >
                  📊 Baking Summary
                </h4>
                <p
                  className="text-sm opacity-75 comic-text mt-1"
                  style={{ color: "#7f6957" }}
                >
                  Total items to bake across all active orders
                </p>
              </div>
              <div className="text-right">
                <div
                  className="text-2xl font-bold comic-text"
                  style={{ color: "#7f6957" }}
                >
                  {totalBakingItems}
                </div>
                <div
                  className="text-xs opacity-75 comic-text"
                  style={{ color: "#7f6957" }}
                >
                  items total
                </div>
              </div>
            </div>
          </div>

          {/* Individual Baking Tasks */}
          {bakingItems
            .sort(([, a], [, b]) => b.quantity - a.quantity)
            .map(([cookieName, data], index) => {
              const isCompleted = completedCookies.has(cookieName);
              const affectedOrders = getOrdersAffectedByCompletion(cookieName);

              return (
                <div
                  key={cookieName}
                  className="flex items-center space-x-4 p-4 rounded-xl border-2 hover:shadow-md transition-all group"
                  style={{
                    backgroundColor: isCompleted ? "#f0fdf4" : "#fefbdc",
                    borderColor: isCompleted ? "#10b981" : "#e5e7eb",
                  }}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleBakingComplete(cookieName)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-green-500 border-green-500"
                        : "border-gray-300 hover:border-[#7f6957] hover:bg-gray-50"
                    }`}
                  >
                    {isCompleted && (
                      <CheckCircle size={16} className="text-white" />
                    )}
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
                        <h4
                          className={`font-bold comic-text ${
                            isCompleted ? "line-through opacity-60" : ""
                          }`}
                          style={{ color: "#7f6957" }}
                        >
                          Bake {data.quantity}x {cookieName}
                        </h4>
                        <div
                          className="px-3 py-1 rounded-full text-sm font-bold"
                          style={{
                            backgroundColor: isCompleted
                              ? "#dcfce7"
                              : "#7f6957",
                            color: isCompleted ? "#059669" : "white",
                          }}
                        >
                          {data.quantity}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <p
                          className="text-xs opacity-75 comic-text"
                          style={{ color: "#7f6957" }}
                        >
                          For {data.orders} order{data.orders !== 1 ? "s" : ""}:{" "}
                          {data.orderIds.slice(0, 2).join(", ")}
                          {data.orderIds.length > 2 &&
                            ` +${data.orderIds.length - 2} more`}
                        </p>
                        <p
                          className="text-xs opacity-60 comic-text"
                          style={{ color: "#7f6957" }}
                        >
                          Customers: {data.customerNames.slice(0, 2).join(", ")}
                          {data.customerNames.length > 2 &&
                            ` +${data.customerNames.length - 2} more`}
                        </p>
                      </div>

                      {/* Auto-update notification */}
                      {!isCompleted && affectedOrders.length > 0 && (
                        <div
                          className="mt-2 p-2 rounded-lg text-xs"
                          style={{ backgroundColor: "#fef3c7" }}
                        >
                          <span className="font-medium text-amber-700">
                            🚀 Completing this will auto-start baking for{" "}
                            {affectedOrders.length} order
                            {affectedOrders.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Priority Badge & Action Button */}
                  <div className="flex items-center space-x-2">
                    {index === 0 && !isCompleted && (
                      <div
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
                      >
                        HIGHEST QTY
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() => handleToggleBakingComplete(cookieName)}
                      className={`p-2 rounded-lg transition-all ${
                        isCompleted
                          ? "text-gray-400 hover:text-red-500"
                          : "text-white hover:scale-110"
                      }`}
                      style={{
                        backgroundColor: isCompleted ? "#e5e7eb" : "#7f6957",
                      }}
                      title={
                        isCompleted
                          ? "Mark as not completed"
                          : `Start baking ${data.quantity}x ${cookieName}`
                      }
                    >
                      {isCompleted ? (
                        <Clock size={16} />
                      ) : (
                        <ChefHat size={16} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

          {/* Progress Bar */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-sm font-medium comic-text"
                style={{ color: "#7f6957" }}
              >
                Baking Progress
              </span>
              <span className="text-sm comic-text" style={{ color: "#7f6957" }}>
                {
                  bakingItems.filter(([name]) => completedCookies.has(name))
                    .length
                }{" "}
                of {bakingItems.length} types completed
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
                  width: `${
                    bakingItems.length > 0
                      ? (bakingItems.filter(([name]) =>
                          completedCookies.has(name)
                        ).length /
                          bakingItems.length) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BakingQueueSection;
