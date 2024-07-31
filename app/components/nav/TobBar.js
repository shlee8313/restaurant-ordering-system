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
    // Perform logout actions
    fullLogout();

    // Optionally redirect the user to the login page or home page
    router.push("/restaurant/login"); // Adjust the path as needed
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h2 className="text-xl font-semibold">{currentPage}</h2>
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
