// components/admin/OrderStatusControls.tsx
"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  OrderStatus,
  canAdvanceStatus,
  canRevertStatus,
  getNextStatus,
  getPreviousStatus,
} from "@/types/order";

interface OrderStatusControlsProps {
  orderId: string;
  currentStatus: OrderStatus;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

const OrderStatusControls: React.FC<OrderStatusControlsProps> = ({
  orderId,
  currentStatus,
  onStatusChange,
  disabled = false,
  size = "md",
}) => {
  const canAdvance = canAdvanceStatus(currentStatus);
  const canRevert = canRevertStatus(currentStatus);
  const nextStatus = getNextStatus(currentStatus);
  const previousStatus = getPreviousStatus(currentStatus);

  const buttonSize = size === "sm" ? "p-1" : "p-2";
  const iconSize = size === "sm" ? 14 : 16;

  const getStatusActionText = (status: OrderStatus | null): string => {
    if (!status) return "";
    switch (status) {
      case "baking":
        return "Start Baking";
      case "ready":
        return "Mark Ready";
      case "packed":
        return "Mark Packed";
      case "delivered":
        return "Mark Delivered";
      default:
        return `Move to ${status}`;
    }
  };

  const getRevertActionText = (status: OrderStatus | null): string => {
    if (!status) return "";
    switch (status) {
      case "pending":
        return "Back to Pending";
      case "baking":
        return "Back to Baking";
      case "ready":
        return "Back to Ready";
      case "packed":
        return "Back to Packed";
      default:
        return `Revert to ${status}`;
    }
  };

  const handleAdvance = () => {
    if (nextStatus && !disabled) {
      onStatusChange(orderId, nextStatus);
    }
  };

  const handleRevert = () => {
    if (previousStatus && !disabled) {
      onStatusChange(orderId, previousStatus);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Revert Button */}
      <button
        onClick={handleRevert}
        disabled={!canRevert || disabled}
        className={`${buttonSize} hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all`}
        title={
          canRevert
            ? getRevertActionText(previousStatus)
            : "Cannot revert further"
        }
      >
        <ChevronLeft
          size={iconSize}
          style={{ color: canRevert && !disabled ? "#7f6957" : "#9ca3af" }}
        />
      </button>

      {/* Advance Button */}
      <button
        onClick={handleAdvance}
        disabled={!canAdvance || disabled}
        className={`${buttonSize} hover:bg-gray-100 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all`}
        title={canAdvance ? getStatusActionText(nextStatus) : "Order completed"}
      >
        <ChevronRight
          size={iconSize}
          style={{ color: canAdvance && !disabled ? "#7f6957" : "#9ca3af" }}
        />
      </button>
    </div>
  );
};

export default OrderStatusControls;