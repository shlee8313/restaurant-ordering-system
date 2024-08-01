"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { initSocket, closeSocket, getSocket } from "../../utils/socket";
import useAuthStore from "../../store/useAuthStore";
import useTableStore from "../../store/useTableStore";
import useNavigationStore from "../../store/useNavigationStore";
import AdvancedTableLayout from "../../components/AdvancedTableLayout";
import { toast } from "react-toastify";

export default function AdminOrderPage() {
  const { restaurant, restaurantToken, refreshToken } = useAuthStore();
  const { isEditMode, tables, toggleEditMode, setTables, updateTable } = useTableStore();
  const { setCurrentPage } = useNavigationStore();
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

  useEffect(() => {
    if (!restaurant || !restaurantToken) {
      router.push("/restaurant/login");
      return;
    }

    let socket;
    const initializeSocket = async () => {
      const fetchedTables = await fetchTables();
      setTables(fetchedTables);

      socket = initSocket(restaurant.restaurantId);

      socket.on("newOrder", (data) => {
        updateTable(data.tableId, { order: { ...data.order, status: "new" } });
      });

      socket.on("tableReset", (tableId) => {
        updateTable(tableId, { order: null });
      });
    };

    initializeSocket();

    return () => {
      if (socket) closeSocket();
    };
  }, [restaurant, restaurantToken, router, updateTable, fetchTables, setTables]);

  const handleUpdateTable = useCallback(
    (id, newProps) => {
      updateTable(id, newProps);
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
      />
    </div>
  );
}
