"use client";

import { useState } from "react";
import useAuthStore from "../store/useAuthStore";

export default function UserLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUserToken, setUser } = useAuthStore();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUserToken(data.token);
        setUser(data.user);
        localStorage.setItem("userToken", data.token);
        // Redirect or handle successful login
      } else {
        const errorData = await res.json();
        setError(errorData.message);
      }
    } catch (err) {
      setError("An error occurred");
    }
  };

  return (
    <div>
      <h1>User Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}
