import { create } from "zustand";

const useOrderQueueStore = create((set, get) => ({
  orders: [],

  addToOrderQueue: (order) =>
    set((state) => {
      const newOrders = [...state.orders, { ...order, queuePosition: state.orders.length + 1 }];
      return { orders: newOrders };
    }),

  updateOrderStatus: (orderId, newStatus) =>
    set((state) => {
      const updatedOrders = state.orders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      );

      // If the order is served, remove it from the queue and update positions
      if (newStatus === "served") {
        const servedOrderIndex = updatedOrders.findIndex((order) => order._id === orderId);
        updatedOrders.splice(servedOrderIndex, 1);

        // Update queue positions
        updatedOrders.forEach((order, index) => {
          order.queuePosition = index + 1;
        });
      }

      return { orders: updatedOrders };
    }),

  getActiveOrders: () => get().orders.filter((order) => order.status !== "served"),

  getOrderPosition: (orderId) => {
    const order = get().orders.find((order) => order._id === orderId);
    return order ? order.queuePosition : null;
  },
}));

export default useOrderQueueStore;
