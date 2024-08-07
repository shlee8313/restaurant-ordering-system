//file: \app\store\useTableStore.js

import { create } from "zustand";

const useTableStore = create((set) => ({
  isEditMode: false,
  tables: [],
  setTables: (newTables) => set({ tables: newTables }),
  toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
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

          // 주문 정보 업데이트
          if (newProps.order) {
            updatedTable.orders = updatedTable.orders || [];
            updatedTable.orders.push(newProps.order);
            updatedTable.status = "occupied";
          }

          console.log("Table orders updated:", updatedTable);

          // 기타 속성 업데이트
          updatedTable = {
            ...updatedTable,
            ...newProps,
          };

          console.log("Table updated:", updatedTable);
          return updatedTable;
        }
        return table;
      });
      console.log("All tables after update:", updatedTables);
      return { tables: updatedTables };
    }),

  updateTableOrder: (tableId, updatedOrder) =>
    set((state) => {
      console.log("Updating table order:", { tableId, updatedOrder });
      const updatedTables = state.tables.map((table) => {
        if (table.tableId === Number(tableId)) {
          let updatedOrders;
          if (Array.isArray(table.orders)) {
            // 기존 주문 배열이 있는 경우
            const existingOrderIndex = table.orders.findIndex(
              (order) => order._id === updatedOrder._id
            );
            if (existingOrderIndex !== -1) {
              // 기존 주문을 업데이트
              updatedOrders = [
                ...table.orders.slice(0, existingOrderIndex),
                updatedOrder,
                ...table.orders.slice(existingOrderIndex + 1),
              ];
            } else {
              // 새 주문 추가
              updatedOrders = [...table.orders, updatedOrder];
            }
          } else if (table.order) {
            // 단일 주문 구조에서 배열 구조로 전환
            updatedOrders =
              table.order._id === updatedOrder._id ? [updatedOrder] : [table.order, updatedOrder];
          } else {
            // 주문이 없는 경우 새 주문 추가
            updatedOrders = [updatedOrder];
          }

          const updatedTable = {
            ...table,
            orders: updatedOrders,
            order: undefined, // 단일 주문 구조 제거
            status: updatedOrders.some((order) => order.status !== "completed")
              ? "occupied"
              : "empty",
          };
          console.log("Updated table:", updatedTable);
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
        orders: [],
      };
      console.log("Adding new table:", newTable);
      return { tables: [...state.tables, newTable] };
    }),

  // removeTable 및 reorderTableIds 함수는 그대로 유지
}));

export default useTableStore;

/**
 *
 */

// import { create } from "zustand";

// const useTableStore = create((set) => ({
//   isEditMode: false,
//   tables: [],
//   setTables: (newTables) => set({ tables: newTables }),
//   toggleEditMode: () => set((state) => ({ isEditMode: !state.isEditMode })),
//   updateTable: (tableId, newProps) =>
//     set((state) => {
//       console.log("Updating table:", tableId, "with props:", newProps);
//       const updatedTables = state.tables.map((table) => {
//         if (table.tableId === Number(tableId)) {
//           let updatedTable = { ...table };

//           // 테이블 이동 처리
//           if ("x" in newProps || "y" in newProps) {
//             updatedTable.x = newProps.x !== undefined ? newProps.x : table.x;
//             updatedTable.y = newProps.y !== undefined ? newProps.y : table.y;
//             console.log("Table position updated:", updatedTable);
//           }

//           // 주문 정보 업데이트
//           if (newProps.order) {
//             const existingItems = table.order?.items || [];
//             let updatedItems;

//             if (Array.isArray(newProps.order.items)) {
//               // 새 주문 항목 처리 (소켓에서 온 데이터)
//               updatedItems = [...existingItems];
//               newProps.order.items.forEach((newItem) => {
//                 const existingItemIndex = updatedItems.findIndex(
//                   (item) => item.name === newItem.name && item.status === newProps.order.status
//                 );

