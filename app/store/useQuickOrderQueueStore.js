// file: app/store/useQuickOrderQueueStore.js
import { create } from "zustand";

const useQuickOrderQueueStore = create((set, get) => ({
  orderQueue: [],

  initializeOrderQueue: (orders) => {
    console.log("Initializing order queue:", orders);
    set({ orderQueue: orders.sort((a, b) => a.orderNumber - b.orderNumber) });
  },

  addToOrderQueue: (order) => {
    console.log("Adding new order to queue:", order);
    set((state) => {
      const newQueue = [...state.orderQueue, order];
      console.log("New queue state:", newQueue);
      return { orderQueue: newQueue.sort((a, b) => a.orderNumber - b.orderNumber) };
    });
  },

  updateOrderStatus: (orderId, newStatus) => {
    console.log("Updating order status:", orderId, newStatus);
    set((state) => ({
      orderQueue: state.orderQueue.map((order) => {
        if (order._id === orderId) {
          console.log("Order status updated:", { ...order, status: newStatus });
          return { ...order, status: newStatus };
        }
        return order;
      }),
    }));
  },

  removeFromQueue: (orderId) => {
    console.log("Removing order from queue:", orderId);
    set((state) => ({
      orderQueue: state.orderQueue.filter((order) => order._id !== orderId),
    }));
  },

  reorderQueue: () => {
    console.log("Reordering queue");
    set((state) => ({
      orderQueue: state.orderQueue.sort((a, b) => a.orderNumber - b.orderNumber),
    }));
  },

  getNextOrderNumber: () => {
    const state = get();
    const today = new Date().setHours(0, 0, 0, 0);
    const todayOrders = state.orderQueue.filter(
      (order) => new Date(order.createdAt).setHours(0, 0, 0, 0) === today
    );
    const maxOrderNumber =
      todayOrders.length > 0 ? Math.max(...todayOrders.map((order) => order.orderNumber)) : 9;
    const nextOrderNumber = maxOrderNumber + 1;
    console.log("Next order number:", nextOrderNumber);
    return nextOrderNumber;
  },

  getTodayTotalSales: () => {
    const state = get();
    const today = new Date().setHours(0, 0, 0, 0);
    const totalSales = state.orderQueue
      .filter((order) => new Date(order.createdAt).setHours(0, 0, 0, 0) === today)
      .reduce((total, order) => total + order.totalAmount, 0);
    console.log("Today's total sales:", totalSales);
    return totalSales;
  },
}));

export default useQuickOrderQueueStore;
