//file: \app\admin\sales\page.js

"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import * as XLSX from "xlsx";
import useAuthStore from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";

// Tooltip 컴포넌트 (변경 없음)
const Tooltip = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
        {children}
      </div>
      {isVisible && (
        <div className="absolute z-10 p-2 -mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg">
          {content}
        </div>
      )}
    </div>
  );
};

const SalesCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("total");
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { restaurant } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!restaurant) {
      router.push("/restaurant/login");
    } else {
      fetchSalesData();
    }
  }, [restaurant, router, currentDate]);

  const fetchSalesData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/sales?restaurantId=${restaurant.restaurantId}&month=${
          currentDate.getMonth() + 1
        }&year=${currentDate.getFullYear()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch sales data");
      }
      const data = await response.json();
      setSalesData(data);
    } catch (error) {
      console.error("Failed to fetch sales data:", error);
      // 여기에 에러 처리 로직을 추가할 수 있습니다 (예: 에러 메시지 표시)
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1);
    setCurrentDate(newDate);
    setSelectedDate(null);
    // 월이 변경될 때 새로운 데이터를 가져옵니다
    fetchSalesData();
  };

  const handleDateClick = (day) => {
    const clickedDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    const selectedData = salesData.find((data) => data.date === clickedDate);
    setSelectedDate(selectedData ? clickedDate : null);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today.toISOString().split("T")[0]);
    fetchSalesData();
  };

  const renderCalendarContent = (day) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    const dailySales = salesData.find((data) => data.date === dateString);

    if (!dailySales) return null;

    const tooltipContent = (
      <div>
        <div className="font-bold mb-2">총 매출: ₩{dailySales.totalSales.toLocaleString()}</div>
        {dailySales.items.map((item, index) => (
          <div key={index}>
            {item.name}: {item.quantity} (₩{item.sales.toLocaleString()})
          </div>
        ))}
      </div>
    );

    if (viewMode === "total") {
      return (
        <Tooltip content={tooltipContent}>
          <div className="text-lg font-medium text-gray-700 mt-1">
            ₩ {dailySales.totalSales.toLocaleString()}
          </div>
        </Tooltip>
      );
    } else {
      return (
        <Tooltip content={tooltipContent}>
          <div className="text-xs text-gray-600 mt-1">
            {dailySales.items.slice(0, 5).map((item, index) => (
              <div key={index} className="truncate">
                {item.name}: {item.quantity}
              </div>
            ))}
            {dailySales.items.length > 5 && (
              <div className="text-blue-600 font-semibold text-sm">
                + {dailySales.items.length - 5} more
              </div>
            )}
          </div>
        </Tooltip>
      );
    }
  };
  /**
   * 

   * 
   */

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="bg-white border border-gray-200"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isToday = dateString === new Date().toISOString().split("T")[0];
      const isSunday =
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay() === 0;
      const isSaturday =
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay() === 6;

      days.push(
        <div
          key={day}
          className={`bg-white p-4 border h-36  border-gray-200 transition-all duration-200 hover:shadow-md cursor-pointer flex flex-col
            ${selectedDate === dateString ? "ring-2 ring-blue-400" : ""}
            ${isToday ? "bg-blue-50" : ""}`}
          onClick={() => handleDateClick(day)}
        >
          {/* 
            날짜 셀 높이 조정:
            - h-24 추가: 각 날짜 셀의 높이를 96px(6rem)로 설정
            - flex flex-col 추가: 내부 컨텐츠를 세로로 정렬
            이렇게 하면 요일 헤더(h-12)의 두 배 높이가 되어 균형잡힌 레이아웃을 만들 수 있습니다.
          */}
          <div
            className={`text-sm font-medium ${isSunday ? "text-red-500" : ""} ${
              isSaturday ? "text-blue-500" : ""
            }`}
          >
            {day}
          </div>
          {renderCalendarContent(day)}
        </div>
      );
    }

    return days;
  };

  const downloadExcel = () => {
    const excelData = salesData.map((day) => ({
      날짜: day.date,
      총매출: day.totalSales,
      ...day.items.reduce((acc, item) => {
        acc[`${item.name} 수량`] = item.quantity;
        acc[`${item.name} 매출`] = item.sales;
        return acc;
      }, {}),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "매출 데이터");
    XLSX.writeFile(wb, `매출_${currentDate.getFullYear()}년_${currentDate.getMonth() + 1}월.xlsx`);
  };

  return (
    <div className="max-w-screen mx-auto p-4 h-full  overflow-hidden mt-3  flex flex-col bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
          </h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white text-gray-700 rounded-full shadow hover:bg-gray-100 transition-colors duration-200"
          >
            오늘
          </button>
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <button
            onClick={() => setViewMode("total")}
            className={`px-4 py-2 rounded-full shadow transition-colors duration-200 ${
              viewMode === "total"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            매출총액
          </button>
          <button
            onClick={() => setViewMode("items")}
            className={`px-4 py-2 rounded-full shadow transition-colors duration-200 ${
              viewMode === "items"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            매출품목
          </button>
          <button
            onClick={downloadExcel}
            className="px-4 py-2 rounded-full shadow bg-green-500 text-white flex items-center hover:bg-green-600 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            엑셀 다운로드
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar bg-white rounded-lg shadow">
        <div className="grid grid-cols-7 h-full">
          {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
            <div
              key={day}
              className={`text-center flex flex-col justify-end py-1 text-xs h-12  font-medium text-gray-700 border-b border-r border-gray-200
                ${index === 0 ? "text-red-500" : ""} 
                ${index === 6 ? "text-blue-500" : ""}`}
            >
              {/* 
                요일 높이에 해당하는 부분:
                - py-1: 상하 패딩을 1단위로 설정 (y축 방향 여백)
                - text-xs: 글자 크기를 extra small로 설정
                이 두 속성을 조절하여 요일 부분의 높이를 제어할 수 있습니다.
              */}
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
};

export default SalesCalendar;