//                 if (existingItemIndex !== -1) {
//                   if (newItem.price !== 0) {
//                     // 가격이 0이 아닌 경우: 수량 증가
//                     updatedItems[existingItemIndex].quantity += newItem.quantity;
//                   }
//                   // 가격이 0인 경우: 이미 존재하므로 무시 (아무 작업 안 함)
//                 } else {
//                   // 새로운 항목 추가 (가격이 0이든 아니든 모두 추가)
//                   updatedItems.push({
//                     ...newItem,
//                     status: newProps.order.status,
//                   });
//                 }
//               });
//             } else {
//               // 기존 주문 항목 업데이트 (버튼 클릭 등으로 인한 업데이트)
//               updatedItems = newProps.order.items;
//             }

//             updatedTable.order = {
//               ...table.order,
//               ...newProps.order,
//               items: updatedItems,
//               status: newProps.order.status || table.order?.status,
//               orderedAt: newProps.order.orderedAt || table.order?.orderedAt,
//             };
//             updatedTable.status = newProps.status || table.status;
//             console.log("Table order updated:", updatedTable);
//           }

//           // 기타 속성 업데이트
//           updatedTable = {
//             ...updatedTable,
//             ...newProps,
//             order: updatedTable.order, // 주문 정보 보존
//           };

//           console.log("Table updated:", updatedTable);
//           return updatedTable;
//         }
//         return table;
//       });
//       console.log("All tables after update:", updatedTables);
//       return { tables: updatedTables };
//     }),
//   /**
//  *

//  */
//   updateTableOrder: (tableId, updatedOrder) =>
//     set((state) => {
//       const updatedTables = state.tables.map((table) => {
//         if (table.tableId === Number(tableId)) {
//           // 가격이 0인 항목 제거
//           const filteredItems = updatedOrder.items.filter((item) => item.price !== 0);

//           return {
//             ...table,
//             order:
//               filteredItems.length > 0
//                 ? {
//                     ...updatedOrder,
//                     items: filteredItems,
//                   }
//                 : null,
//             status: filteredItems.length > 0 ? "occupied" : "empty",
//           };
//         }
//         return table;
//       });

//       console.log(
//         "Table order updated:",
//         updatedTables.find((t) => t.tableId === Number(tableId))
//       );
//       return { tables: updatedTables };
//     }),
//   /**
//  *

//  */

//   updateOrderItemStatus: (tableId, itemId, newStatus) =>
//     set((state) => {
//       const updatedTables = state.tables.map((table) => {
//         if (table.tableId === Number(tableId) && table.order) {
//           const updatedItems = table.order.items.map((item) => {
//             if (item.id === itemId) {
//               return { ...item, status: newStatus };
//             }
//             return item;
//           });

//           // Check if all items are completed
//           const allCompleted = updatedItems.every((item) => item.status === "completed");

//           return {
//             ...table,
//             order: { ...table.order, items: updatedItems },
//             status: allCompleted ? "completed" : "occupied",
//           };
//         }
//         return table;
//       });
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
//         order: null,
//       };
//       console.log("Adding new table:", newTable);
//       return { tables: [...state.tables, newTable] };
//     }),
//   removeTable: (id) =>
//     set((state) => {
//       const newTables = state.tables.filter((table) => table.id !== id);
//       console.log("Removing table:", id);
//       console.log("Remaining tables before reordering:", newTables);

//       // Immediately reorder table IDs after removal
//       const reorderedTables = newTables.map((table, index) => ({
//         ...table,
//         tableId: index + 1,
//       }));

//       console.log("Reordered tables after removal:", reorderedTables);
//       return { tables: reorderedTables };
//     }),
//   reorderTableIds: () =>
//     set((state) => {
//       const reorderedTables = state.tables
//         .sort((a, b) => a.tableId - b.tableId)
//         .map((table, index) => ({ ...table, tableId: index + 1 }));
//       console.log("Reordered tables:", reorderedTables);
//       return { tables: reorderedTables };
//     }),
// }));

// export default useTableStore;
