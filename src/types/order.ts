// types/order.ts
export type OrderStatus =
  | "pending"
  | "baking"
  | "ready"
  | "packed"
  | "delivered";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  tag?: string;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  deliveryMethod: "pickup" | "shipping";
  createdAt: Date;
  deliveryDate: Date;
  statusHistory?: Array<{
    status: OrderStatus;
    timestamp: Date;
    updatedBy?: string;
  }>;
}

export interface BakingQueueItem {
  quantity: number;
  orders: number;
  emoji: string;
  orderIds: string[];
  customerNames: string[];
  completed: boolean;
}

export type BakingQueue = Record<string, BakingQueueItem>;

// utils/orderStatusUtils.ts
export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "pending",
  "baking",
  "ready",
  "packed",
  "delivered",
];

export const getNextStatus = (
  currentStatus: OrderStatus
): OrderStatus | null => {
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(currentStatus);
  if (
    currentIndex === -1 ||
    currentIndex === ORDER_STATUS_SEQUENCE.length - 1
  ) {
    return null;
  }
  return ORDER_STATUS_SEQUENCE[currentIndex + 1];
};

export const getPreviousStatus = (
  currentStatus: OrderStatus
): OrderStatus | null => {
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(currentStatus);
  if (currentIndex <= 0) {
    return null;
  }
  return ORDER_STATUS_SEQUENCE[currentIndex - 1];
};

export const canAdvanceStatus = (status: OrderStatus): boolean => {
  return getNextStatus(status) !== null;
};

export const canRevertStatus = (status: OrderStatus): boolean => {
  return getPreviousStatus(status) !== null;
};

// Check if order can be auto-updated to 'baking' status
export const canOrderStartBaking = (
  order: Order,
  completedCookies: Set<string>
): boolean => {
  if (order.status !== "pending") return false;

  // Get unique cookie names from the order
  const orderCookieNames = [...new Set(order.items.map((item) => item.name))];

  // Check if all required cookies are completed
  return orderCookieNames.every((cookieName) =>
    completedCookies.has(cookieName)
  );
};

// Update orders based on completed baking tasks
export const getOrdersToUpdateAfterBaking = (
  orders: Order[],
  completedCookies: Set<string>
): Order[] => {
  return orders.filter((order) => canOrderStartBaking(order, completedCookies));
};

export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "baking":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "ready":
      return "text-green-600 bg-green-50 border-green-200";
    case "packed":
      return "text-purple-600 bg-purple-50 border-purple-200";
    case "delivered":
      return "text-gray-600 bg-gray-50 border-gray-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

export const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "Clock";
    case "baking":
      return "ChefHat";
    case "ready":
      return "CheckCircle";
    case "packed":
      return "Package";
    case "delivered":
      return "Truck";
    default:
      return "AlertCircle";
  }
};