"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Receipt, ScanLine, Banknote, User, LogOut, Store } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { Logo } from "@/components/ui/Logo"
import { useAuth } from "@/context/auth/AuthContext"
import { StaffProvider, useStaff } from "@/context/staff/StaffContext"

function StaffLayoutInner({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, userRole, logout, loading } = useAuth()
    const { staffProfile, shop, isStaffLoading, isPendingApproval } = useStaff()

    // Route protection logic
    useEffect(() => {
        if (!loading && !isStaffLoading) {
            // Unauthenticated users
            if (!user) {
                router.replace("/staff-login")
                return
            }

            // Authenticated non-staff trying to access staff pages
            if (user && userRole !== "vendor_staff") {
                router.replace("/") // Unauthorized
                return
            }
        }
    }, [loading, isStaffLoading, user, userRole, pathname, router])

    if (loading || isStaffLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user || userRole !== "vendor_staff") {
        return null; // Next.js will redirect
    }

    // Staff pending approval screen inline
    if (isPendingApproval) {
        const isRejected = staffProfile?.status === "REJECTED"
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className={cn(
                        "h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg",
                        isRejected ? "bg-red-100 shadow-red-100" : "bg-emerald-100 shadow-emerald-100"
                    )}>
                        {isRejected ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">
                        {isRejected ? "Access Denied" : "Waiting for Approval"}
                    </h1>
                    <p className="text-gray-500 mb-2">
                        {isRejected
                            ? "The shop owner has declined your access request or your account is inactive."
                            : "Your request to join has been sent to the shop owner."
                        }
                    </p>
                    {shop?.name && (
                        <p className="text-sm font-bold text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-full mb-6">
                            Shop: {shop.name}
                        </p>
                    )}
                    {!isRejected && (
                        <p className="text-sm text-gray-400 mb-8">
                            You'll get access once the owner approves your request to join the operational dashboard.
                        </p>
                    )}
                    <button
                        onClick={async () => { await logout(); router.push("/staff-login") }}
                        className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors inline-flex items-center"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                    </button>
                </div>
            </div>
        )
    }

    const navItems = [
        { name: "Live", href: "/staff/dashboard", icon: LayoutDashboard },
        { name: "Orders", href: "/staff/orders", icon: Receipt },
        { name: "Scan", href: "/staff/scan", icon: ScanLine },
        { name: "Cash", href: "/staff/cash", icon: Banknote },
        { name: "Profile", href: "/staff/profile", icon: User },
    ]

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-emerald-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-4">
                    <Logo width={90} height={25} />
                    <div className="h-6 w-[1px] bg-gray-100 hidden sm:block" />
                    <Badge variant="outline" className={cn(
                        "hidden sm:flex items-center gap-1.5 px-2.5 py-1 font-bold border-none bg-transparent",
                        shop?.isOnline ? "text-emerald-600" : "text-gray-400"
                    )}>
                        <div className={cn("h-2 w-2 rounded-full", shop?.isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-300")} />
                        {shop?.isOnline ? "Shop Live" : "Shop Offline"}
                    </Badge>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black text-gray-900 leading-tight uppercase tracking-tight">{shop?.name}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest opacity-80">{staffProfile?.role}</p>
                    </div>
                    <div className="h-10 w-10 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-black text-sm ring-2 ring-white shadow-sm border border-emerald-200/50">
                        {staffProfile?.name?.charAt(0) || "S"}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 p-4 pb-24 md:pb-8 overflow-y-auto overflow-x-hidden">
                <div className="max-w-4xl mx-auto w-full">
                    {children}
                </div>
            </main>

            {/* Bottom Nav for Mobile/Tablet */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.04)] z-50">
                <div className="flex justify-around items-center px-2 py-2 max-w-md mx-auto relative">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all relative group",
                                    isActive ? "text-emerald-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                                )}
                            >
                                {/* Active Indicator background bubble */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-emerald-50 rounded-2xl -z-10 scale-90 animate-in zoom-in duration-200" />
                                )}
                                <Icon className={cn("h-5 w-5 mb-1 transition-transform", isActive && "scale-110")} />
                                <span className={cn("text-[10px] font-bold tracking-tight", isActive ? "text-emerald-600" : "text-gray-500")}>
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    return (
        <StaffProvider>
            <StaffLayoutInner>{children}</StaffLayoutInner>
        </StaffProvider>
    )
}
