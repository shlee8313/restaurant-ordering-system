//file: \app\components\Cart.js

"use client";

import React, { useState } from "react";
import { X, ShoppingCart } from "lucide-react";

export default function Cart({
  items,
  updateItem,
  removeItem,
  placeOrder,
  isMobile,
  connectSocket,
}) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handlePlaceOrder = () => {
    connectSocket();
    placeOrder();
  };
  /**
   *
   */
  console.log(items);
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  /**
   *
   */
  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  /*
   *
   */

  const CartContent = () => (
    <>
      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div key={item.id} className="border p-2 rounded flex justify-between items-center mr-5">
            <span>{item.name}</span>
            <div>
              <button
                onClick={() => updateItem(item.id, item.quantity - 1)}
                className="bg-red-500 text-white px-2 py-1 rounded mr-2"
              >
                -
              </button>
              <span className="p-2">{item.quantity}</span>
              <button
                onClick={() => updateItem(item.id, item.quantity + 1)}
                className="bg-green-500 text-white px-2 py-1 rounded ml-2"
              >
                +
              </button>
            </div>
            <span>
              {formatNumber(item.quantity * item.price)} <span className="text-xs "> 원</span>
            </span>
          </div>
        ))}
        <div className="mt-5 p-2  mr-5 text-right border  rounded-lg shadow-sm">
          <span className="text-xs">총합계: </span>
          <span className="text-lg font-semibold">{formatNumber(calculateTotal())}</span>
          <span className="text-xs "> 원</span>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-4 right-4 bg-gray-600 text-white p-4 rounded-full shadow-lg z-50 "
        >
          <div className="relative">
            <ShoppingCart className="w-8 h-8" />
            {items.length > 0 && (
              <span className="absolute top-1 right-1 bg-white text-gray-600 text-sm font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
        </button>

        {isCartOpen && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">장바구니</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
              <CartContent />
            </div>
            <div className="border-t p-4">
              {items.length === 0 ? (
                <button className="w-full bg-blue-200 text-white py-3 rounded-lg text-lg font-semibold">
                  주문하기
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  // disabled={!isConnected}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold"
                >
                  주문하기
                </button>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-4">장바구니</h2>
      <CartContent />
      {items.length === 0 ? (
        <button className="w-full bg-blue-200 text-white py-3 rounded-lg text-lg font-semibold ">
          주문하기
        </button>
      ) : (
        <button
          onClick={handlePlaceOrder}
          // disabled={!isConnected}
          className="w-full bg-blue-500 text-white py-2 rounded mt-4 cursor-pointer"
        >
          주문하기
        </button>
      )}
    </div>
  );
}
