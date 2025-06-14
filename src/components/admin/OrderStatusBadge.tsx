// components/admin/OrderStatusBadge.tsx
"use client";

import React from "react";
import {
  Clock,
  ChefHat,
  CheckCircle,
  Package,
  Truck,
  AlertCircle,
} from "lucide-react";
import { OrderStatus, getStatusColor } from "@/types/order";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = "md",
  showIcon = true,
}) => {
  const getStatusIcon = (status: OrderStatus) => {
    const iconSize = size === "sm" ? 12 : size === "lg" ? 18 : 14;

    switch (status) {
      case "pending":
        return <Clock size={iconSize} />;
      case "baking":
        return <ChefHat size={iconSize} />;
      case "ready":
        return <CheckCircle size={iconSize} />;
      case "packed":
        return <Package size={iconSize} />;
      case "delivered":
        return <Truck size={iconSize} />;
      default:
        return <AlertCircle size={iconSize} />;
    }
  };

  const getStatusText = (status: OrderStatus): string => {
    switch (status) {
      case "pending":
        return "Pending";
      case "baking":
        return "Baking";
      case "ready":
        return "Ready";
      case "packed":
        return "Packed";
      case "delivered":
        return "Delivered";
      default:
        return "Unknown";
    }
  };

  const getSizeClasses = (size: string): string => {
    switch (size) {
      case "sm":
        return "px-2 py-1 text-xs";
      case "lg":
        return "px-4 py-2 text-base";
      default:
        return "px-3 py-1 text-sm";
    }
  };

  return (
    <div
      className={`inline-flex items-center space-x-2 rounded-full border font-medium comic-text ${getStatusColor(
        status
      )} ${getSizeClasses(size)}`}
    >
      {showIcon && getStatusIcon(status)}
      <span className="capitalize">{getStatusText(status)}</span>
    </div>
  );
};

export default OrderStatusBadge;