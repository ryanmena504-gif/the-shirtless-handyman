import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

const AppLayout = () => (
  <div className="min-h-screen bg-[color:var(--bh-bg)] text-neutral-100">
    <Sidebar />
    <main
      data-testid="app-main"
      className="lg:pl-60 min-h-screen pb-24 lg:pb-0"
    >
      <Outlet />
    </main>
    <BottomNav />
  </div>
);

export default AppLayout;
