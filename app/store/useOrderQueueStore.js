import create from "zustand";

const useOrderQueueStore = create((set) => ({
  orderQueue: [],
  initializeOrderQueue: (orders) => set({ orderQueue: orders }),
  addToOrderQueue: (order) => set((state) => ({ orderQueue: [...state.orderQueue, order] })),
  updateOrderStatus: (orderId, newStatus) =>
    set((state) => ({
      orderQueue: state.orderQueue.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ),
    })),
  removeFromQueue: (orderId) =>
    set((state) => ({
      orderQueue: state.orderQueue.filter((order) => order._id !== orderId),
    })),
  reorderQueue: () =>
    set((state) => ({
      orderQueue: state.orderQueue.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    })),
}));

export default useOrderQueueStore;
