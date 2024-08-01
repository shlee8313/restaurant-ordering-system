"use client";

import React from "react";
import { useRouter } from "next/navigation";
import useNavigationStore from "../../store/useNavigationStore";
import useAuthStore from "../../store/useAuthStore";

const TopNavigation = () => {
  const { currentPage } = useNavigationStore();
  const { fullLogout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    // Optionally redirect the user to the login page or home page
    router.push("/restaurant/login"); // Adjust the path as needed
    // Perform logout actions
    fullLogout();
  };

  return (
    <header className="bg-white shadow-md py-1 pl-5 flex justify-between items-center">
      <h2 className="text-md font-semibold">{currentPage}</h2>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        로그아웃
      </button>
    </header>
  );
};

export default TopNavigation;
