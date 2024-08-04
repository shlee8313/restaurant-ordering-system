import React from "react";
import SideNav from "../components/nav/SideNav";
import TopBar from "../components/nav/TobBar";

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100">
      <SideNav />
      <div className="flex-1 flex flex-col">
        <TopBar />
        <main className="flex-1 overflow-auto ">{children}</main>
      </div>
    </div>
  );
}
