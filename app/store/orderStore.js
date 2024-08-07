//file: \app\store\orderStore.js

import { create } from "zustand";

const useOrderStore = create((set) => ({
  orders: [], // Store the list of orders
  addOrder: (order) => set((state) => ({ orders: [...state.orders, order] })), // Add new order to the list
  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((order) => (order._id === orderId ? { ...order, status } : order)), // Update the status of a specific order
    })),
  setOrders: (orders) => set({ orders }), // Setter for the list of orders
}));

export default useOrderStore;
