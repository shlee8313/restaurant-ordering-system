//file: \app\admin\page.js
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "../store/useAuthStore";
function page() {
  const router = useRouter();
  const { restaurant, restaurantToken, refreshToken } = useAuthStore();
  console.log(restaurant?.hasTables);
  // useEffect(() => {
  //   if (restaurant) {
  //     if (restaurant.hasTables) {
  //       router.push("/admin/orders"); // 테이블이 있는 식당의 주문 관리 페이지
  //     } else {
  //       router.push("/admin/quick-orders"); // 테이블이 없는 식당의 주문 관리 페이지
  //     }
  //   } else {
  //     router.push("/restaurant/login"); // Redirect to login if not authenticated
  //   }
  // }, [restaurant]);

  return <div>메인페이지</div>;
}

export default page;
