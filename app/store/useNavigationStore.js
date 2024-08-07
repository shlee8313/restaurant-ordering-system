//file: \app\store\useNavigationStore.js

import { create } from "zustand";

const useNavigationStore = create((set) => ({
  currentPage: "Admin Dashboard",
  setCurrentPage: (page) => set({ currentPage: page }),
}));

export default useNavigationStore;
