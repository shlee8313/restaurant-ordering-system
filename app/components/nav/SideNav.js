"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import useTableStore from "../../store/useTableStore";
import useNavigationStore from "../../store/useNavigationStore";
import useAuthStore from "../../store/useAuthStore";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";
import useSidebarStore from "../../store/usesidebarStore";

import { useRouter } from "next/navigation";
const SideNav = () => {
  const { isEditMode, toggleEditMode } = useTableStore();
  const { currentPage, setCurrentPage } = useNavigationStore();
  const { restaurant } = useAuthStore();
  const { isSideBarOpen, sideBartoggle } = useSidebarStore();

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
    <div
      className={`relative bg-gray-200 text-gray-600 transition-all duration-300 ${
        isSideBarOpen ? "w-64" : "w-16"
      }`}
    >
      <button
        onClick={sideBartoggle}
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-gray-600 rounded-full p-1 shadow-md"
      >
        {isSideBarOpen ? (
          <ChevronLeft size={20} className="text-white" />
        ) : (
          <ChevronRight size={20} className="text-white" />
        )}
      </button>
      <div className="p-4 h-16 flex items-center ">
        <div>
          <Menu size={24} className="text-gray-600" />
        </div>

        {isSideBarOpen && (
          <h1 className="text-xl font-bold ml-5">{restaurant?.businessName || "레스토랑"}</h1>
        )}
      </div>
      <nav className={`mt-8 ${isSideBarOpen ? "block" : "hidden"}`}>
        {/* <nav className="w-64 bg-gray-100 shadow-lg h-screen p-6"> */}

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
    </div>
  );
};

export default SideNav;
