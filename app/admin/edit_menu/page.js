//file: \app\admin\edit_menu\page.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuForm from "../../components/Menuform";
import useAuthStore from "../../store/useAuthStore"; // Import the zustand store
import { v4 as uuidv4 } from "uuid"; // Import UUID generator

export default function AdminMenuEditPage() {
  const [menu, setMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const { restaurant, restaurantToken } = useAuthStore(); // Get restaurant data from the zustand store
  const router = useRouter();

  useEffect(() => {
    if (restaurant) {
      fetchMenu();
    } else {
      router.push("/restaurant/login"); // Redirect to login if not authenticated
    }
  }, [restaurant]);

  const fetchMenu = async () => {
    try {
      const response = await fetch(`/api/edit_menu?restaurantId=${restaurant.restaurantId}`, {
        headers: {
          Authorization: `Bearer ${restaurantToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setMenu(data);
      } else {
        console.error("Failed to fetch menu");
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMenu = async (updatedMenu) => {
    try {
      // Ensure each menu item has a unique ID
      const updatedCategories = updatedMenu.categories.map((category) => ({
        ...category,
        items: category.items.map((item) => ({
          ...item,
          id: item.id || uuidv4(),
        })),
      }));

      const response = await fetch("/api/edit_menu", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${restaurantToken}`,
        },
        body: JSON.stringify({
          ...updatedMenu,
          categories: updatedCategories,
          restaurantId: restaurant.restaurantId,
        }),
      });

      if (response.ok) {
        alert("메뉴가 성공적으로 저장되었습니다.");
        fetchMenu(); // 메뉴 다시 불러오기
      } else {
        const errorData = await response.json();
        console.error("Failed to save menu:", errorData);
        alert(`메뉴 저장에 실패했습니다: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error saving menu:", error);
      alert("메뉴 저장 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      <MenuForm menu={menu} onSave={handleSaveMenu} />
    </div>
  );
}
