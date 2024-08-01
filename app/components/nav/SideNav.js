"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import useTableStore from "../../store/useTableStore";
import useNavigationStore from "../../store/useNavigationStore";
import useAuthStore from "../../store/useAuthStore";
import { useRouter } from "next/navigation";
const SideNav = () => {
  const { isEditMode, toggleEditMode } = useTableStore();
  const { currentPage, setCurrentPage } = useNavigationStore();
  const { restaurant } = useAuthStore();
  const router = useRouter();
  useEffect(() => {
    if (!restaurant) {
      router.push("/restaurant/login");
      return;
    }
  }, [restaurant]);

  const handleNavClick = (page) => {
    setCurrentPage(page);
  };

  return (
    <nav className="w-64 bg-gray-100 shadow-lg h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">{restaurant?.businessName || "레스토랑"}</h1>
      <ul className="space-y-2">
        <li>
          <Link
            href="/admin/order"
            className="block p-2 hover:bg-blue-200 rounded"
            onClick={() => {
              handleNavClick("주문내역");
              isEditMode && toggleEditMode();
            }}
          >
            주문내역
          </Link>
        </li>
        <li>
          <Link
            href="/admin/sales"
            className="block p-2 hover:bg-blue-200 rounded"
            onClick={() => {
              handleNavClick("매출내역");
              isEditMode && toggleEditMode();
            }}
          >
            매출내역
          </Link>
        </li>
        <li>
          <Link
            href=""
            className="w-full text-left p-2 hover:bg-blue-200 rounded"
            onClick={() => {
              handleNavClick("결제내역");
              isEditMode && toggleEditMode();
            }}
          >
            결제내역
          </Link>
        </li>
        <li>
          <Link
            href="/admin/edit_menu"
            className="w-full text-left p-2 hover:bg-blue-200 rounded"
            onClick={() => {
              handleNavClick("메뉴관리");
              isEditMode && toggleEditMode();
            }}
          >
            메뉴관리
          </Link>
        </li>
        <li>
          <Link
            href="/admin/order"
            className={`w-full text-left p-2 rounded ${
              isEditMode ? "bg-red-500 text-white" : "hover:bg-blue-200"
            }`}
            onClick={() => {
              toggleEditMode();
              handleNavClick(isEditMode ? "주문내역" : "테이블 위치 변경");
            }}
          >
            {isEditMode ? "테이블 위치 편집 종료" : "테이블 위치 변경"}
          </Link>
        </li>
        <li>
          <Link
            href=""
            className="w-full text-left p-2 hover:bg-blue-200 rounded"
            onClick={() => {
              handleNavClick("내정보");
              isEditMode && toggleEditMode();
            }}
          >
            내 정보
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default SideNav;
