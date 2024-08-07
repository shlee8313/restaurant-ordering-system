"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useNavigationStore from "../../store/useNavigationStore";
import useAuthStore from "../../store/useAuthStore";
import useSalesStore from "../../store/useSalesStore";
import useTableStore from "../../store/useTableStore";
import { format } from "date-fns";

const TopNavigation = () => {
  const { currentPage } = useNavigationStore();
  const { fullLogout, restaurant } = useAuthStore();
  const { todaySales, setTodaySales } = useSalesStore();
  const { tables } = useTableStore();
  const router = useRouter();

  const handleLogout = () => {
    router.push("/restaurant/login"); // Adjust the path as needed
    fullLogout();
  };

  const fetchTodaySales = async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    try {
      const response = await fetch(
        `/api/orders?restaurantId=${restaurant.restaurantId}&date=${today}`
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

  useEffect(() => {
    if (restaurant.restaurantId) {
      fetchTodaySales();

      // 주기적으로 todaySales 업데이트 (예: 5분마다)
    }
  }, [restaurant.restaurantId, tables]);

  return (
    <header className="bg-gray-100 shadow-md py-1 pl-5 flex justify-between items-center">
      <h2 className="text-md font-semibold">{currentPage}</h2>
      <div>
        <span className="mr-10 text-md text-gray-700">
          오늘의 매출: {todaySales.toLocaleString()}원
        </span>
        <button
          onClick={handleLogout}
          className="bg-gray-500 text-white px-4 py-2 mr-20 rounded hover:bg-red-600"
        >
          로그아웃
        </button>
      </div>
    </header>
  );
};

export default TopNavigation;
