//file: \app\admin\layout.js

"use client";
import React, { useEffect, useState } from "react";
import SideNav from "../components/nav/SideNav";
import TopBar from "../components/nav/TobBar";
import { useRouter } from "next/navigation";
import useAuthStore from "../store/useAuthStore";
import LoadingSpinner from "../components/LoadingSpinner";
export default function AdminLayout({ children }) {
  const { restaurant, restaurantToken, fullLogout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  /**
   *
   */

  useEffect(() => {
    if (!restaurant) {
      console.log("No restaurant or token or hasTables. Redirecting to login...");
      fullLogout();
      router.push("/restaurant/login");
    } else {
      setIsLoading(false);
    }
  }, [restaurant, restaurantToken, router]);
  /**
   *
   */
  if (isLoading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }
  /**
   *
   */

  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto ">{children}</main>
      </div>
    </div>
  );
}
