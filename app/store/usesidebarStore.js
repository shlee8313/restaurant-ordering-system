//file: \app\store\usesidebarStore.js

import { create } from "zustand";

const useSidebarStore = create((set) => ({
  isSideBarOpen: true,
  sideBartoggle: () => set((state) => ({ isSideBarOpen: !state.isSideBarOpen })),
}));

export default useSidebarStore;
