"use client";

import { Home, ScanLine, FileText, Settings, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth/AuthContext";

export function Home2BottomNav() {
  const pathname = usePathname();
  const { user, userRole } = useAuth();

  const isActive = (path: string) => {
    if (path === "/home" && pathname === "/home") return true;
    if (path === "/shop" && pathname.includes("/shop")) return true;
    if (path === "/vendor/qr" && pathname.includes("/vendor/qr")) return true;
    if (path === "/order" && pathname.includes("/order")) return true;
    if (path === "/profile" && pathname.includes("/profile")) return true;
    return false;
  };

  return (
    <nav aria-label="Bottom Navigation" className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="relative w-[calc(100%-32px)] sm:w-[380px] md:w-[420px] h-[72px] pointer-events-auto">
        {/* SVG Background for the Curve */}
        <div
          className="absolute inset-x-0 bottom-0 top-0 drop-shadow-[0_8px_32px_rgba(0,0,0,0.15)] 
     rounded-3xl overflow-hidden"
        >
          {" "}
          <svg
            viewBox="0 0 360 72"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M0 24C0 10.7452 10.7452 0 24 0H128.5C135.5 0 142.5 5 146.5 12C154.5 25.5 166.5 32 180 32C193.5 32 205.5 25.5 213.5 12C217.5 5 224.5 0 231.5 0H336C349.255 0 360 10.7452 360 24V72H0V24Z"
              fill="rgba(255, 255, 255, 0.75)"
              className="backdrop-blur-xl"
            />
            {/* Border Line */}
            <path
              d="M0 24C0 10.7452 10.7452 0 24 0H128.5C135.5 0 142.5 5 146.5 12C154.5 25.5 166.5 32 180 32C193.5 32 205.5 25.5 213.5 12C217.5 5 224.5 0 231.5 0H336C349.255 0 360 10.7452 360 24"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1"
            />
          </svg>
          {/* Backdrop Blur Helper */}
          <div
            className="absolute inset-0 -z-10 backdrop-blur-2xl"
            style={{
              clipPath:
                "path('M0 24C0 10.7452 10.7452 0 24 0H128.5C135.5 0 142.5 5 146.5 12C154.5 25.5 166.5 32 180 32C193.5 32 205.5 25.5 213.5 12C217.5 5 224.5 0 231.5 0H336C349.255 0 360 10.7452 360 24V72H0V24Z')",
            }}
          ></div>
        </div>

        {/* Icons Container */}
        <div className="relative h-full px-6 flex justify-between items-center text-gray-500 pb-1">
          {/* Left Group */}
          <div className="flex-1 flex justify-around">
            <Link
              href="/home"
              className={cn(
                "p-3 rounded-full transition-all duration-300 hover:bg-white/40 active:scale-95 border border-transparent hover:border-white/50 shadow-sm hover:shadow-md",
                isActive("/home")
                  ? "text-[#16A34A] bg-white/60 shadow-inner"
                  : "bg-white/20",
              )}
            >
              <Home
                className={cn(
                  "h-6 w-6 stroke-[2.5]",
                  isActive("/home") && "fill-[#16A34A]/20",
                )}
              />
            </Link>
            <Link
              href="/shop"
              className={cn(
                "p-3 rounded-full transition-all duration-300 hover:bg-white/40 active:scale-95 border border-transparent hover:border-white/50 shadow-sm hover:shadow-md",
                isActive("/shop")
                  ? "text-[#16A34A] bg-white/60 shadow-inner"
                  : "bg-white/20",
              )}
            >
              <Search className="h-6 w-6 stroke-[2.5]" />
            </Link>
          </div>

          {/* Center Spacer for QR or Dashboard */}
          <div className="w-20 shrink-0 flex justify-center relative">
            {!user || userRole === "user" ? (
              // customer or guest sees QR scanner button
              <Link href="/scan" className="absolute -top-18 group">
                <div className="absolute inset-0 bg-green-800/40 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></div>
                <div className="relative h-16 w-16 bg-gradient-to-tr from-green-600/60 via-green-700/60 to-green-900/60 backdrop-blur-2xl rounded-full flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.15)] border-2 border-white/30 ring-1 ring-white/20 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                  <ScanLine className="h-8 w-8 text-white stroke-[2]" />
                </div>
              </Link>
            ) : user && userRole ? (
              // non-customer sees dashboard/store button
              <Link
                href={
                  userRole === "vendor_owner"
                    ? "/vendor/dashboard"
                    : userRole === "vendor_staff"
                      ? "/staff/dashboard"
                      : userRole === "admin"
                        ? "/admin/dashboard"
                        : "/"
                }
                className="absolute -top-18 group"
              >
                {/* use amber (Grab & Go) palette with glassmorphism for non-customer dashboard */}
                <div className="absolute inset-0 bg-amber-800/40 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></div>
                <div className="relative h-16 w-16 bg-gradient-to-tr from-amber-700/60 via-amber-800/60 to-amber-900/60 backdrop-blur-2xl rounded-full flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.15)] border-2 border-white/30 ring-1 ring-white/20 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                  <Home className="h-8 w-8 text-white stroke-[2]" />
                </div>
              </Link>
            ) : null}
          </div>
          {/* <div className="w-20 shrink-0 flex justify-center relative">
            {user && userRole === "user" ? (
              // customer sees QR button
              <Link href="/qr" className="absolute -top-18 group">
                <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></div>
                <div className="relative h-16 w-16 bg-gradient-to-tr from-primary/80 via-primary to-primary/80 rounded-full flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.15)] border-[4px] border-white/90 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                  <ScanLine className="h-8 w-8 text-white stroke-[2.5]" />
                </div>
              </Link>
            ) : user && userRole && userRole !== "user" ? (
              // non-customer sees dashboard/store button
              <Link
                href={
                  userRole === "vendor_owner"
                    ? "/vendor/dashboard"
                    : userRole === "vendor_staff"
                      ? "/staff/dashboard"
                      : userRole === "admin"
                        ? "/admin/dashboard"
                        : "/"
                }
                className="absolute -top-18 group"
              >
                <div className="absolute inset-0 bg-primary rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity animate-pulse"></div>
                <div className="relative h-16 w-16 bg-gradient-to-tr from-primary/80 via-primary to-primary/80 rounded-full flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.15)] border-[4px] border-white/90 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
                  <Home className="h-8 w-8 text-white stroke-[2.5]" />
                </div>
              </Link>
            ) : null}
          </div> */}

          {/* Right Group */}
          <div className="flex-1 flex justify-around">
            <Link
              href="/orders"
              className={cn(
                "p-3 rounded-full transition-all duration-300 hover:bg-white/40 active:scale-95 border border-transparent hover:border-white/50 shadow-sm hover:shadow-md",
                isActive("/order")
                  ? "text-[#16A34A] bg-white/60 shadow-inner"
                  : "bg-white/20",
              )}
            >
              <FileText className="h-6 w-6 stroke-[2.5]" />
            </Link>
            <Link
              href="/profile"
              className={cn(
                "p-3 rounded-full transition-all duration-300 hover:bg-white/40 active:scale-95 border border-transparent hover:border-white/50 shadow-sm hover:shadow-md",
                isActive("/profile")
                  ? "text-[#16A34A] bg-white/60 shadow-inner"
                  : "bg-white/20",
              )}
            >
              <Settings className="h-6 w-6 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
