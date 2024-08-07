//file: \app\store\useSalesStore.js

import create from "zustand";

const useSalesStore = create((set) => ({
  todaySales: 0,
  setTodaySales: (sales) => set({ todaySales: sales }),
}));

export default useSalesStore;
