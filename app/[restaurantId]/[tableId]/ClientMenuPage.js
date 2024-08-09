//file: \app\[restaurantId]\[tableId]\ClientMenuPage.js
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
export const dynamic = "force-dynamic";
export default function MenuPage({ params }) {
  // const { restaurantId, tableId } = useParams();
  const { restaurantId, tableId } = params;
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState({});
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const addOrder = useOrderStore((state) => state.addOrder);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
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
  // useEffect(() => {
  //   const newSocket = io("http://localhost:5000", {
  //     query: { restaurantId },
  //   });

  //   newSocket.on("connect", () => {
  //     console.log("손님측 Connected to server");
  //     setIsConnected(true);
  //   });

  //   newSocket.on("disconnect", () => {
  //     console.log("손님측 Disconnected from server");
  //     setIsConnected(false);
  //   });

  //   newSocket.on("connect_error", (error) => {
  //     console.error("Connection error:", error);
  //     setIsConnected(false);
  //   });

  //   setSocket(newSocket);

  //   return () => {
  //     newSocket.close();
  //     setIsConnected(false);
  //   };
  // }, [restaurantId]);

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

  const placeOrder = useCallback(async () => {
    connectSocket();
    if (!isConnected) {
      console.error("Socket not connected");
      alert("서버와 연결이 끊어졌습니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    const tempId = uuidv4(); // 임시 ID 생성
    const order = {
      tempId,
      restaurantId,
      tableId: Number(tableId), // Number(tableId) tableId를 숫자로 변환
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
        // console.log(res);
        const newOrder = await res.json();
        console.log("placeOrder response", newOrder);
        addOrder(newOrder);
        setCart([]);
        // alert("주문이 완료되었습니다!");
        toast.success("주문이 완료되었습니다!");
        socket.emit("newOrder", newOrder);
      } else {
        toast.error("주문 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("주문 처리 중 오류가 발생했습니다.");
    }
  }, [isConnected, restaurantId, cart]);

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
  const freeOrder = useCallback(
    async (item) => {
      connectSocket();
      if (!isConnected) {
        // console.error("Socket not connected");
        toast.warning("서버와 연결 중입니다. 잠시 후 다시 시도해 주세요.");
        return;
      }

      try {
        const newOrder = {
          restaurantId,
          tableId: Number(tableId), // : Number(tableId) tableId를 숫자로 변환
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

        console.log("손님 호출Emitting new order:", newOrder);
        // alert("요청하였습니다.");

        socket.emit("newOrder", newOrder, (acknowledgement) => {
          if (acknowledgement) {
            // alert("요청하였습니다.");
            toast.success("요청하였습니다.");
            console.log("Received acknowledgment:", acknowledgement);
          } else {
            console.error("No acknowledgment received from server");
            toast.error("주문 처리 중 오류가 발생했습니다.");
          }
        });
        // socket.emit("newOrder", newOrder, (acknowledgement) => {
        //   console.log("Received acknowledgement:", acknowledgement);
        //   if (acknowledgement && acknowledgement.success) {
        //     alert("요청하였습니다.");
        //     alert(acknowledgement.message);
        //     // toast.success(acknowledgement.message);
        //   } else {
        //     console.error("Order not acknowledged properly:", acknowledgement);
        //     toast.error("주문 처리 중 오류가 발생했습니다.");
        //   }
        // });
      } catch (error) {
        console.error("Error placing free order:", error);
        alert("주문 처리 중 오류가 발생했습니다.");
      }
    },
    [isConnected, socket, restaurantId, addOrder, connectSocket]
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="font-sans">
      <h1 className="text-2xl font-bold my-4 px-4">{restaurant.businessName}</h1>
      <p className="px-4 mb-4">테이블 번호: {tableId}</p>
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"}`}>
        <div className={isMobile ? "w-full" : "w-3/4"}>
          <MenuList
            menu={menu}
            addToCart={addToCart}
            isMobile={isMobile}
            freeOrder={freeOrder}
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
            // isConnected={isConnected}
          />
        </div>
      </div>
    </div>
  );
}
