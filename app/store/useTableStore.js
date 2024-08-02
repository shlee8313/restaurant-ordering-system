import { create } from "zustand";

const useTableStore = create((set) => ({
  isEditMode: false,
  tables: [],
  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
  setTables: (tables) => set({ tables }),

  updateTable: (tableId, newProps) =>
    set((state) => {
      console.log("Updating table:", tableId, "with props:", newProps);
      const updatedTables = state.tables.map((table) => {
        if (table.tableId === Number(tableId)) {
          let updatedTable = { ...table };

          // 테이블 이동 처리
          if ("x" in newProps || "y" in newProps) {
            updatedTable.x = newProps.x !== undefined ? newProps.x : table.x;
            updatedTable.y = newProps.y !== undefined ? newProps.y : table.y;
            console.log("Table position updated:", updatedTable);
          }

          // 소켓 데이터 처리 (주문 정보 업데이트)
          if (newProps.order) {
            const existingItems = table.order?.items || [];
            const newItems = newProps.order.items.filter(
              (newItem) =>
                !existingItems.some(
                  (existingItem) =>
                    existingItem.name === newItem.name &&
                    existingItem.price === newItem.price &&
                    existingItem.quantity === newItem.quantity
                )
            );

            updatedTable.order = {
              ...table.order,
              items: [...existingItems, ...newItems],
              status: newProps.order.status,
              orderedAt: newProps.order.orderedAt,
            };
            updatedTable.status = newProps.status || table.status;
            console.log("Table order updated:", updatedTable);
          }

          // 기타 속성 업데이트
          updatedTable = {
            ...updatedTable,
            ...newProps,
            order: updatedTable.order, // 주문 정보 보존
          };

          console.log("Table updated:", updatedTable);
          return updatedTable;
        }
        return table;
      });
      console.log("All tables after update:", updatedTables);
      return { tables: updatedTables };
    }),

  addTable: () =>
    set((state) => {
      const newTableId =
        state.tables.length > 0 ? Math.max(...state.tables.map((t) => t.tableId)) + 1 : 1;
      const newTable = {
        id: Date.now().toString(),
        tableId: newTableId,
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        status: "empty",
      };
      return { tables: [...state.tables, newTable] };
    }),

  removeTable: (id) =>
    set((state) => {
      const newTables = state.tables.filter((table) => table.id !== id);
      console.log("Removing table:", id);
      console.log("Remaining tables before reordering:", newTables);

      // Immediately reorder table IDs after removal
      const reorderedTables = newTables.map((table, index) => ({
        ...table,
        tableId: index + 1,
      }));

      console.log("Reordered tables after removal:", reorderedTables);
      return { tables: reorderedTables };
    }),
  reorderTableIds: () =>
    set((state) => {
      const reorderedTables = state.tables
        .sort((a, b) => a.tableId - b.tableId)
        .map((table, index) => ({ ...table, tableId: index + 1 }));
      console.log("Reordered tables:", reorderedTables);
      return { tables: reorderedTables };
    }),
}));

export default useTableStore;

// import { create } from "zustand";

// const useTableStore = create((set) => ({
//   isEditMode: false,
//   tables: [],
//   toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
//   setTables: (tables) => set({ tables }),
//   updateTable: (tableId, newProps) =>
//     set((state) => {
//       console.log("Updating table:", tableId, newProps);
//       const updatedTables = state.tables.map((table) =>
//         table.tableId.toString() === tableId.toString() ? { ...table, ...newProps } : table
//       );
//       console.log("Updated tables:", updatedTables);
//       return { tables: updatedTables };
//     }),
//   addTable: () =>
//     set((state) => {
//       const newTableId =
//         state.tables.length > 0 ? Math.max(...state.tables.map((t) => t.tableId)) + 1 : 1;
//       const newTable = {
//         id: Date.now().toString(),
//         tableId: newTableId,
//         x: 0,
//         y: 0,
//         width: 100,
//         height: 100,
//         status: "empty",
//       };
//       const newTables = [...state.tables, newTable];
//       return {
//         tables: newTables.map((table, index) => ({ ...table, tableId: index + 1 })),
//       };
//     }),
//   removeTable: (id) =>
//     set((state) => {
//       const newTables = state.tables.filter((table) => table.id !== id);
//       return {
//         tables: newTables
//           .sort((a, b) => a.tableId - b.tableId)
//           .map((table, index) => ({ ...table, tableId: index + 1 })),
//       };
//     }),
//   reorderTableIds: () => {
//     set((state) => ({
//       tables: state.tables
//         .sort((a, b) => a.tableId - b.tableId)
//         .map((table, index) => ({ ...table, tableId: index + 1 })),
//     }));
//   },
// }));

// export default useTableStore;
