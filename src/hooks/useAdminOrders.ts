// src/hooks/useAdminOrders.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Order,
  OrderStatus,
  OrderFilters,
  OrderSortField,
  SortDirection,
} from "@/types/order";

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface UseAdminOrdersParams {
  page?: number;
  limit?: number;
  filters?: OrderFilters;
  sortField?: OrderSortField;
  sortDirection?: SortDirection;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseAdminOrdersReturn {
  orders: Order[];
  pagination: OrdersResponse["pagination"] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    notes?: string
  ) => Promise<void>;
  bulkUpdateStatus: (
    orderIds: string[],
    newStatus: OrderStatus,
    notes?: string
  ) => Promise<void>;
  cancelOrder: (orderId: string, reason?: string) => Promise<void>;
  getOrderById: (orderId: string) => Promise<Order | null>;
  // Statistics and analytics
  getStatusCounts: () => Record<string, number>;
  getPaymentStatusCounts: () => Record<string, number>;
  getDeliveryMethodCounts: () => Record<string, number>;
  getTotalRevenue: () => number;
  getUniqueCustomers: () => number;
  // Real-time updates
  lastUpdated: Date | null;
}

export const useAdminOrders = (
  params: UseAdminOrdersParams = {}
): UseAdminOrdersReturn => {
  const {
    page = 1,
    limit = 50,
    filters = {},
    sortField = "createdAt",
    sortDirection = "desc",
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
  } = params;

  // Memoize the filter parameters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters.status,
    filters.paymentStatus,
    filters.deliveryMethod,
    filters.search,
    filters.dateFrom?.getTime(),
    filters.dateTo?.getTime(),
  ]);

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<OrdersResponse["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(memoizedFilters.status && memoizedFilters.status !== "all" && { status: memoizedFilters.status }),
        ...(memoizedFilters.paymentStatus && memoizedFilters.paymentStatus !== "all" && { paymentStatus: memoizedFilters.paymentStatus }),
        ...(memoizedFilters.deliveryMethod && memoizedFilters.deliveryMethod !== "all" && { deliveryMethod: memoizedFilters.deliveryMethod }),
        ...(memoizedFilters.search && { search: memoizedFilters.search }),
        ...(memoizedFilters.dateFrom && { dateFrom: memoizedFilters.dateFrom.toISOString() }),
        ...(memoizedFilters.dateTo && { dateTo: memoizedFilters.dateTo.toISOString() }),
      });

      const response = await fetch(`/api/admin/orders?${searchParams}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch orders");
      }

      const data: OrdersResponse = await response.json();

      // Transform dates from strings to Date objects
      const transformedOrders = data.orders.map((order) => ({
        ...order,
        createdAt: new Date(order.createdAt),
        updatedAt: new Date(order.updatedAt),
        deliveryDate: order.deliveryDate ? new Date(order.deliveryDate) : undefined,
        statusHistory: order.statusHistory.map((history) => ({
          ...history,
          timestamp: new Date(history.timestamp),
        })),
      }));

      setOrders(transformedOrders);
      setPagination(data.pagination);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, memoizedFilters, sortField, sortDirection]);

  // Update single order status
  const updateOrderStatus = useCallback(
    async (
      orderId: string,
      newStatus: OrderStatus,
      notes?: string
    ): Promise<void> => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            statusNotes: notes || `Status updated to ${newStatus}`,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update order status");
        }

        // Refresh orders to get updated data
        await fetchOrders();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update order status";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [fetchOrders]
  );

  // Bulk update order statuses
  const bulkUpdateStatus = useCallback(
    async (
      orderIds: string[],
      newStatus: OrderStatus,
      notes?: string
    ): Promise<void> => {
      try {
        const updatePromises = orderIds.map((orderId) =>
          fetch(`/api/admin/orders/${orderId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: newStatus,
              statusNotes: notes || `Bulk status update to ${newStatus}`,
            }),
          })
        );

        const responses = await Promise.all(updatePromises);

        // Check if any requests failed
        const failedRequests = responses.filter((response) => !response.ok);
        if (failedRequests.length > 0) {
          throw new Error(`Failed to update ${failedRequests.length} orders`);
        }

        // Refresh orders
        await fetchOrders();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to bulk update orders";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [fetchOrders]
  );

  // Cancel order
  const cancelOrder = useCallback(
    async (orderId: string, reason?: string): Promise<void> => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "cancelled",
            statusNotes: reason || "Order cancelled by admin",
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to cancel order");
        }

        await fetchOrders();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to cancel order";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    },
    [fetchOrders]
  );

  // Get single order by ID
  const getOrderById = useCallback(
    async (orderId: string): Promise<Order | null> => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}`);

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch order");
        }

        const data = await response.json();

        // Transform dates
        const transformedOrder = {
          ...data.order,
          createdAt: new Date(data.order.createdAt),
          updatedAt: new Date(data.order.updatedAt),
          deliveryDate: data.order.deliveryDate
            ? new Date(data.order.deliveryDate)
            : undefined,
          statusHistory: data.order.statusHistory.map((history: any) => ({
            ...history,
            timestamp: new Date(history.timestamp),
          })),
        };

        return transformedOrder;
      } catch (err) {
        console.error("Error fetching order by ID:", err);
        return null;
      }
    },
    []
  );

  // Analytics functions
  const getStatusCounts = useCallback((): Record<string, number> => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);

  const getPaymentStatusCounts = useCallback((): Record<string, number> => {
    return orders.reduce((acc, order) => {
      acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);

  const getDeliveryMethodCounts = useCallback((): Record<string, number> => {
    return orders.reduce((acc, order) => {
      acc[order.deliveryMethod] = (acc[order.deliveryMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);

  const getTotalRevenue = useCallback((): number => {
    return orders
      .filter((order) => order.paymentStatus === "paid")
      .reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  const getUniqueCustomers = useCallback((): number => {
    return new Set(orders.map((order) => order.email)).size;
  }, [orders]);

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;
      try {
        await fetchOrders();
      } catch (error) {
        console.error('Error in auto-refresh:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up auto-refresh if enabled
    if (autoRefresh && refreshInterval > 0) {
      // Ensure minimum refresh interval of 30 seconds
      const safeInterval = Math.max(refreshInterval, 30000);
      intervalId = setInterval(fetchData, safeInterval);
    }

    // Cleanup function
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchOrders, autoRefresh, refreshInterval]);

  return {
    orders,
    pagination,
    loading,
    error,
    refetch: fetchOrders,
    updateOrderStatus,
    bulkUpdateStatus,
    cancelOrder,
    getOrderById,
    getStatusCounts,
    getPaymentStatusCounts,
    getDeliveryMethodCounts,
    getTotalRevenue,
    getUniqueCustomers,
    lastUpdated,
  };
};

// Helper hook for dashboard-specific order management
export const useAdminDashboardOrders = () => {
  const {
    orders,
    loading,
    error,
    refetch,
    updateOrderStatus,
    bulkUpdateStatus,
    getStatusCounts,
    getTotalRevenue,
    getUniqueCustomers,
    lastUpdated,
  } = useAdminOrders({
    limit: 100, // Get more orders for dashboard overview
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes for dashboard
  });

  // Memoize dashboard-specific helper functions
  const getPendingOrders = useMemo(() => {
    return orders.filter(
      (order) => order.status === "pending" && order.paymentStatus === "paid"
    );
  }, [orders]);

  const getActiveOrders = useMemo(() => {
    return orders.filter((order) =>
      [
        "pending",
        "confirmed",
        "preparing",
        "ready",
        "out_for_delivery",
      ].includes(order.status)
    );
  }, [orders]);

  const getRecentOrders = useCallback(
    (limit: number = 10) => {
      return orders
        .filter((order) => order.paymentStatus === "paid")
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limit);
    },
    [orders]
  );

  const startBakingAll = useCallback(async () => {
    const pendingOrders = getPendingOrders;
    if (pendingOrders.length === 0) {
      throw new Error("No pending orders to start baking");
    }

    await bulkUpdateStatus(
      pendingOrders.map((order) => order.id),
      "confirmed",
      "Bulk baking started by admin"
    );
  }, [getPendingOrders, bulkUpdateStatus]);

  return {
    orders,
    loading,
    error,
    refetch,
    updateOrderStatus,
    bulkUpdateStatus,
    getStatusCounts,
    getTotalRevenue,
    getUniqueCustomers,
    getPendingOrders,
    getActiveOrders,
    getRecentOrders,
    startBakingAll,
    lastUpdated,
  };
};

// Hook for order analytics and reporting
export const useOrderAnalytics = (orders: Order[]) => {
  const analytics = useMemo(() => {
    const totalRevenue = orders
      .filter((order) => order.paymentStatus === "paid")
      .reduce((sum, order) => sum + order.total, 0);

    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Revenue by status
    const revenueByStatus = orders.reduce((acc, order) => {
      if (order.paymentStatus === "paid") {
        acc[order.status] = (acc[order.status] || 0) + order.total;
      }
      return acc;
    }, {} as Record<string, number>);

    // Popular items
    const itemFrequency = orders.reduce((acc, order) => {
      order.items.forEach((item) => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
      });
      return acc;
    }, {} as Record<string, number>);

    const popularItems = Object.entries(itemFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    // Monthly revenue trend
    const monthlyRevenue = orders
      .filter((order) => order.paymentStatus === "paid")
      .reduce((acc, order) => {
        const month = order.createdAt.getMonth();
        acc[month] = (acc[month] || 0) + order.total;
        return acc;
      }, {} as Record<number, number>);

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      revenueByStatus,
      popularItems,
      monthlyRevenue,
      uniqueCustomers: new Set(orders.map((o) => o.email)).size,
    };
  }, [orders]);

  return analytics;
};