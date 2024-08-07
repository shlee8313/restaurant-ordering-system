"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import * as XLSX from "xlsx";

// Generate 50 days of sample data
const generateSalesData = () => {
  const data = [];
  const startDate = new Date("2024-08-01");
  const menuItems = ["아메리카노", "카페라떼", "크로플", "녹차", "핫초코", "베이글", "치즈케이크"];

  for (let i = 0; i < 50; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    const items = menuItems.map((item) => ({
      name: item,
      quantity: Math.floor(Math.random() * 50) + 1,
      price: Math.floor(Math.random() * 3000) + 3000,
    }));

    const totalSales = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    data.push({
      date: currentDate.toISOString().split("T")[0],
      totalSales,
      items,
    });
  }

  return data;
};

const salesData = generateSalesData();

const SalesCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date("2024-08-01"));
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("total");

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
    setSelectedDate(null);
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
  };

  const renderCalendarContent = (day) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    const dailySales = salesData.find((data) => data.date === dateString);

    if (!dailySales) return null;

    if (viewMode === "total") {
      return (
        <div className="text-sm font-medium text-gray-800">
          {dailySales.totalSales.toLocaleString()}
        </div>
      );
    } else {
      return (
        <div className="text-xs">
          {dailySales.items.slice(0, 3).map((item, index) => (
            <div key={index}>
              {item.name}: {item.quantity}
            </div>
          ))}
        </div>
      );
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="border border-transparent"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isSunday =
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay() === 0;

      days.push(
        <div
          key={day}
          className={`border max-h-[80px] p-2 cursor-pointer h-96 ${
            selectedDate === dateString
              ? "bg-blue-50 border-blue-500"
              : "bg-white hover:bg-gray-100 border-gray-300"
          }`}
          onClick={() => handleDateClick(day)}
        >
          <div className={`text-md ${isSunday ? "text-red-600" : "text-gray-400"}`}>{day}</div>
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
        acc[`${item.name} 매출`] = item.quantity * item.price;
        return acc;
      }, {}),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "매출 데이터");
    XLSX.writeFile(wb, `매출_${currentDate.getFullYear()}년_${currentDate.getMonth() + 1}월.xlsx`);
  };

  return (
    <div className="max-w-7xl max-h-screen mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center bg-white p-2 rounded shadow">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex space-x-2 items-center mx-4">
            <button onClick={goToToday} className="px-3 py-1 bg-blue-600 text-white rounded shadow">
              오늘
            </button>
            <h2 className="text-xl font-semibold">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </h2>
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode("total")}
            className={`px-4 py-2 rounded shadow ${
              viewMode === "total" ? "bg-gray-700 text-white" : "bg-gray-200"
            }`}
          >
            매출총액
          </button>
          <button
            onClick={() => setViewMode("items")}
            className={`px-4 py-2 rounded shadow ${
              viewMode === "items" ? "bg-gray-700 text-white" : "bg-gray-200"
            }`}
          >
            매출품목
          </button>
          <button
            onClick={downloadExcel}
            className="px-4 py-2 rounded shadow bg-green-500 text-white flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            엑셀 다운로드
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px  mb-4  border border-gray-300 bg-gray-100 rounded-md overflow-hidden">
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className="text-center font-semibold py-2 text-gray-700 bg-gray-200">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>

      {selectedDate && (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-4 w-1/2">
          <h3 className="text-lg font-semibold mb-2">{selectedDate} 상세 매출</h3>
          <table className="w-full text-sm text-left rtl:text-right text-gray-800 dark:text-white">
            <thead className="text-xs text-gray-800 uppercase dark:text-white">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-right">
                  Sales
                </th>
              </tr>
            </thead>
            <tbody>
              {salesData
                .find((data) => data.date === selectedDate)
                ?.items.map((item, index) => (
                  <tr
                    key={index}
                    className={`border-b ${index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap dark:text-blue-100">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-800">{item.quantity}</td>
                    <td className="px-6 py-4 text-right text-gray-800">
                      ₩{(item.quantity * item.price).toLocaleString()}
                    </td>
                  </tr>
                ))}
              <tr className="font-semibold bg-gray-100 text-gray-700">
                <td className="px-6 py-4 text-right" colSpan="2">
                  총 매출:
                </td>
                <td className="px-6 py-4 text-right">
                  ₩
                  {salesData
                    .find((data) => data.date === selectedDate)
                    ?.totalSales.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesCalendar;
