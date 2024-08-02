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
  const { isEditMode, tables, toggleEditMode, setTables, updateTable, addTable, removeTable } =
    useTableStore();
  const { setCurrentPage } = useNavigationStore();
  const [socket, setSocket] = useState(null);
  const router = useRouter();

  const fetchTables = useCallback(async () => {
    try {
      const response = await fetch(`/api/tables?restaurantId=${restaurant?.restaurantId}`, {
        headers: {
          Authorization: `Bearer ${restaurantToken}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          await refreshToken();
          throw new Error("Token refreshed. Please try again.");
        }
        throw new Error("Failed to fetch tables");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast.error("테이블 정보를 불러오는데 실패했습니다.");
      return [];
    }
  }, [restaurant?.restaurantId, restaurantToken, refreshToken]);

  const initializeSocket = useCallback(() => {
    if (!restaurant || !restaurantToken) return null;

    const newSocket = initSocket(restaurant.restaurantId);

    newSocket.on("connect", () => {
      console.log("식당측 connected");
      // console.log("서버에 연결되었습니다.");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("식당측 disconnected:", reason);
      // toast.warning("서버와의 연결이 끊어졌습니다. 재연결 시도 중...");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      // toast.error("서버 연결 중 오류가 발생했습니다.");
    });

    newSocket.on("newOrder", (data) => {
      console.log("New order received:", data);
      updateTable(data.tableId, {
        order: {
          items: data.items,
          status: data.status,
          orderedAt: data.orderedAt,
        },
        status: "occupied", // 테이블 상태를 'occupied'로 변경
      });

      console.log("Current tables after update:", useTableStore.getState().tables);
      // console.log("Updated tables:", useTableStore.getState().tables);
      toast.info(`새로운 주문이 접수되었습니다. 테이블: ${data.tableId} ${data.items[0].name}`);
    });
    // newSocket.on("tableReset", (tableId) => {
    //   console.log("Table reset:", tableId);
    //   updateTable(tableId, { order: null });
    //   toast.info(`테이블 ${tableId}가 초기화되었습니다.`);
    // });

    newSocket.io.on("reconnect", (attempt) => {
      console.log("Reconnected to server after", attempt, "attempts");
      toast.success("서버에 다시 연결되었습니다.");
    });

    return newSocket;
  }, [restaurant, restaurantToken, updateTable]);

  useEffect(() => {
    if (!restaurant || !restaurantToken) {
      router.push("/restaurant/login");
      return;
    }

    const setupSocketAndFetchTables = async () => {
      const fetchedTables = await fetchTables();
      setTables(fetchedTables);

      const newSocket = initializeSocket();
      if (newSocket) {
        setSocket(newSocket);
      }
    };

    setupSocketAndFetchTables();

    return () => {
      if (socket) {
        closeSocket();
      }
    };
  }, [restaurant, restaurantToken, router, fetchTables, setTables, initializeSocket]);
  console.log(tables);

  // const handleUpdateTable = useCallback(
  //   (id, newProps) => {
  //     updateTable(id, newProps);
  //   },
  //   [updateTable]
  // );
  const handleUpdateTable = useCallback(
    (id, newProps) => {
      console.log(`Updating table ${id} with:`, newProps);
      updateTable(id, newProps);
      // 상태 업데이트 후 즉시 로그를 출력하는 대신, 다음 렌더링 주기에 로그를 출력합니다.
      setTimeout(() => {
        console.log("Current tables after update:", useTableStore.getState().tables);
      }, 0);
    },
    [updateTable]
  );

  const handleSaveLayout = async (newTables) => {
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
      toast.error("테이블 레이아웃 저장에 실패했습니다.");
    }
  };

  useEffect(() => {
    console.log("Tables updated:", tables);
  }, [tables]);

  // console.log(tables);

  const renderTableContent = useCallback((table) => {
    const order = table.order;
    return (
      <div className="w-full h-full p-2 overflow-auto">
        {order ? (
          <div>
            <ul className="text-sm">
              {order.items.map((item, index) => (
                <li key={index}>
                  {item.name} x {item.quantity}
                </li>
              ))}
            </ul>
            <p className="text-sm mt-2">상태: {order.status}</p>
          </div>
        ) : (
          <p className="text-sm">주문 없음</p>
        )}
      </div>
    );
  }, []);

  if (!restaurant) return <div>Loading...</div>;

  return (
    <div className="p-4">
      {/* <h1 className="text-2xl font-bold mb-4">주문 관리 - {restaurant.businessName}</h1>
      <button onClick={toggleEditMode} className="mb-4 bg-blue-500 text-white px-4 py-2 rounded">
        {isEditMode ? "편집 모드 종료" : "테이블 위치 변경"}
      </button> */}
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
