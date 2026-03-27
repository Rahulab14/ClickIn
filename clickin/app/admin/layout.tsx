"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import {
    Loader2,
    LayoutDashboard,
    Store,
    Users,
    FileText,
    Settings,
    LogOut,
    ShieldCheck,
    Bell,
    ChevronRight,
    Search,
    MonitorPlay
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navigation = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Live Showcase", href: "/admin/showcase", icon: MonitorPlay },
        { name: "Vendors", href: "/admin/vendors", icon: Store },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Reports", href: "/admin/reports", icon: FileText },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* Desktop Sidebar */}
            <aside className="fixed inset-y-0 left-0 w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 hidden lg:flex flex-col z-50">
                <div className="h-20 flex items-center px-8 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-gray-900 tracking-tighter leading-none text-xl">MISSION</span>
                            <span className="font-bold text-[10px] text-emerald-600 uppercase tracking-[0.2em] mt-1">Control</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide">
                    <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Main Menu</p>
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all group",
                                    isActive
                                        ? "bg-gray-900 text-white shadow-xl shadow-gray-200 translate-x-1"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-400" : "text-gray-400 group-hover:text-gray-600")} />
                                    {item.name}
                                </div>
                                {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-gray-50 space-y-4">
                    <div className="bg-gray-50 p-4 rounded-3xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 border-2 border-white overflow-hidden shadow-sm">
                            <div className="w-full h-full flex items-center justify-center text-emerald-700 font-bold">A</div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 truncate">System Admin</p>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Prime Access</p>
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            // Import action natively inside the handler to prevent component top-level static bindings
                            const { logoutAdminSession } = await import("@/lib/actions/admin-auth");
                            await logoutAdminSession();
                            window.location.href = "/admin-login";
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all active:scale-95"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <div className="lg:pl-72 flex flex-col min-h-screen">
                {/* Desktop Header */}
                <header className={cn(
                    "sticky top-0 z-40 flex h-20 items-center justify-between px-8 transition-all duration-300",
                    scrolled ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm" : "bg-transparent"
                )}>
                    <div className="flex items-center gap-4 lg:hidden">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <ShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="font-black text-xl text-gray-900 tracking-tighter uppercase">Admin</h1>
                    </div>

                    <div className="hidden lg:flex items-center bg-white rounded-2xl border border-gray-100 px-4 h-11 w-96 shadow-sm group focus-within:border-emerald-500/50 transition-all">
                        <Search className="h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search everything..."
                            className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full ml-3 placeholder:text-gray-400"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="relative w-11 h-11 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-500 hover:text-emerald-600 transition-all shadow-sm">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white ring-2 ring-emerald-500/20 animate-pulse" />
                        </button>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100 ml-2">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </div>
                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest hidden sm:inline">System Live</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 pb-32">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation - Glassmorphism Dock */}
            <div className="fixed bottom-6 left-6 right-6 lg:hidden z-50">
                <nav className="bg-gray-900/95 backdrop-blur-2xl px-2 py-2 rounded-[2.5rem] shadow-2xl shadow-gray-900/40 border border-white/10 flex items-center justify-between">
                    {navigation.slice(0, 4).map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center gap-1.5 py-3 rounded-[2rem] transition-all relative overflow-hidden flex-1",
                                    isActive ? "text-white scale-110" : "text-gray-500 grayscale opacity-60"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110" : "")} />
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-white/10 -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                    <Link
                        href="/admin/settings"
                        className={cn(
                            "flex flex-col items-center gap-1.5 py-3 rounded-[2rem] transition-all relative overflow-hidden flex-1",
                            pathname === "/admin/settings" ? "text-white scale-110" : "text-gray-500 grayscale opacity-60"
                        )}
                    >
                        <Settings className="w-5 h-5" />
                    </Link>
                </nav>
            </div>
        </div>
    );
}

import { motion } from "framer-motion";
