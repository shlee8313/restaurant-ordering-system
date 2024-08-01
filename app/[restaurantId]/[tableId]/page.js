"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import MenuList from "../../components/MenuList";
import Cart from "../../components/Cart";
import useOrderStore from "../../store/orderStore";
import LoadingSpinner from "../../components/LoadingSpinner";
import { io } from "socket.io-client";

export default function MenuPage() {
  const { restaurantId, tableId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const addOrder = useOrderStore((state) => state.addOrder);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      query: { restaurantId },
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [restaurantId]);

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
        console.log(menuData);
        if (menuData.categories) {
          setMenu(menuData.categories);
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
        socket.emit("newOrder", order);
        alert("주문이 완료되었습니다!");
      } else {
        alert("주문 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("주문 처리 중 오류가 발생했습니다.");
    }
  };

  // const freeOrder = async (item) => {
  //   try {
  //     const response = await fetch("/api/orders", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         restaurantId, // 실제 레스토랑 ID로 대체해야 합니다
  //         tableId, // 실제 테이블 ID로 대체해야 합니다
  //         items: [
  //           {
  //             name: item.name,
  //             price: 0, // 무료 서비스이므로 가격은 0입니다
  //             quantity: 1,
  //           },
  //         ],
  //         status: "pending",
  //       }),
  //     });

  //     if (response.ok) {
  //       const newOrder = await response.json();
  //       console.log("Free order created:", newOrder);
  //       // addOrder(newOrder);
  //       // setCart([]);
  //       alert("주문이 완료되었습니다!");
  //     } else {
  //       alert("주문 처리 중 오류가 발생했습니다.");
  //     }
  //   } catch (error) {
  //     console.error("Error placing order:", error);
  //     alert("주문 처리 중 오류가 발생했습니다.");
  //   }

  //   // 여기에 주문 성공 후의 로직을 추가할 수 있습니다 (예: 알림 표시)
  // };
  const freeOrder = async (item) => {
    try {
      const newOrder = {
        restaurantId,
        tableId,
        items: [
          {
            name: item.name,
            price: 0,
            quantity: 1,
          },
        ],
        status: "pending",
        orderedAt: new Date().toISOString(),
      };

      // 소켓을 통해 새 주문 정보 전송
      socket.emit("newOrder", newOrder, (acknowledgement) => {
        if (acknowledgement.success) {
          // Zustand store에 주문 추가 (필요한 경우)
          addOrder(newOrder);
          // 성공 알림 표시
          alert("주문이 완료되었습니다!");

          // 추가적인 성공 후 로직
          // 예: UI 새로고침 등
        } else {
          alert("주문 처리 중 오류가 발생했습니다.");
        }
      });
    } catch (error) {
      console.error("Error placing free order:", error);
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
          <MenuList menu={menu} addToCart={addToCart} isMobile={isMobile} freeOrder={freeOrder} />
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
