//file: \app\admin\order\page.js

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
import useSalesStore from "@/app/store/useSalesStore";
import { format } from "date-fns";
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
  const {
    orderQueue,
    initializeOrderQueue,
    addToOrderQueue,
    updateOrderStatus,
    removeFromQueue,
    reorderQueue,
  } = useOrderQueueStore();

  /**
   *
   */
  const { setCurrentPage } = useNavigationStore();
  const [socket, setSocket] = useState(null);
  const router = useRouter();
  const [activeTabsState, setActiveTabsState] = useState({});
  const { todaySales, setTodaySales } = useSalesStore();
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
        x: 750,
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
        x: 750,
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
   * fetchTodaySales 함수
   * 오늘의 매출 데이터를 가져옵니다.
   */

  const fetchTodaySales = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    try {
      const response = await fetch(
        `/api/sales/todaySales?restaurantId=${restaurant.restaurantId}&date=${today}`
      );
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setTodaySales(data.totalSales);
        console.log(data);
      } else {
        console.error("Failed to fetch today's sales:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch today's sales:", error);
    }
  };
  // fetchTodaySales 함수 끝

  /**
   * fetchTablesAndOrders 함수
   * 테이블과 주문 데이터를 가져오고 초기화합니다.
   */

  const fetchTablesAndOrders = useCallback(async () => {
    if (!restaurant?.restaurantId) {
      console.error("Restaurant ID is not available");
      return;
    }

    try {
      const [tablesResponse, ordersResponse] = await Promise.all([
        fetch(`/api/tables?restaurantId=${restaurant.restaurantId}`, {
          headers: {
            Authorization: `Bearer ${restaurantToken}`,
          },
        }),
        fetch(`/api/orders?restaurantId=${restaurant.restaurantId}`, {
          headers: {
            Authorization: `Bearer ${restaurantToken}`,
          },
        }),
      ]);

      if (!tablesResponse.ok || !ordersResponse.ok) {
        throw new Error("Failed to fetch tables or orders");
      }

      const tablesData = await tablesResponse.json();
      const ordersData = await ordersResponse.json();

      console.log("Fetched tables:", tablesData);
      console.log("Fetched orders:", ordersData);

      // 모든 활성 주문 (completed 상태가 아닌 주문)
      const allActiveOrders = ordersData.filter((order) => order.status !== "completed");

      // 대기열에 포함될 주문 (served와 completed 상태가 아닌 주문)
      const queueOrders = allActiveOrders.filter((order) => order.status !== "served");

      // 테이블 데이터 처리
      const processedTables = tablesData.map((table) => {
        const tableOrders = allActiveOrders.filter((order) => order.tableId === table.tableId);
        return {
          ...table,
          orders: tableOrders,
        };
      });

      // 상태 업데이트
      setTables(processedTables);
      initializeOrderQueue(
        queueOrders.map((order) => ({
          _id: order._id,
          tableId: order.tableId,
          items: order.items,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
        }))
      );

      if (processedTables.length === 0) {
        await createInitialTables();
      }

      // 주문 대기열 정렬
      reorderQueue();
      //오늘매출 가져오기
      fetchTodaySales();
    } catch (error) {
      console.error("Error fetching tables and orders:", error);
      toast.error(`테이블 및 주문 정보를 불러오는데 실패했습니다: ${error.message}`);
    }
  }, [
    restaurant?.restaurantId,
    restaurantToken,
    setTables,
    createInitialTables,
    initializeOrderQueue,
    reorderQueue,
    ,
  ]);

  // fetchTablesAndOrders 함수 끝

  /**
   * initializeSocket 함수
   * 실시간 주문 업데이트를 위한 웹소켓 연결을 설정합니다.
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
        _id: data._id,
        items: data.items,
        status: data.status || "pending",
        orderedAt: data.orderedAt || new Date().toISOString(),
        totalAmount: totalAmount,
      };

      updateTable(data.tableId, {
        order: newOrder,
        status: "occupied",
      });

      // 주문 대기열에 새 주문 추가
      console.log(newOrder);
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

    if (!restaurant || !restaurantToken || !restaurant.hasTables) {
      console.log("No restaurant or token or hasTables. Redirecting to login...");
      router.push("/restaurant/login");
      return;
    }

    console.log("Initializing AdminOrderPage...");
    /**
     *
     */
    fetchTablesAndOrders();

    /**
     *
     */
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
  }, [restaurant, restaurantToken, router, fetchTablesAndOrders, initializeSocket, handleNewOrder]);

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

      const result = await response.json();

      setTables(newTables);
      toggleEditMode();
      toast.success("테이블 레이아웃이 저장되었습니다.");
      router.push("/admin/order");
      setCurrentPage("주문내역");
    } catch (error) {
      console.error("Failed to save table layout:", error);
      // console.error("Error details:", error.message, error.stack);
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
    async (tableId, order) => {
      let newStatus;
      switch (order.status) {
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
            orderId: order._id,
            newStatus: newStatus,
          }),
        });

        console.log("Order ID type:", typeof order._id); // 추가된 로그
        const responseData = await response.json();

        if (!response.ok) {
          console.error("Server response:", responseData);
          throw new Error(responseData.error || "Failed to update order status");
        }

        console.log("Updated order data:", responseData);

        // 로컬 상태 업데이트
        updateTableOrder(tableId, responseData.order);
        // 주문 대기열 상태 업데이트
        updateOrderStatus(order._id, newStatus);

        // 주문이 완료되면 대기열에서 제거
        if (newStatus === "served") {
          removeFromQueue(order._id);
        }
        // 전체 테이블 상태 새로고침
        // await fetchTablesAndOrders();

        toast.success(`주문 상태가 '${newStatus}'로 업데이트되었습니다.`);
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error(`주문 상태 업데이트에 실패했습니다: ${error.message}`);
      }
    },
    [updateTableOrder, restaurant?.restaurantId]
  );
  /**
   * 호출 완료 핸들러
   * 가격이 0인 항목(호출)을 주문에서 제거합니다.
   * {string|number} tableId - 테이블 ID
   *  {Object} order - 주문 객체
   *  {number} index - 제거할 항목의 인덱스
   */
  const handleCallComplete = useCallback(
    (tableId, order) => {
      if (order.items.every((item) => item.price === 0)) {
        const newStatus = "completed";
        // 호출 주문 제거
        updateTableOrder(tableId, { ...order, status: "completed" });

        // 테이블의 orders 배열에서 해당 주문 제거
        const updatedTable = tables.find((table) => table.tableId === tableId);
        if (updatedTable) {
          const updatedOrders = updatedTable.orders.filter((o) => o._id !== order._id);
          updateTable(tableId, { orders: updatedOrders });
        }
        /**
         *
         */
        updateOrderStatus(order._id, newStatus);

        // 완료된 호출 주문을 대기열에서 제거
        removeFromQueue(order._id);
        /**
         *
         */
        // 탭 상태 업데이트
        setActiveTabsState((prevState) => {
          const newState = { ...prevState };
          if (newState[tableId] !== undefined) {
            // 현재 활성 탭이 삭제된 주문보다 뒤에 있다면 인덱스를 하나 줄임
            if (newState[tableId] > 0) {
              newState[tableId] -= 1;
            } else {
              // 첫 번째 탭이 삭제되면 다음 탭을 활성화
              newState[tableId] = 0;
            }
          }
          return newState;
        });
      }
    },
    [updateTableOrder, updateTable, tables, updateOrderStatus, removeFromQueue]
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
   *
   */

  const handleTabChange = useCallback((tableId, tabIndex) => {
    setActiveTabsState((prevState) => ({
      ...prevState,
      [tableId]: tabIndex,
    }));
  }, []);
  /**
   *
   */
  const handlePayment = useCallback(
    async (tableId) => {
      try {
        const response = await fetch("/api/orders", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            restaurantId: restaurant.restaurantId,
            tableId: tableId,
            action: "completeAllOrders",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to complete orders");
        }

        const result = await response.json();
        console.log("Payment result:", result);

        // 테이블 상태 업데이트
        updateTable(tableId, { status: "empty", orders: [] });

        // 주문 대기열에서 해당 테이블의 주문 제거
        const updatedQueue = orderQueue.filter((order) => order.tableId !== tableId);
        initializeOrderQueue(updatedQueue);

        toast.success(`테이블 ${tableId}의 모든 주문이 완료되었습니다.`);
        fetchTodaySales();
        // 테이블 정보 새로고침
        // await fetchTablesAndOrders();
      } catch (error) {
        console.error("Error completing orders:", error);
        toast.error("주문 완료 처리 중 오류가 발생했습니다.");
      }
    },
    [restaurant, updateTable, orderQueue, initializeOrderQueue]
  );

  /**
   *
   */
  const renderTableContent = useCallback(
    (table) => {
      console.log("Rendering table content for table:", table);

      // 주문 데이터 구조 확인
      const orders = table.orders || (table.order ? [table.order] : []);
      console.log("Table orders:", orders);
      const tableTotalAmount = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const activeTab = activeTabsState[table.tableId] ?? orders.length - 1;
      return (
        <div className="mt-2 w-full h-full flex flex-col">
          {orders.length > 0 ? (
            <>
              <div className="flex border-b">
                {orders.map((order, index) => {
                  const orderIndex = orderQueue.findIndex(
                    (queueOrder) => queueOrder._id === order._id
                  );

                  return (
                    <div
                      key={order._id || index}
                      className={`py-2 px-4 text-sm font-semibold rounded-t-lg mr-1 ${
                        activeTab === index
                          ? "bg-white text-blue-600 border-t-2 border-l-2 border-r-2 border-blue-400 -mb-px z-10"
                          : "bg-gray-300 text-gray-600 border-t-2 border-l-2 border-r-2 border-gray-300 hover:bg-gray-300 border"
                      }`}
                      onClick={() => handleTabChange(table.tableId, index)}
                    >
                      {/* 주문 #{index + 1} */}
                      주문 #
                      {orderQueue.length > 0 && orderIndex >= 0 && (
                        <span className="px-2 py-1 rounded-full bg-pink-600 text-white">
                          {orderIndex + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="bg-white border-2 border-blue-400 rounded-b-lg rounded-tr-lg flex-grow overflow-x-hidden overflow-y-auto custom-scrollbar">
                <div className="p-1">
                  {orders.map((order, orderIndex) => (
                    <div
                      key={order._id || orderIndex}
                      className={`${activeTab === orderIndex ? "block " : "hidden "}`}
                    >
                      {/* 주문 순서 표시 추가 */}
                      {/* <span className="text-sm font-semibold">
                        주문 순서:{" "}
                        {orderQueue.findIndex((queueOrder) => queueOrder._id === order._id) + 1}
                      </span> */}
                      <ul className="text-sm">
                        {order.items &&
                          order.items.map((item, itemIndex) => (
                            <li key={item._id || itemIndex} className="border-b border-blue-200">
                              <div className="mt-1 mx-3 flex justify-between items-center p-2">
                                <div className="flex-grow flex items-center">
                                  <span>{item.name}</span>
                                  <span className="ml-2 bg-gray-600 text-white text-md font-medium px-2 py-1 rounded-lg">
                                    {item.quantity}
                                  </span>
                                </div>
                                <div>{formatNumber(item.price * item.quantity)}원</div>
                              </div>
                            </li>
                          ))}
                      </ul>
                      {order.items && order.items.every((item) => item.price === 0) ? (
                        <button
                          className="mt-2 text-sm px-2 py-1 rounded-xl bg-gray-800 text-white right-0"
                          onClick={() => handleCallComplete(table.tableId, order)}
                        >
                          호출
                        </button>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <button
                              className={`mt-2 text-sm px-3 py-1 rounded-lg ml-auto ${getStatusColor(
                                order.status
                              )}`}
                              onClick={
                                order.status !== "served"
                                  ? () => handleOrderStatusChange(table.tableId, order)
                                  : undefined
                              }
                              disabled={order.status === "served"}
                            >
                              {getStatusText(order.status)}
                            </button>
                          </div>

                          {/* <div className="mt-2 font-bold text-right p-2 border-t border-gray-200">
                            {/* 총액: {formatNumber(order.totalAmount)}원 */}
                          {/* 총액: {formatNumber(tableTotalAmount)}원 */}
                          {/* </div> */}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-grow"></div>
              {/* 테이블 전체 총액 표시 */}
              <div className="mt-2 font-bold text-right p-2 border-t border-gray-200">
                <button
                  onClick={() => handlePayment(table.tableId)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors mr-4"
                >
                  결제
                </button>
                <span>총액: {formatNumber(tableTotalAmount)}원</span>
              </div>
            </>
          ) : (
            <p className="text-sm p-4">주문 없음</p>
          )}
        </div>
      );
    },
    [
      activeTabsState,
      handleTabChange,
      handleOrderStatusChange,
      handleCallComplete,
      getStatusColor,
      getStatusText,
      formatNumber,
      orderQueue,
    ]
  );

  if (!restaurant) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <AdvancedTableLayout
        tables={tables}
        isEditMode={isEditMode}
        onSaveLayout={handleSaveLayout}
        onUpdateTable={handleUpdateTable}
        renderContent={(table) => renderTableContent(table, handleTabChange)}
        onAddTable={addTable}
        onRemoveTable={removeTable}
      />
    </div>
  );
}
