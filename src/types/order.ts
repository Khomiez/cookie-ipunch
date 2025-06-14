// src/types/order.ts - Updated to match database schema
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  productId: string;
  stripeProductId: string;
  stripePriceId: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  image?: string;
  tag?: string;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

export interface StatusHistory {
  status: OrderStatus;
  timestamp: Date;
  updatedBy?: string;
  notes?: string;
}

export interface Order {
  id: string; // This is the orderId (human-readable)
  _id?: string; // MongoDB ObjectId
  stripeSessionId: string;
  stripePaymentIntentId?: string;
  customerName: string; // Derived from customerDetails.name
  email: string; // Derived from customerDetails.email
  phone: string; // Derived from customerDetails.phone
  customerDetails: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryMethod: "pickup" | "shipping";
  deliveryDate?: Date;
  deliveryTimeSlot?: string;
  createdAt: Date;
  updatedAt: Date;
  customerNotes?: string;
  adminNotes?: string;
  statusHistory: StatusHistory[];
  source: string;
  orderType: string;
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

// Order status flow for admin dashboard
export const ORDER_STATUS_SEQUENCE: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
];

export const getNextStatus = (
  currentStatus: OrderStatus
): OrderStatus | null => {
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(currentStatus);
  if (
    currentIndex === -1 ||
    currentIndex === ORDER_STATUS_SEQUENCE.length - 1 ||
    currentStatus === "cancelled"
  ) {
    return null;
  }
  return ORDER_STATUS_SEQUENCE[currentIndex + 1];
};

export const getPreviousStatus = (
  currentStatus: OrderStatus
): OrderStatus | null => {
  const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(currentStatus);
  if (currentIndex <= 0 || currentStatus === "cancelled") {
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

export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "text-orange-600 bg-orange-50 border-orange-200";
    case "confirmed":
      return "text-blue-600 bg-blue-50 border-blue-200";
    case "preparing":
      return "text-purple-600 bg-purple-50 border-purple-200";
    case "ready":
      return "text-green-600 bg-green-50 border-green-200";
    case "out_for_delivery":
      return "text-indigo-600 bg-indigo-50 border-indigo-200";
    case "delivered":
      return "text-gray-600 bg-gray-50 border-gray-200";
    case "cancelled":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

export const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "Clock";
    case "confirmed":
      return "CheckCircle";
    case "preparing":
      return "ChefHat";
    case "ready":
      return "Package";
    case "out_for_delivery":
      return "Truck";
    case "delivered":
      return "CheckCircle";
    case "cancelled":
      return "XCircle";
    default:
      return "AlertCircle";
  }
};

// Helper functions for order management
export const getOrdersByStatus = (
  orders: Order[],
  status: OrderStatus
): Order[] => {
  return orders.filter((order) => order.status === status);
};

export const getPendingOrders = (orders: Order[]): Order[] => {
  return getOrdersByStatus(orders, "pending");
};

export const getActiveOrders = (orders: Order[]): Order[] => {
  return orders.filter((order) =>
    ["pending", "confirmed", "preparing", "ready", "out_for_delivery"].includes(
      order.status
    )
  );
};

export const calculateOrderMetrics = (orders: Order[]) => {
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((order) => order.paymentStatus === "paid")
    .reduce((sum, order) => sum + order.total, 0);

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentStatusCounts = orders.reduce((acc, order) => {
    acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deliveryMethodCounts = orders.reduce((acc, order) => {
    acc[order.deliveryMethod] = (acc[order.deliveryMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueCustomers = new Set(orders.map((order) => order.email)).size;

  return {
    totalOrders,
    totalRevenue,
    statusCounts,
    paymentStatusCounts,
    deliveryMethodCounts,
    uniqueCustomers,
    averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
  };
};

// Type guards for runtime type checking
export const isValidOrderStatus = (status: string): status is OrderStatus => {
  return (
    ORDER_STATUS_SEQUENCE.includes(status as OrderStatus) ||
    status === "cancelled"
  );
};

export const isValidPaymentStatus = (
  status: string
): status is PaymentStatus => {
  return ["pending", "paid", "failed", "refunded"].includes(status);
};

// Order filtering and sorting utilities
export interface OrderFilters {
  status?: OrderStatus | "all";
  paymentStatus?: PaymentStatus | "all";
  deliveryMethod?: "pickup" | "shipping" | "all";
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export const filterOrders = (
  orders: Order[],
  filters: OrderFilters
): Order[] => {
  let filtered = [...orders];

  if (filters.status && filters.status !== "all") {
    filtered = filtered.filter((order) => order.status === filters.status);
  }

  if (filters.paymentStatus && filters.paymentStatus !== "all") {
    filtered = filtered.filter(
      (order) => order.paymentStatus === filters.paymentStatus
    );
  }

  if (filters.deliveryMethod && filters.deliveryMethod !== "all") {
    filtered = filtered.filter(
      (order) => order.deliveryMethod === filters.deliveryMethod
    );
  }

  if (filters.dateFrom) {
    filtered = filtered.filter((order) => order.createdAt >= filters.dateFrom!);
  }

  if (filters.dateTo) {
    filtered = filtered.filter((order) => order.createdAt <= filters.dateTo!);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (order) =>
        order.id.toLowerCase().includes(searchLower) ||
        order.customerName.toLowerCase().includes(searchLower) ||
        order.email.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
};

export type OrderSortField = "createdAt" | "total" | "status" | "customerName";
export type SortDirection = "asc" | "desc";

export const sortOrders = (
  orders: Order[],
  field: OrderSortField,
  direction: SortDirection = "desc"
): Order[] => {
  const sorted = [...orders].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case "createdAt":
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
      case "total":
        comparison = a.total - b.total;
        break;
      case "status":
        const statusOrder = ORDER_STATUS_SEQUENCE.concat(["cancelled"]);
        comparison =
          statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        break;
      case "customerName":
        comparison = a.customerName.localeCompare(b.customerName);
        break;
    }

    return direction === "asc" ? comparison : -comparison;
  });

  return sorted;
};
