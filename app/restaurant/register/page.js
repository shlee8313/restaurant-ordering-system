"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RestaurantRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [restaurantId, setRestaurantId] = useState("");

  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [tables, setTables] = useState("");
  const [hasTables, setHasTables] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/restaurant/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          restaurantId,
          businessName,
          address,
          phoneNumber,
          businessNumber,
          operatingHours,
          tables,
          hasTables,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to register");
      }

      router.push("/restaurant/login");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Restaurant Register</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="restaurantId" className="block text-gray-700">
            restaurantId
          </label>
          <input
            type="text"
            id="restaurantId"
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="businessName" className="block text-gray-700">
            Business Name
          </label>
          <input
            type="text"
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="address" className="block text-gray-700">
            Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="phoneNumber" className="block text-gray-700">
            Phone Number
          </label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="businessNumber" className="block text-gray-700">
            Business Number
          </label>
          <input
            type="text"
            id="businessNumber"
            value={businessNumber}
            onChange={(e) => setBusinessNumber(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="operatingHours" className="block text-gray-700">
            Operating Hours
          </label>
          <input
            type="text"
            id="operatingHours"
            placeholder="09:00 - 21:00"
            value={operatingHours}
            onChange={(e) => setOperatingHours(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="hasTables"
              checked={hasTables}
              onChange={(e) => setHasTables(e.target.checked)}
              className="mr-2"
            />
            {!hasTables ? "테이블 없음" : "테이블 있음"}
          </label>
        </div>
        {hasTables && (
          <div className="mb-4">
            <label htmlFor="tables" className="block text-gray-700">
              테이블 개수
            </label>
            <input
              type="text"
              id="tables"
              value={tables}
              onChange={(e) => setTables(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
        )}
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}
