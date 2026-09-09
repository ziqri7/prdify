"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X, LogOut, LayoutDashboard, Sun, Moon } from "lucide-react";
import { useState, useEffect, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useTheme } from "next-themes";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface NavLink {
  href: string;
  label: string;
  badge?: string;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const navLinks: NavLink[] = [
    { href: "/", label: "Beranda" },
    { href: "/pricing", label: "Harga", badge: "Promo" },
    { href: "/template", label: "Inspirasi" },
  ];

  const getUserInitial = () => {
    if (user?.email) return user.email.charAt(0).toUpperCase();
    if (user?.user_metadata?.full_name)
      return (user.user_metadata.full_name as string).charAt(0).toUpperCase();
    return "U";
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name as string;
    if (user?.email) return user.email;
    return "User";
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[#dcdee1]/80 dark:border-[#3a4155]/80 bg-white/80 dark:bg-[#1c2332]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#df5c37] text-white shadow-lg shadow-[#df5c37]/20 transition-transform group-hover:scale-105">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-gray-900 dark:text-white">BuatPake</span>
            <span className="text-[#df5c37]">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#6a7180] dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors inline-flex items-center gap-1.5"
            >
              {link.label}
              {link.badge && (
                <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="inline-flex items-center justify-center rounded-lg h-9 w-9 text-[#6a7180] dark:text-gray-400 hover:bg-[#f3f5f6] dark:hover:bg-[#2a3040] transition-colors"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
          )}
          <div className="flex items-center gap-3">
            {loading ? null : user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-[#6a7180] dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fffbeb] dark:bg-[#d97706]/20 text-[#d97706] dark:text-[#fbbf24] text-xs font-semibold">
                    {getUserInitial()}
                  </div>
                  <span className="hidden lg:inline max-w-[120px] truncate">
                    {getUserDisplayName()}
                  </span>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Masuk
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="sm">Buat PRD</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-[#f3f5f6] dark:hover:bg-[#2a3040] transition-colors"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile nav */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileOpen ? "max-h-80 border-t border-[#dcdee1] dark:border-[#3a4155]" : "max-h-0"
        )}
      >
        <div className="space-y-1 px-4 py-3">
          {/* User info (mobile) */}
          {user && (
            <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-[#f3f5f6] dark:bg-[#1c2332]/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fffbeb] dark:bg-[#d97706]/20 text-[#d97706] dark:text-[#fbbf24] text-sm font-semibold">
                {getUserInitial()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {getUserDisplayName()}
                </p>
                {user.email && (
                  <p className="text-xs text-[#6a7180] dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-[#6a7180] dark:text-gray-400 hover:bg-[#f3f5f6] dark:hover:bg-[#2a3040] transition-colors"
            >
              {link.label}
              {link.badge && (
                <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-2 border-t border-[#dcdee1] dark:border-[#3a4155] mt-2">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                >
                  <Button variant="outline" className="w-full gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  className="w-full gap-2"
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Masuk
                  </Button>
                </Link>
                <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Buat PRD</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
