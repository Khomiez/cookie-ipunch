// hooks/useOrderStatusManagement.ts
import { useState, useCallback, useMemo } from "react";
import { Order, OrderStatus, BakingQueue } from "@/types/order";

interface UseOrderStatusManagementReturn {
  orders: Order[];
  completedCookies: Set<string>;
  bakingQueue: BakingQueue;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  toggleBakingComplete: (cookieName: string) => void;
  getOrdersAffectedByCompletion: (cookieName: string) => Order[];
  resetCompletedCookies: () => void;
  getStatusCounts: () => Record<string, number>;
  getActiveBakingOrders: () => Order[];
  getTotalBakingItems: () => number;
}

export const useOrderStatusManagement = (
  initialOrders: Order[]
): UseOrderStatusManagementReturn => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [completedCookies, setCompletedCookies] = useState<Set<string>>(
    new Set()
  );

  // Calculate baking queue from pending and baking orders
  const bakingQueue = useMemo((): BakingQueue => {
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

  // Check if order can be auto-updated to 'baking' status
  const canOrderStartBaking = useCallback(
    (order: Order, completedCookiesSet: Set<string>): boolean => {
      if (order.status !== "pending") return false;

      // Get unique cookie names from the order
      const orderCookieNames = [
        ...new Set(order.items.map((item) => item.name)),
      ];

      // Check if all required cookies are completed
      return orderCookieNames.every((cookieName) =>
        completedCookiesSet.has(cookieName)
      );
    },
    []
  );

  // Get orders that will be affected by completing a specific cookie
  const getOrdersAffectedByCompletion = useCallback(
    (cookieName: string): Order[] => {
      const tempCompleted = new Set([...completedCookies, cookieName]);
      return orders.filter((order) =>
        canOrderStartBaking(order, tempCompleted)
      );
    },
    [orders, completedCookies, canOrderStartBaking]
  );

  // Update order status with history tracking
  const updateOrderStatus = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
                statusHistory: [
                  ...(order.statusHistory || []),
                  {
                    status: newStatus,
                    timestamp: new Date(),
                    updatedBy: "admin", // In real app, get from session
                  },
                ],
              }
            : order
        )
      );
    },
    []
  );

  // Toggle baking completion with auto-status updates
  const toggleBakingComplete = useCallback(
    (cookieName: string) => {
      const newCompletedCookies = new Set(completedCookies);

      if (completedCookies.has(cookieName)) {
        // Uncomplete the cookie
        newCompletedCookies.delete(cookieName);
        setCompletedCookies(newCompletedCookies);
      } else {
        // Complete the cookie
        newCompletedCookies.add(cookieName);
        setCompletedCookies(newCompletedCookies);

        // Check which orders can now be moved to 'baking' status
        const ordersToUpdate = orders.filter((order) =>
          canOrderStartBaking(order, newCompletedCookies)
        );

        // Auto-update order statuses
        if (ordersToUpdate.length > 0) {
          setOrders((prev) =>
            prev.map((order) => {
              const shouldUpdate = ordersToUpdate.some(
                (o) => o.id === order.id
              );
              return shouldUpdate && order.status === "pending"
                ? {
                    ...order,
                    status: "baking" as OrderStatus,
                    statusHistory: [
                      ...(order.statusHistory || []),
                      {
                        status: "baking" as OrderStatus,
                        timestamp: new Date(),
                        updatedBy: "auto-baking-system",
                      },
                    ],
                  }
                : order;
            })
          );
        }
      }
    },
    [completedCookies, orders, canOrderStartBaking]
  );

  // Reset completed cookies (useful for new baking sessions)
  const resetCompletedCookies = useCallback(() => {
    setCompletedCookies(new Set());
  }, []);

  // Get status counts for analytics
  const getStatusCounts = useCallback((): Record<string, number> => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [orders]);

  // Get active baking orders (pending + baking)
  const getActiveBakingOrders = useCallback((): Order[] => {
    return orders.filter(
      (order) => order.status === "pending" || order.status === "baking"
    );
  }, [orders]);

  // Get total items that need to be baked
  const getTotalBakingItems = useCallback((): number => {
    return Object.values(bakingQueue).reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }, [bakingQueue]);

  return {
    orders,
    completedCookies,
    bakingQueue,
    updateOrderStatus,
    toggleBakingComplete,
    getOrdersAffectedByCompletion,
    resetCompletedCookies,
    getStatusCounts,
    getActiveBakingOrders,
    getTotalBakingItems,
  };
};

