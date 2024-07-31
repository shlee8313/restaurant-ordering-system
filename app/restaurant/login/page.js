"use client";

import { useState } from "react";
import useAuthStore from "../../store/useAuthStore";
import { useRouter } from "next/navigation";

export default function RestaurantLoginPage() {
  const router = useRouter();
  const [restaurantId, setRestaurantId] = useState(""); // State for restaurantId input
  const [password, setPassword] = useState(""); // State for password input
  const { setRestaurantToken, setRestaurant } = useAuthStore(); // Destructure set functions from the zustand store
  const [error, setError] = useState(""); // State for error message

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Sending login request to the server
      const res = await fetch("/api/restaurant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setRestaurantToken(data.token); // Set token in the zustand store
        setRestaurant(data.restaurant); // Set restaurant info in the zustand store
        localStorage.setItem("restaurantToken", data.token); // Optionally store the token in localStorage
        localStorage.setItem("tables", data.restaurant.tables); // Store number of tables in localStorage
        router.push("/admin"); // Redirect to admin page on successful login
      } else {
        const errorData = await res.json();
        setError(errorData.message); // Set error message
      }
    } catch (err) {
      setError("An error occurred"); // Handle unexpected errors
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">레스토랑 로그인</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="restaurantId" className="block text-sm font-medium text-gray-700">
                레스토랑 ID
              </label>
              <div className="mt-1">
                <input
                  id="restaurantId"
                  name="restaurantId"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={restaurantId}
                  onChange={(e) => setRestaurantId(e.target.value)} // Update restaurantId state
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Update password state
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                로그인
              </button>
            </div>
          </form>

          {error && <div className="mt-4 text-center text-sm text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
}
