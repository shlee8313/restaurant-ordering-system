//file: \app\components\MenuList.js

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

export default function MenuList({ menu, addToCart, freeOrder, isMobile, connectSocket }) {
  const [activeCategory, setActiveCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const menuCategories = menu.map((category) => category.name);
    setCategories(menuCategories);
    if (menuCategories.length > 0) {
      setActiveCategory(menuCategories[0]);
    }
  }, [menu]);

  const handleAddToCart = (item) => {
    connectSocket();
    addToCart(item);
  };

  const handleFreeOrder = (item) => {
    connectSocket();
    freeOrder(item);
  };

  return (
    <div className={`${isMobile ? "flex flex-col" : "flex"}`}>
      <div className={isMobile ? "w-full mb-4 overflow-x-hidden" : "w-1/4 pr-4"}>
        <div className={`flex ${isMobile ? "overflow-x-auto custom-scrollbar" : "flex-col"}`}>
          {categories.map((category) => (
            <button
              key={category}
              className={`${
                isMobile
                  ? "flex-shrink-0 px-4 py-2 mr-2 whitespace-nowrap"
                  : "w-full text-left p-2 my-1"
              } rounded ${
                activeCategory === category ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className={isMobile ? "w-full" : "w-3/4"}>
        <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
          {activeCategory &&
            menu
              .find((category) => category.name === activeCategory)
              ?.items.map((item) => (
                <div
                  key={item.name}
                  className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative w-full h-32 mb-2">
                    <Image
                      src={item.image}
                      alt={item.name}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                  <h3 className="text-lg font-bold">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  {item.price ? (
                    <p className="text-green-600 font-semibold">{item.price.toLocaleString()}원</p>
                  ) : (
                    <p className="text-green-600 font-semibold">무료 서비스</p>
                  )}
                  {activeCategory === "호출" ? (
                    <button
                      className="mt-2 w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
                      onClick={() => handleFreeOrder(item)}
                    >
                      바로 주문하기
                    </button>
                  ) : (
                    <button
                      className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                      onClick={() => handleAddToCart(item)}
                    >
                      장바구니에 추가
                    </button>
                  )}
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