// Additional helper hooks for specific use cases

// Hook for real-time order updates (when integrated with WebSocket/SSE)
export const useOrderRealTimeUpdates = (
  orders: Order[],
  onOrderUpdate: (updatedOrder: Order) => void
) => {
  // This would integrate with your real-time system
  // For now, it's just a placeholder structure

  const subscribeToOrderUpdates = useCallback(() => {
    // In real app: connect to WebSocket or Server-Sent Events
    console.log("Subscribing to real-time order updates...");

    // Example WebSocket connection:
    // const ws = new WebSocket('ws://localhost:3001/admin/orders');
    // ws.onmessage = (event) => {
    //   const updatedOrder = JSON.parse(event.data);
    //   onOrderUpdate(updatedOrder);
    // };

    return () => {
      // Cleanup connection
      console.log("Unsubscribing from order updates...");
    };
  }, [onOrderUpdate]);

  return { subscribeToOrderUpdates };
};

// Hook for order analytics and insights
export const useOrderAnalytics = (orders: Order[]) => {
  const analytics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalRevenue / (orders.length || 1);

    // Revenue by status
    const revenueByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + order.total;
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
      .slice(0, 5);

    // Delivery method distribution
    const deliveryMethods = orders.reduce((acc, order) => {
      acc[order.deliveryMethod] = (acc[order.deliveryMethod] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Processing time analytics (mock data for now)
    const avgProcessingTime = {
      pending: "2.5 hours",
      baking: "4.2 hours",
      ready: "1.8 hours",
      packed: "0.5 hours",
    };

    return {
      totalRevenue,
      avgOrderValue,
      revenueByStatus,
      popularItems,
      deliveryMethods,
      avgProcessingTime,
      totalOrders: orders.length,
      uniqueCustomers: new Set(orders.map((o) => o.email)).size,
    };
  }, [orders]);

  return analytics;
};

// Hook for bulk order operations
export const useBulkOrderOperations = (
  orders: Order[],
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void
) => {
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const selectOrder = useCallback((orderId: string) => {
    setSelectedOrders((prev) => new Set([...prev, orderId]));
  }, []);

  const deselectOrder = useCallback((orderId: string) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev);
      newSet.delete(orderId);
      return newSet;
    });
  }, []);

  const selectAllOrders = useCallback((orderIds: string[]) => {
    setSelectedOrders(new Set(orderIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedOrders(new Set());
  }, []);

  const bulkStatusUpdate = useCallback(
    (newStatus: OrderStatus) => {
      selectedOrders.forEach((orderId) => {
        updateOrderStatus(orderId, newStatus);
      });
      clearSelection();
    },
    [selectedOrders, updateOrderStatus, clearSelection]
  );

  const canPerformBulkAction = useCallback(
    (action: string): boolean => {
      if (selectedOrders.size === 0) return false;

      const selectedOrderObjects = orders.filter((o) =>
        selectedOrders.has(o.id)
      );

      switch (action) {
        case "advance":
          return selectedOrderObjects.every((o) => o.status !== "delivered");
        case "revert":
          return selectedOrderObjects.every((o) => o.status !== "pending");
        default:
          return true;
      }
    },
    [selectedOrders, orders]
  );

  return {
    selectedOrders,
    selectOrder,
    deselectOrder,
    selectAllOrders,
    clearSelection,
    bulkStatusUpdate,
    canPerformBulkAction,
  };
};