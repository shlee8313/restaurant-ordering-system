//file: \app\admin\quick-order\page.js
"use client";

import React, { useEffect } from "react";
import useAuthStore from "@/app/store/useAuthStore";
import { useRouter } from "next/navigation";
function page() {
  const { restaurant, restaurantToken, fullLogout } = useAuthStore();
  const router = useRouter();
  /**
   *
   */
  useEffect(() => {
    if (!restaurant || !restaurantToken || restaurant.hasTables) {
      console.log("No restaurant or token or hasTables. Redirecting to login...");
      fullLogout();
      router.push("/restaurant/login");
      return;
    }
  }, [restaurant, restaurantToken, router]);

  return <div>QUIck PAGE</div>;
}

export default page;
