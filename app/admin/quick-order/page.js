// 테이블없는 식당

// file: /app/admin/quick-order/page.js
"use client";

import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { initSocket, closeSocket } from "../../utils/socket";
import useAuthStore from "../../store/useAuthStore";
import useNavigationStore from "../../store/useNavigationStore";
import { toast } from "react-toastify";
import useOrderQueueStore from "../../store/useOrderQueueStore";
import useSalesStore from "@/app/store/useSalesStore";
import { format } from "date-fns";

export default function AdminQuickOrderPage() {
  const { restaurant, restaurantToken, refreshToken } = useAuthStore();
  const { setCurrentPage } = useNavigationStore();
  const [socket, setSocket] = useState(null);
  const router = useRouter();
  const { todaySales, setTodaySales } = useSalesStore();
  const {
    orderQueue,
    initializeOrderQueue,
    addToOrderQueue,
    updateOrderStatus,
    removeFromQueue,
    reorderQueue,
  } = useOrderQueueStore();

  /**
   * fetchTodaySales: 오늘의 매출 조회
   * 현재 날짜의 총 매출을 서버에서 조회하고 상태를 업데이트합니다.
   */
  const fetchTodaySales = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    try {
      const response = await fetch(
        `/api/sales/todaySales?restaurantId=${restaurant.restaurantId}&date=${today}`
      );
      const data = await response.json();
      if (response.ok) {
        setTodaySales(data.totalSales);
      } else {
        console.error("Failed to fetch today's sales:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch today's sales:", error);
    }
  };
  // End of fetchTodaySales

  /**
   * fetchOrders: 주문 목록 조회
   * 현재 활성화된 주문 목록을 서버에서 조회하고 상태를 업데이트합니다.
   */
  const fetchOrders = useCallback(async () => {
    if (!restaurant?.restaurantId) {
      console.error("Restaurant ID is not available");
      return;
    }

    try {
      const response = await fetch(`/api/quick-order?restaurantId=${restaurant.restaurantId}`, {
        headers: {
          Authorization: `Bearer ${restaurantToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const ordersData = await response.json();
      console.log("Fetched orders:", ordersData);

      const activeOrders = ordersData.filter((order) => order.status !== "completed");

      initializeOrderQueue(
        activeOrders.map((order) => ({
          _id: order._id,
          orderNumber: order.orderNumber,
          items: order.items,
          status: order.status,
          totalAmount: order.totalAmount,
          createdAt: order.createdAt,
        }))
      );

      reorderQueue();
      fetchTodaySales();
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(`주문 정보를 불러오는데 실패했습니다: ${error.message}`);
    }
  }, [restaurant?.restaurantId, restaurantToken, initializeOrderQueue, reorderQueue]);
  // End of fetchOrders

  /**
   * handleNewOrder: 새 주문 처리
   * 새로운 주문이 들어왔을 때 호출되어 주문 대기열에 추가합니다.
   */
  const handleNewOrder = useCallback(
    (data) => {
      console.log("New order received:", data);

      const totalAmount = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const newOrder = {
        _id: data._id,
        orderNumber: data.orderNumber,
        items: data.items,
        status: data.status || "pending",
        orderedAt: data.orderedAt || new Date().toISOString(),
        totalAmount: totalAmount,
      };

      addToOrderQueue(newOrder);

      toast.info(`새로운 주문이 접수되었습니다. 주문번호: ${data.orderNumber}`);
    },
    [addToOrderQueue]
  );
  // End of handleNewOrder

  /**
   * initializeSocket: 소켓 초기화
   * 웹소켓 연결을 초기화하고 이벤트 리스너를 설정합니다.
   */
  const initializeSocket = useCallback(() => {
    console.log("initializeSocket called");
    if (!restaurant || !restaurantToken) return null;

    const newSocket = initSocket(restaurant.restaurantId);

    newSocket.on("connect", () => {
      console.log("Restaurant connected to socket");
      console.log("Socket ID:", newSocket.id);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Restaurant disconnected from socket:", reason);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("newQuickOrder", (data) => {
      console.log("newQuickOrder event received:", data);
      handleNewOrder(data);
    });

    newSocket.io.on("reconnect", (attempt) => {
      console.log("Reconnected to server after", attempt, "attempts");
      toast.success("서버에 다시 연결되었습니다.");
    });

    return newSocket;
  }, [restaurant, restaurantToken, handleNewOrder]);
  // End of initializeSocket

  /**
   * useEffect: 인증, 초기화 및 소켓 연결
   * 레스토랑 정보와 토큰 유효성을 확인하고, 주문 목록을 조회하며 소켓 연결을 초기화합니다.
   */
  useEffect(() => {
    console.log("AdminQuickOrderPage useEffect triggered");

    if (!restaurant || !restaurantToken || restaurant.hasTables) {
      console.log("No restaurant or token or hasTables. Redirecting to login...");
      router.push("/restaurant/login");
      return;
    }

    console.log("Initializing AdminQuickOrderPage...");
    fetchOrders();

    const newSocket = initializeSocket();
    if (newSocket) {
      console.log("Socket initialized:", newSocket.id);
      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        console.log("Cleaning up socket connection");
        newSocket.off("newQuickOrder");
        closeSocket();
      }
    };
  }, [restaurant, restaurantToken, router, fetchOrders, initializeSocket]);
  // End of useEffect: 인증, 초기화 및 소켓 연결

  /**
   * handleOrderStatusChange: 주문 상태 변경
   * 주문 상태를 다음 단계로 업데이트하고 서버에 반영합니다.
   */
  const handleOrderStatusChange = useCallback(
    async (orderId, currentStatus) => {
      let newStatus;
      switch (currentStatus) {
        case "pending":
          newStatus = "preparing";
          break;
        case "preparing":
          newStatus = "completed";
          break;
        default:
          return;
      }

      try {
        const response = await fetch("/api/quick-order", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderId,
            newStatus: newStatus,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update order status");
        }

        const updatedOrder = await response.json();
        updateOrderStatus(orderId, newStatus);

        if (newStatus === "completed") {
          removeFromQueue(orderId);
        }

        // toast.success(`주문 상태가 '${newStatus}'로 업데이트되었습니다.`);
        fetchTodaySales();
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error(`주문 상태 업데이트에 실패했습니다: ${error.message}`);
      }
    },
    [updateOrderStatus, removeFromQueue]
  );
  // End of handleOrderStatusChange

  /**
   * formatNumber: 숫자 형식 지정
   * 숫자에 천 단위 구분자를 추가합니다.
   */
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  // End of formatNumber

  /**
   * getStatusColor: 상태별 색상 지정
   * 주문 상태에 따른 배경색을 반환합니다.
   */
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-red-500 text-white";
      case "preparing":
        return "bg-yellow-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500";
    }
  };
  // End of getStatusColor

  /**
   * getStatusText: 상태 텍스트 변환
   * 주문 상태를 한글로 변환합니다.
   */
  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "주문접수";
      case "preparing":
        return "준비중";
      case "completed":
        return "완료";
      default:
        return "알 수 없음";
    }
  };
  // End of getStatusText

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">빠른 주문 관리</h1> */}
      {/* <div className="mb-4">
        <h2 className="text-xl font-semibold">오늘의 매출: {formatNumber(todaySales)}원</h2>
      </div> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orderQueue.map((order) => (
          <div key={order._id} className="bg-white shadow-md rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <span className="text-md font-semibold">주문번호:</span>
                <span className="text-3xl text-red-600 font-bold"> {order.orderNumber}</span>
              </div>
              <div>
                <span className="mx-2"> 현황: </span>
                <span className={`px-2 py-1 rounded ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>
            </div>
            <div className="mt-5">
              <ul className="mb-2">
                {order.items.map((item, index) => (
                  <li
                    key={index}
                    className="flex justify-evenly  border border-b-2 border-gray-200"
                  >
                    <div className="my-4 text-left">
                      <span className="text-gray-600 text-xl font-semibold">{item.name} </span>

                      <span className="text-white text-2xl bg-gray-700 w-6"> {item.quantity}</span>
                    </div>

                    <span className="flex items-center">
                      {formatNumber(item.price * item.quantity)}원
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className="font-bold">총액: {formatNumber(order.totalAmount)}원</span>
              <button
                onClick={() => handleOrderStatusChange(order._id, order.status)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {order.status === "pending" ? "준비 시작" : "완료"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
