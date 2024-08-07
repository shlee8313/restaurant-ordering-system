//file: \app\store\useSalesStore.js

import { create } from "zustand";

const useSalesStore = create((set) => ({
  todaySales: 0,
  setTodaySales: (sales) => {
    console.log("Updating todaySales:", sales); // 추가된 로그
    set({ todaySales: Number(sales) || 0 });
  },
}));

export default useSalesStore;

// import create from "zustand";

// const useSalesStore = create((set) => ({
//   todaySales: 0,
//   isLoading: false,
//   error: null,
//   setTodaySales: (sales) => set({ todaySales: sales }),
//   setIsLoading: (loading) => set({ isLoading: loading }),
//   setError: (error) => set({ error }),
// }));

// export default useSalesStore;
