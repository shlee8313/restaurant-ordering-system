import create from "zustand";

const useTableStore = create((set) => ({
  isEditMode: false,
  tables: [],
  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
  setTables: (tables) => set({ tables }),
  updateTable: (id, newProps) =>
    set((state) => ({
      tables: state.tables.map((table) => (table.id === id ? { ...table, ...newProps } : table)),
    })),
  addTable: (newTable) =>
    set((state) => ({
      tables: [...state.tables, newTable],
    })),
  removeTable: (id) =>
    set((state) => ({
      tables: state.tables.filter((table) => table.id !== id),
    })),
}));

export default useTableStore;
