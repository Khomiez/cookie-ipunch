// src/components/admin/BakingSummarySection.tsx - Enhanced with real data
"use client";

import React, { useMemo } from "react";
import { ChefHat, Package, Clock, Users, TrendingUp } from "lucide-react";
import { Order, BakingQueue, OrderStatus } from "@/types/order";

interface BakingSummarySectionProps {
  orders: Order[];
  onStartBaking?: () => void;
  isProcessing?: boolean;
}

const BakingSummarySection: React.FC<BakingSummarySectionProps> = ({
  orders,
  onStartBaking,
  isProcessing = false,
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
    if (name.includes("macaron")) return "🌈";
    if (name.includes("muffin")) return "🧁";
    return "🍪";
  };

  // Calculate baking summary from pending orders only
  const bakingQueue = useMemo((): BakingQueue => {
    return orders
      .filter(
        (order) => order.status === "pending" && order.paymentStatus === "paid"
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
              completed: false,
            };
          }
        });
        return acc;
      }, {} as BakingQueue);
  }, [orders]);

  // Calculate summary statistics
  const bakingItems = Object.entries(bakingQueue);
  const totalBakingItems = Object.values(bakingQueue).reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const pendingOrdersCount = orders.filter(
    (order) => order.status === "pending" && order.paymentStatus === "paid"
  ).length;
  const totalCustomers = new Set(
    orders
      .filter(
        (order) => order.status === "pending" && order.paymentStatus === "paid"
      )
      .map((order) => order.customerName)
  ).size;

  // Calculate estimated baking time (mock calculation)
  const estimatedBakingTime = Math.ceil(totalBakingItems * 0.5); // 30 minutes per batch of items

  // Get next delivery date (typically Friday)
  const getNextDeliveryDate = (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 5 = Friday

    let daysUntilFriday;
    if (dayOfWeek <= 5) {
      daysUntilFriday = 5 - dayOfWeek;
    } else {
      daysUntilFriday = 6; // Next Friday
    }

    if (dayOfWeek === 5 && today.getHours() >= 12) {
      daysUntilFriday = 7; // Next Friday if it's Friday afternoon
    }

    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + daysUntilFriday);

    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="rounded-2xl p-6 shadow-sm border border-white/50 mb-6"
      style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
    >
      {/* Header with Action Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: "#eaf7ff" }}
          >
            <ChefHat size={24} style={{ color: "#7f6957" }} />
          </div>
          <div>
            <h3
              className="text-xl font-bold comic-text"
              style={{ color: "#7f6957" }}
            >
              Baking Queue
            </h3>
            <p
              className="text-sm opacity-75 comic-text"
              style={{ color: "#7f6957" }}
            >
              Ready for delivery: {getNextDeliveryDate()}
            </p>
          </div>
        </div>

        {pendingOrdersCount > 0 && onStartBaking && (
          <button
            onClick={onStartBaking}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-6 py-3 rounded-2xl text-white font-bold comic-text hover:scale-105 transition-transform disabled:opacity-50 disabled:transform-none shadow-lg"
            style={{ backgroundColor: "#7f6957" }}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <ChefHat size={20} />
                <span>Start Baking ({pendingOrdersCount})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div
          className="text-center p-3 rounded-xl"
          style={{ backgroundColor: "#fefbdc" }}
        >
          <div
            className="text-2xl font-bold comic-text"
            style={{ color: "#7f6957" }}
          >
            {pendingOrdersCount}
          </div>
          <div
            className="text-xs opacity-75 comic-text"
            style={{ color: "#7f6957" }}
          >
            Orders
          </div>
        </div>

        <div
          className="text-center p-3 rounded-xl"
          style={{ backgroundColor: "#fefbdc" }}
        >
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
            Items
          </div>
        </div>

        <div
          className="text-center p-3 rounded-xl"
          style={{ backgroundColor: "#fefbdc" }}
        >
          <div
            className="text-2xl font-bold comic-text"
            style={{ color: "#7f6957" }}
          >
            {totalCustomers}
          </div>
          <div
            className="text-xs opacity-75 comic-text"
            style={{ color: "#7f6957" }}
          >
            Customers
          </div>
        </div>

        <div
          className="text-center p-3 rounded-xl"
          style={{ backgroundColor: "#fefbdc" }}
        >
          <div
            className="text-2xl font-bold comic-text"
            style={{ color: "#7f6957" }}
          >
            {estimatedBakingTime}h
          </div>
          <div
            className="text-xs opacity-75 comic-text"
            style={{ color: "#7f6957" }}
          >
            Est. Time
          </div>
        </div>
      </div>

      {bakingItems.length === 0 ? (
        <div className="text-center py-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "#eaf7ff" }}
          >
            <Package size={32} style={{ color: "#7f6957" }} />
          </div>
          <h4
            className="text-lg font-bold mb-2 comic-text"
            style={{ color: "#7f6957" }}
          >
            All caught up! 🎉
          </h4>
          <p
            className="text-sm opacity-75 comic-text"
            style={{ color: "#7f6957" }}
          >
            No pending orders to bake right now. Great job!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Baking Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {bakingItems
              .sort(([, a], [, b]) => b.quantity - a.quantity)
              .map(([cookieName, data], index) => {
                const isTopItem = index === 0;
                const urgencyLevel =
                  data.quantity > 10
                    ? "high"
                    : data.quantity > 5
                    ? "medium"
                    : "low";

                return (
                  <div
                    key={cookieName}
                    className="relative p-4 rounded-xl border-2 transition-all hover:shadow-md"
                    style={{
                      backgroundColor: isTopItem ? "#eaf7ff" : "#fefbdc",
                      borderColor: isTopItem
                        ? "#7f6957"
                        : urgencyLevel === "high"
                        ? "#f59e0b"
                        : "#e5e7eb",
                      borderStyle: urgencyLevel === "high" ? "dashed" : "solid",
                    }}
                  >
                    {/* Priority Badge */}
                    {isTopItem && (
                      <div
                        className="absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: "#7f6957" }}
                      >
                        PRIORITY
                      </div>
                    )}

                    {/* Urgency Indicator */}
                    {urgencyLevel === "high" && (
                      <div
                        className="absolute -top-1 -left-1 w-3 h-3 rounded-full"
                        style={{ backgroundColor: "#f59e0b" }}
                        title="High quantity - prioritize this item"
                      />
                    )}

                    <div className="flex items-center space-x-3">
                      {/* Cookie Icon */}
                      <div className="text-3xl flex-shrink-0">{data.emoji}</div>

                      {/* Cookie Info */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className="text-sm font-bold comic-text truncate"
                          style={{ color: "#7f6957" }}
                          title={cookieName}
                        >
                          {cookieName}
                        </h4>

                        <div className="flex items-center justify-between mt-1">
                          <span
                            className="text-xs opacity-75 comic-text"
                            style={{ color: "#7f6957" }}
                          >
                            {data.orders} order{data.orders !== 1 ? "s" : ""}
                          </span>
                          <div
                            className="px-3 py-1 rounded-full text-sm font-bold text-white"
                            style={{
                              backgroundColor:
                                urgencyLevel === "high" ? "#f59e0b" : "#7f6957",
                            }}
                          >
                            {data.quantity}
                          </div>
                        </div>

                        {/* Customer Preview */}
                        <div className="mt-2">
                          <div
                            className="text-xs opacity-60 comic-text truncate"
                            style={{ color: "#7f6957" }}
                            title={data.customerNames.join(", ")}
                          >
                            For: {data.customerNames.slice(0, 2).join(", ")}
                            {data.customerNames.length > 2 &&
                              ` +${data.customerNames.length - 2} more`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Baking Instructions */}
          <div
            className="p-4 rounded-xl border-2 border-dashed"
            style={{ borderColor: "#7f6957", backgroundColor: "#eaf7ff" }}
          >
            <div className="flex items-start space-x-3">
              <Clock
                size={20}
                style={{ color: "#7f6957" }}
                className="mt-1 flex-shrink-0"
              />
              <div className="flex-1">
                <h5
                  className="font-bold text-sm comic-text mb-2"
                  style={{ color: "#7f6957" }}
                >
                  Baking Instructions 👨‍🍳
                </h5>
                <div
                  className="text-sm space-y-1 comic-text opacity-80"
                  style={{ color: "#7f6957" }}
                >
                  <p>• Start with priority items (highest quantity first)</p>
                  <p>
                    • Estimated total baking time: {estimatedBakingTime} hours
                  </p>
                  <p>• All orders must be ready by Friday 2PM for delivery</p>
                  <p>
                    • Click "Start Baking" to move all orders to confirmed
                    status
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-2">
            <div
              className="flex items-center space-x-4 text-xs comic-text opacity-75"
              style={{ color: "#7f6957" }}
            >
              <div className="flex items-center space-x-1">
                <Users size={12} />
                <span>{totalCustomers} customers waiting</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp size={12} />
                <span>
                  {orders
                    .filter(
                      (order) =>
                        order.status === "pending" &&
                        order.paymentStatus === "paid"
                    )
                    .reduce((sum, order) => sum + order.total, 0)
                    .toLocaleString()}
                  .- total value
                </span>
              </div>
            </div>

            {pendingOrdersCount > 0 && (
              <div
                className="text-xs font-medium comic-text"
                style={{ color: "#7f6957" }}
              >
                💡 Tip: Process highest quantity items first for efficiency
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BakingSummarySection;