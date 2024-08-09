// file: app/[restaurantId]/order/page.js

// 테이블 없는 식당 주문
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import MenuList from "../../components/MenuList";
import Cart from "../../components/Cart";
import useOrderStore from "../../store/orderStore";
import LoadingSpinner from "../../components/LoadingSpinner";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
/**
 *
 */
// export const dynamic = "force-dynamic";
export default function NoTableMenuPage({ params }) {
  // const { restaurantId } = useParams();
  const { restaurantId } = params;
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const addOrder = useOrderStore((state) => state.addOrder);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const socketServerUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;

  const initializeSocket = useCallback(() => {
    const newSocket = io(socketServerUrl, {
      query: { restaurantId },
    });

    newSocket.on("connect", () => {
      console.log("손님측 Connected to server");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("손님측 Disconnected from server");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return newSocket;
  }, [restaurantId]);

  const connectSocket = useCallback(() => {
    const currentSocket = socket || initializeSocket();
    if (!currentSocket.connected) {
      currentSocket.connect();
    }
  }, [socket, initializeSocket]);

  useEffect(() => {
    initializeSocket();
    return () => {
      if (socket) {
        console.log("손님측 소켓 이니셜라이즈 실팬");
        socket.disconnect();
      }
    };
  }, [initializeSocket]);

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
    connectSocket();
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
  /**
   *
   */
  const placeOrder = useCallback(async () => {
    connectSocket();
    if (!isConnected) {
      console.error("Socket not connected");
      toast.error("서버와 연결이 끊어졌습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const tempId = uuidv4();
    const order = {
      tempId,
      restaurantId,
      items: cart,
      status: "pending",
    };

    try {
      const res = await fetch("/api/quick-order", {
        // 여기를 수정했습니다
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });

      if (res.ok) {
        const newOrder = await res.json();
        console.log("placeOrder response", newOrder);
        addOrder(newOrder);
        setCart([]);
        setOrderNumber(newOrder.orderNumber);
        toast.success(`주문이 완료되었습니다! 주문번호: ${newOrder.orderNumber}`);
        socket.emit("newQuickOrder", newOrder);
      } else {
        toast.error("주문 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("주문 처리 중 오류가 발생했습니다.");
    }
  }, [isConnected, restaurantId, cart, addOrder, socket]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="font-sans">
      <h1 className="text-2xl font-bold my-4 px-4">{restaurant?.businessName}</h1>
      {orderNumber && <p className="px-4 mb-4 text-lg font-semibold">주문번호: {orderNumber}</p>}
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"}`}>
        <div className={isMobile ? "w-full" : "w-3/4"}>
          <MenuList
            menu={menu}
            addToCart={addToCart}
            isMobile={isMobile}
            connectSocket={connectSocket}
          />
        </div>
        <div className={isMobile ? "w-full mt-4" : "w-1/4"}>
          <Cart
            items={cart}
            updateItem={updateCartItem}
            removeItem={removeCartItem}
            placeOrder={placeOrder}
            isMobile={isMobile}
            connectSocket={connectSocket}
          />
        </div>
      </div>
    </div>
  );
}
