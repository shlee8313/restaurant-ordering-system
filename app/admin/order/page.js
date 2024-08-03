"use client";

import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { initSocket, closeSocket, getSocket } from "../../utils/socket";
import useAuthStore from "../../store/useAuthStore";
import useTableStore from "../../store/useTableStore";
import useNavigationStore from "../../store/useNavigationStore";
import AdvancedTableLayout from "../../components/AdvancedTableLayout";
import { toast } from "react-toastify";

export default function AdminOrderPage() {
  const { restaurant, restaurantToken, refreshToken } = useAuthStore();
  const {
    isEditMode,
    tables,
    toggleEditMode,
    setTables,
    updateTable,
    addTable,
    removeTable,
    updateTableOrder,
  } = useTableStore();
  const { setCurrentPage } = useNavigationStore();
  const [socket, setSocket] = useState(null);
  const router = useRouter();

  const createInitialTables = useCallback(async () => {
    if (!restaurant?.restaurantId) {
      console.error("Restaurant ID is not available");
      return;
    }

    const initialTables = [
      {
        restaurantId: restaurant.restaurantId,
        tableId: 1,
        x: 50,
        y: 50,
        width: 200,
        height: 300,
        status: "empty",
      },
      {
        restaurantId: restaurant.restaurantId,
        tableId: 2,
        x: 300,
        y: 50,
        width: 200,
        height: 300,
        status: "empty",
      },
      {
        restaurantId: restaurant.restaurantId,
        tableId: 3,
        x: 550,
        y: 50,
        width: 200,
        height: 300,
        status: "empty",
      },
      {
        restaurantId: restaurant.restaurantId,
        tableId: 4,
        x: 50,
        y: 400,
        width: 200,
        height: 300,
        status: "empty",
      },
      {
        restaurantId: restaurant.restaurantId,
        tableId: 5,
        x: 300,
        y: 400,
        width: 200,
        height: 300,
        status: "empty",
      },
      {
        restaurantId: restaurant.restaurantId,
        tableId: 6,
        x: 550,
        y: 400,
        width: 200,
        height: 300,
        status: "empty",
      },
    ];

    const createdTables = await Promise.all(
      initialTables.map(async (table) => {
        try {
          const response = await fetch("/api/tables", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${restaurantToken}`,
            },
            body: JSON.stringify(table),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to create/update table ${table.tableId}: ${errorData.error}`);
          }

          const result = await response.json();
          console.log(`Table ${table.tableId} created/updated successfully:`, result);
          return result.table;
        } catch (err) {
          console.error(`Error creating/updating table ${table.tableId}:`, err);
          return null;
        }
      })
    );

    const validTables = createdTables.filter((table) => table !== null);
    console.log("Successfully created/updated tables:", validTables);
    setTables(validTables);
    toast.success("초기 테이블이 생성되었습니다.");
  }, [restaurant?.restaurantId, restaurantToken, setTables]);
  /**
   *
   */

  const fetchTables = useCallback(async () => {
    if (!restaurant?.restaurantId) {
      console.error("Restaurant ID is not available");
      return;
    }

    try {
      const response = await fetch(`/api/tables?restaurantId=${restaurant.restaurantId}`, {
        headers: {
          Authorization: `Bearer ${restaurantToken}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch tables");
      }
      const data = await response.json();
      console.log("Fetched tables:", data);

      if (data.length === 0) {
        await createInitialTables();
      } else {
        setTables(data);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error(`테이블 정보를 불러오는데 실패했습니다: ${error.message}`);
    }
  }, [restaurant?.restaurantId, restaurantToken, setTables, createInitialTables]);

  // 소켓 초기화 함수
  const initializeSocket = useCallback(() => {
    console.log("initializeSocket called");
    if (!restaurant || !restaurantToken) return null;

    const newSocket = initSocket(restaurant.restaurantId);

    newSocket.on("connect", () => {
      console.log("Restaurant connected to socket");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Restaurant disconnected from socket:", reason);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // newSocket.on("newOrder", (data) => {
    //   console.log("New order received:", data);
    //   updateTable(data.tableId, {
    //     order: {
    //       items: data.items,
    //       status: data.status,
    //       orderedAt: data.orderedAt,
    //     },
    //     status: "occupied",
    //   });

    //   console.log("Current tables after update:", useTableStore.getState().tables);
    //   toast.info(`새로운 주문이 접수되었습니다. 테이블: ${data.tableId} ${data.items[0].name}`);
    // });

    newSocket.io.on("reconnect", (attempt) => {
      console.log("Reconnected to server after", attempt, "attempts");
      toast.success("서버에 다시 연결되었습니다.");
    });

    return newSocket;
  }, [restaurant, restaurantToken]);

  /**
   *
   */
  const handleNewOrder = useCallback(
    (data) => {
      console.log("New order received:", data);
      updateTable(data.tableId, {
        order: {
          items: data.items,
          status: data.status,
          orderedAt: data.orderedAt,
        },
        status: "occupied",
      });

      console.log("Current tables after update:", useTableStore.getState().tables);
      toast.info(`새로운 주문이 접수되었습니다. 테이블: ${data.tableId} ${data.items[0].name}`);
    },
    [updateTable]
  );

  // 컴포넌트 마운트 시 실행되는 효과
  useEffect(() => {
    console.log("AdminOrderPage useEffect triggered");

    if (!restaurant || !restaurantToken) {
      console.log("No restaurant or token. Redirecting to login...");
      router.push("/restaurant/login");
      return;
    }

    console.log("Initializing AdminOrderPage...");
    fetchTables();

    const newSocket = initializeSocket();
    if (newSocket) {
      newSocket.on("newOrder", handleNewOrder);
      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.off("newOrder", handleNewOrder);
        closeSocket();
      }
    };
  }, [restaurant, restaurantToken, router, fetchTables, initializeSocket, handleNewOrder]);

  // 테이블 업데이트 핸들러
  const handleUpdateTable = useCallback(
    (id, newProps) => {
      console.log(`Updating table ${id} with:`, newProps);
      updateTable(id, newProps);
      setTimeout(() => {
        console.log("Current tables after update:", useTableStore.getState().tables);
      }, 0);
    },
    [updateTable]
  );

  // 레이아웃 저장 핸들러
  const handleSaveLayout = async (newTables) => {
    console.log("handleSaveLayout called with:", newTables);
    try {
      const response = await fetch("/api/tables", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${restaurantToken}`,
        },
        body: JSON.stringify({ restaurantId: restaurant.restaurantId, tables: newTables }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          await refreshToken();
          throw new Error("Token refreshed. Please try again.");
        }
        throw new Error("Failed to save table layout");
      }
      setTables(newTables);
      toggleEditMode();
      toast.success("테이블 레이아웃이 저장되었습니다.");
      router.push("/admin/order");
      setCurrentPage("주문내역");
    } catch (error) {
      console.error("Failed to save table layout:", error);
      console.error("Error details:", error.message, error.stack);
      toast.error(`테이블 레이아웃 저장에 실패했습니다: ${error.message}`);
    }
  };
  /**
   *
   */
  const handleUpdateTableOrder = useCallback(
    (tableId, updatedOrder) => {
      updateTableOrder(tableId, updatedOrder);
    },
    [updateTableOrder]
  );

  // 테이블 내용 렌더링 함수
  const renderTableContent = useCallback(
    (table) => {
      const order = table.order;
      return (
        <div className="w-full h-full p-1 overflow-y-auto custom-scrollbar">
          {order ? (
            <div>
              <ul className="text-sm">
                {order.items.map((item, index) => (
                  <li key={index}>
                    <div className="flex justify-between items-center p-2 border-b">
                      <span className="flex-grow">
                        {item.name} x {item.quantity}
                      </span>
                      <div className="flex items-center">
                        {item.price === 0 ? (
                          <button
                            className="text-sm px-2 py-1 rounded-xl mr-2 bg-yellow-500 text-white"
                            onClick={() => {
                              const updatedItems = order.items.filter((_, idx) => idx !== index);
                              handleUpdateTableOrder(table.tableId, {
                                ...order,
                                items: updatedItems,
                              });
                            }}
                          >
                            호출 완료
                          </button>
                        ) : (
                          <button
                            className={`text-sm px-2 py-1 rounded-xl mr-2 ${
                              item.status === "preparing" ? "bg-blue-500" : "bg-green-500"
                            } text-white`}
                            onClick={() => {
                              const updatedItems = order.items.map((i, idx) =>
                                idx === index ? { ...i, status: "preparing" } : i
                              );
                              handleUpdateTableOrder(table.tableId, {
                                ...order,
                                items: updatedItems,
                              });
                            }}
                          >
                            {item.status === "preparing" ? "준비중" : "주문 접수"}
                          </button>
                        )}
                        <span
                          className={`text-sm px-2 py-1 rounded-xl ${
                            order.status === "pending" ? "bg-red-500" : "bg-green-500"
                          } text-white`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm">주문 없음</p>
          )}
        </div>
      );
    },
    [handleUpdateTableOrder]
  );

  /**
   *
   */
  if (!restaurant) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <AdvancedTableLayout
        tables={tables}
        isEditMode={isEditMode}
        onSaveLayout={handleSaveLayout}
        onUpdateTable={handleUpdateTable}
        renderContent={renderTableContent}
        onAddTable={addTable}
        onRemoveTable={removeTable}
      />
    </div>
  );
}
