"use client";

import { Navbar } from "@/components/layout/navbar";
import { RouteGuard } from "@/components/auth/route-guard";

const protectedLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/employees", label: "Employees" },
  { href: "/tasks", label: "Tasks" },
  { href: "/attendance", label: "Attendance" },
  { href: "/finance", label: "Finance" },
  { href: "/signup", label: "Onboard" },
];

export default function ProtectedLayout({ children }) {
  return (
    <RouteGuard>
      <div className="min-h-screen">
        <Navbar links={protectedLinks} />
        {children}
      </div>
    </RouteGuard>
  );
}