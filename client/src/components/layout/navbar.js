"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "#overview", label: "Overview" },
  { href: "#operations", label: "Operations" },
  { href: "#team", label: "Team" },
  { href: "#finance", label: "Finance" },
];

function Navbar({ brand = "SBMS", links = navItems, className }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, signOut } = useAuth();

  return (
    <header className={cn("sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl", className)}>
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-300 text-sm font-black text-slate-950 shadow-lg shadow-sky-950/20">
            {brand.slice(0, 2).toUpperCase()}
          </span>
          <span className="grid leading-tight">
            <span className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">{brand}</span>
            <span className="text-xs text-slate-500">Business operations suite</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              <div className="grid text-right">
                <span className="text-sm font-medium text-white">{user?.name ?? "Signed in"}</span>
                <span className="text-xs text-slate-400">{user?.role ?? "Active session"}</span>
              </div>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Sign out
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="lg:hidden"
          onClick={() => setMobileOpen((current) => !current)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          Menu
        </Button>
      </div>

      <div
        id="mobile-navigation"
        className={cn(
          "border-t border-white/10 bg-slate-950/90 px-6 py-4 lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <div className="grid gap-2 sm:grid-cols-2">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          {isAuthenticated ? (
            <>
              <div className="grid">
                <span className="text-sm font-medium text-white">{user?.name ?? "Signed in"}</span>
                <span className="text-xs text-slate-400">{user?.role ?? "Active session"}</span>
              </div>
              <Button variant="secondary" size="sm" onClick={signOut}>
                Sign out
              </Button>
            </>
          ) : (
            <Button variant="primary" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export { Navbar };