"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

export default function Cart({ items, updateItem, removeItem, placeOrder, isMobile }) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const CartContent = () => (
    <>
      <div className="space-y-2 mb-4">
        {items.map((item) => (
          <div key={item.id} className="border p-2 rounded flex justify-between items-center">
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
          </div>
        ))}
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg z-50"
        >
          장바구니 ({items.length})
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
              {items.length === 0 && (
                <button className="w-full bg-blue-200 text-white py-3 rounded-lg text-lg font-semibold">
                  주문하기
                </button>
              )}
              <button
                onClick={placeOrder}
                className="w-full bg-blue-500 text-white py-3 rounded-lg text-lg font-semibold"
              >
                주문하기
              </button>
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
      <button onClick={placeOrder} className="w-full bg-blue-500 text-white py-2 rounded mt-4">
        주문하기
      </button>
    </div>
  );
}
