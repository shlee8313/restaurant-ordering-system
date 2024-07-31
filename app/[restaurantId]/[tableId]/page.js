"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import MenuList from "../../components/MenuList";
import Cart from "../../components/Cart";
import useOrderStore from "../../store/orderStore";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function MenuPage() {
  const { restaurantId, tableId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const addOrder = useOrderStore((state) => state.addOrder);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuResponse, restaurantResponse] = await Promise.all([
          fetch(`/api/menu?restaurantId=${restaurantId}`),
          fetch(`/api/restaurant?restaurantId=${restaurantId}`),
        ]);

        const menuData = await menuResponse.json();
        const restaurantData = await restaurantResponse.json();

        if (menuData.menu) {
          setMenu(menuData.menu);
        } else {
          console.error("Menu data is missing.");
        }

        if (restaurantData) {
          setRestaurant(restaurantData);
        } else {
          console.error("Restaurant data is missing.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  const addToCart = (item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateCartItem = (id, quantity) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const placeOrder = async () => {
    const order = {
      restaurantId,
      tableId,
      items: cart,
      status: "pending",
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      if (res.ok) {
        const newOrder = await res.json();
        addOrder(newOrder);
        setCart([]);
        alert("주문이 완료되었습니다!");
      } else {
        alert("주문 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("주문 처리 중 오류가 발생했습니다.");
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="font-sans">
      <h1 className="text-2xl font-bold my-4 px-4">{restaurant.businessName}</h1>
      <p className="px-4 mb-4">테이블 번호: {tableId}</p>
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"}`}>
        <div className={isMobile ? "w-full" : "w-3/4"}>
          <MenuList menu={menu} addToCart={addToCart} isMobile={isMobile} />
        </div>
        <div className={isMobile ? "w-full mt-4" : "w-1/4"}>
          <Cart
            items={cart}
            updateItem={updateCartItem}
            removeItem={removeCartItem}
            placeOrder={placeOrder}
            isMobile={isMobile}
          />
        </div>
      </div>
    </div>
  );
}
