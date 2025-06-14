// components/admin/BakingSummarySection.tsx
"use client";

import React, { useMemo } from "react";
import { ChefHat, Package, Clock } from "lucide-react";
import { Order, BakingQueue } from "@/types/order";

interface BakingSummarySectionProps {
  orders: Order[];
}

const BakingSummarySection: React.FC<BakingSummarySectionProps> = ({
  orders,
}) => {
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

  // Calculate baking summary from pending orders only
  const bakingQueue = useMemo((): BakingQueue => {
    return orders
      .filter((order) => order.status === "pending")
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
              completed: false, // Not used in this read-only version
            };
          }
        });
        return acc;
      }, {} as BakingQueue);
  }, [orders]);

  const bakingItems = Object.entries(bakingQueue);
  const totalBakingItems = Object.values(bakingQueue).reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const pendingOrdersCount = orders.filter(
    (order) => order.status === "pending"
  ).length;

  return (
    <div
      className="rounded-2xl p-4 shadow-sm border border-white/50 mb-6"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <ChefHat size={18} style={{ color: "#7f6957" }} />
          <h3
            className="text-base font-bold comic-text"
            style={{ color: "#7f6957" }}
          >
            Baking Summary
          </h3>
          <div
            className="px-2 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: "#7f6957" }}
          >
            {totalBakingItems}
          </div>
        </div>
        <span
          className="text-xs comic-text opacity-75"
          style={{ color: "#7f6957" }}
        >
          {pendingOrdersCount} pending orders
        </span>
      </div>

      {bakingItems.length === 0 ? (
        <div className="text-center py-6">
          <div
            className="w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center"
            style={{ backgroundColor: "#eaf7ff" }}
          >
            <Package size={24} style={{ color: "#7f6957" }} />
          </div>
          <p
            className="text-sm font-medium comic-text"
            style={{ color: "#7f6957" }}
          >
            No pending orders! 🎉
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Compact Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {bakingItems
              .sort(([, a], [, b]) => b.quantity - a.quantity)
              .map(([cookieName, data], index) => {
                return (
                  <div
                    key={cookieName}
                    className="flex items-center space-x-2 p-2 rounded-lg border"
                    style={{
                      backgroundColor: index === 0 ? "#eaf7ff" : "#fefbdc",
                      borderColor: index === 0 ? "#7f6957" : "#e5e7eb",
                      borderWidth: index === 0 ? "2px" : "1px",
                    }}
                  >
                    {/* Cookie Icon */}
                    <div className="text-lg flex-shrink-0">
                      {data.emoji}
                    </div>

                    {/* Cookie Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4
                          className="text-sm font-bold comic-text truncate"
                          style={{ color: "#7f6957" }}
                          title={cookieName}
                        >
                          {cookieName}
                        </h4>
                        {index === 0 && (
                          <div
                            className="px-1 py-0.5 rounded text-xs font-bold"
                            style={{ backgroundColor: "#fef3c7", color: "#d97706" }}
                          >
                            TOP
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-xs opacity-75 comic-text"
                          style={{ color: "#7f6957" }}
                        >
                          {data.orders} order{data.orders !== 1 ? "s" : ""}
                        </span>
                        <div
                          className="px-2 py-0.5 rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: "#7f6957" }}
                        >
                          {data.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Quick Summary Row */}
          <div
            className="flex items-center justify-between p-2 rounded-lg border-t mt-3 pt-3"
            style={{ borderColor: "rgba(127, 105, 87, 0.1)" }}
          >
            <div className="flex items-center space-x-4 text-xs comic-text opacity-75" style={{ color: "#7f6957" }}>
              <div className="flex items-center space-x-1">
                <Clock size={12} />
                <span>Ready to bake</span>
              </div>
              <span>Use "Bake All" to start all orders</span>
            </div>
            <div className="text-xs font-medium comic-text" style={{ color: "#7f6957" }}>
              Total: {totalBakingItems} items
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BakingSummarySection;