"use client";

import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { initSocket, closeSocket, getSocket } from "../../utils/socket";
import useAuthStore from "../../store/useAuthStore";
import useTableStore from "../../store/useTableStore";
import useNavigationStore from "../../store/useNavigationStore";
import AdvancedTableLayout from "../../components/AdvancedTableLayout";
import { toast } from "react-toastify";
import useOrderQueueStore from "../../store/useOrderQueueStore";
import { v4 as uuidv4 } from "uuid";
/**
 * 
 
 */
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
    updateOrderItemStatus,
  } = useTableStore();
  const { addToOrderQueue, updateOrderStatus, getActiveOrders, getOrderPosition } =
    useOrderQueueStore();

  /**
   *
   */
  const { setCurrentPage } = useNavigationStore();
  const [socket, setSocket] = useState(null);
  const router = useRouter();
  /**
   * 초기 테이블 생성 함수
   * 레스토랑에 기본 테이블 레이아웃을 설정합니다.
   *
   */
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
        width: 300,
        height: 300,
        status: "empty",
      },
      {
        restaurantId: restaurant.restaurantId,
        tableId: 2,
        x: 400,
        y: 50,
        width: 300,
        height: 300,
        status: "empty",
      },
      {
        restaurantId: restaurant.restaurantId,
        tableId: 3,
        x: 650,
        y: 50,
        width: 300,
        height: 300,
        status: "empty",
      },
      {
        restaurantId: restaurant.restaurantId,
        tableId: 4,
        x: 50,
        y: 400,
        width: 300,
        height: 300,
        status: "empty",
      },
      {
        restaurantId: restaurant.restaurantId,
        tableId: 5,
        x: 400,
        y: 400,
        width: 300,
        height: 300,
        status: "empty",
      },
      {
        restaurantId: restaurant.restaurantId,
        tableId: 6,
        x: 650,
        y: 400,
        width: 300,
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
  /**
   * 테이블 정보 fetch 함수
   * 서버로부터 현재 레스토랑의 테이블 정보를 가져옵니다.
   * 테이블이 없으면 초기 테이블을 생성합니다.
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

  /**
   * 소켓 초기화 함수
   * 실시간 주문 업데이트를 위한 웹소켓 연결을 설정합니다.
   * 초기화된 소켓 객체 또는 null
   */
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

    newSocket.io.on("reconnect", (attempt) => {
      console.log("Reconnected to server after", attempt, "attempts");
      toast.success("서버에 다시 연결되었습니다.");
    });

    return newSocket;
  }, [restaurant, restaurantToken]);

  /**
   * 새 주문 처리 함수
   * 새로운 주문이 들어왔을 때 호출되며, 테이블 상태와 주문 대기열을 업데이트합니다.
   *
   */
  const handleNewOrder = useCallback(
    (data) => {
      console.log("New order received:", data);

      // totalAmount 계산
      const totalAmount = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // 새로운 주문 객체 생성
      const newOrder = {
        _id: uuidv4(), // 새로운 고유 ID 생성
        items: data.items,
        status: data.status || "pending",
        orderedAt: data.orderedAt || new Date().toISOString(),
        totalAmount: totalAmount,
      };

      // 테이블 상태 업데이트
      updateTable(data.tableId, {
        order: newOrder,
        status: "occupied",
      });

      // 주문 대기열에 새 주문 추가
      addToOrderQueue({
        _id: newOrder._id,
        tableId: data.tableId,
        items: newOrder.items,
        status: newOrder.status,
        totalAmount: newOrder.totalAmount,
      });

      console.log("Current tables after update:", useTableStore.getState().tables);
      toast.info(`새로운 주문이 접수되었습니다. 테이블: ${data.tableId} ${data.items[0].name}`);
    },
    [updateTable, addToOrderQueue]
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

  /**
   * 테이블 업데이트 핸들러
   * 테이블의 속성(위치, 크기 등)을 업데이트합니다.
   *  {string|number} id - 테이블 ID
   *  {Object} newProps - 업데이트할 새 속성
   */
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

  /**
   * 레이아웃 저장 핸들러
   * 수정된 테이블 레이아웃을 서버에 저장합니다.
   *  {Array} newTables - 새로운 테이블 레이아웃 배열
   */
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
   * 주문 상태 변경 핸들러
   * 개별 주문 항목의 상태를 변경하고 서버와 로컬 상태를 업데이트합니다.
   * {string|number} tableId - 테이블 ID
   *  {Object} order - 주문 객체
   *  {number} itemIndex - 변경할 항목의 인덱스
   */
  const handleOrderStatusChange = useCallback(
    async (tableId, order, itemIndex) => {
      const currentItem = order.items[itemIndex];
      let newStatus;
      switch (currentItem.status) {
        case "pending":
          newStatus = "preparing";
          break;
        case "preparing":
          newStatus = "served";
          break;
        case "served":
          newStatus = "completed";
          break;
        default:
          return; // 이미 completed 상태면 아무 동작 안 함
      }

      try {
        const response = await fetch("/api/tables", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            restaurantId: restaurant.restaurantId,
            tableId: tableId,
            itemId: currentItem.id,
            newStatus: newStatus,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update order status");
        }

        const updatedData = await response.json();

        // 업데이트된 items 배열 생성
        const updatedItems = order.items.map((item) =>
          item.id === currentItem.id ? { ...item, status: newStatus } : item
        );

        // totalAmount 재계산
        // const totalAmount = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // 로컬 상태 업데이트
        updateTableOrder(tableId, {
          ...order,
          items: updatedItems,
        });

        // 주문 대기열 상태 업데이트 로직
        const allItemsServedOrCompleted = updatedItems.every(
          (item) => item.status === "served" || item.status === "completed"
        );

        if (allItemsServedOrCompleted) {
          updateOrderStatus(order._id, "served");
        }

        toast.success(`주문 상태가 '${newStatus}'로 업데이트되었습니다.`);
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("주문 상태 업데이트에 실패했습니다.");
      }
    },
    [updateTableOrder, updateOrderStatus, restaurant?.restaurantId]
  );

  /**
   * 호출 완료 핸들러
   * 가격이 0인 항목(호출)을 주문에서 제거합니다.
   * {string|number} tableId - 테이블 ID
   *  {Object} order - 주문 객체
   *  {number} index - 제거할 항목의 인덱스
   */
  const handleCallComplete = useCallback(
    (tableId, order, index) => {
      const updatedItems = order.items.filter((_, idx) => idx !== index);
      const updatedOrder = {
        ...order,
        items: updatedItems,
      };
      updateTableOrder(tableId, updatedOrder);
    },
    [updateTableOrder]
  );
  /**
   * 숫자 포맷팅 함수
   * 숫자에 천 단위 구분 쉼표를 추가합니다.
  
   */
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  // 헬퍼 함수들
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-red-500 text-white";
      case "preparing":
        return "bg-yellow-500 text-white";
      case "served":
        return "bg-gray-400 text-gray-700";
      case "completed":
        return "bg-green-200text-gray-700";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "주문접수";
      case "preparing":
        return "준비중";
      case "served":
        return "서빙완료";
      case "completed":
        return "완료";
      default:
        return "알 수 없음";
    }
  };

  /**
   * 테이블 내용 렌더링 함수
   * 각 테이블의 주문 정보를 렌더링합니다.
  
   */
  const renderTableContent = useCallback(
    (table) => {
      const order = table.order;
      console.log(order);
      return (
        <div className="w-full h-full flex flex-col">
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {order ? (
              <div>
                <ul className="text-sm">
                  {order.items.map((item, index) => (
                    <li key={index} className="border-b border-blue-300">
                      <div className="flex justify-between items-center p-2 border-b">
                        <span className="flex-grow flex items-center">
                          <span>{item.name}</span>
                          <span className="ml-2 bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                            {item.quantity}
                          </span>
                        </span>
                        <div className="flex">
                          {item.price === 0 ? (
                            <button
                              className="text-sm px-2 py-1 rounded-xl mr-2 bg-gray-800 text-white"
                              onClick={() => handleCallComplete(table.tableId, order, index)}
                            >
                              호출
                            </button>
                          ) : (
                            <div className="relative">
                              <button
                                className={`text-sm px-2 py-1 rounded-xl mr-2 ${getStatusColor(
                                  item.status
                                )}`}
                                onClick={() => handleOrderStatusChange(table.tableId, order, index)}
                              >
                                {getStatusText(item.status)}
                              </button>
                            </div>
                          )}
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
          {order && (
            <div className="mt-2 font-bold text-right p-2 border-t border-gray-200">
              총액: {formatNumber(order.totalAmount)}원
            </div>
          )}
        </div>
      );
    },
    [handleCallComplete, handleOrderStatusChange]
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
