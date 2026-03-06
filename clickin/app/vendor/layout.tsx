"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ShoppingBag, ScanLine, UtensilsCrossed, BarChart3, Settings, LogOut, Menu, ChevronRight, Store, Users, CreditCard, Bell } from "lucide-react"
import { useState, useEffect } from "react"
import { Logo } from "@/components/ui/Logo"
import { useAuth } from "@/context/auth/AuthContext"
import { VendorProvider, useVendor } from "@/context/vendor/VendorContext"

function VendorLayoutInner({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { user, userRole, userStatus, logout, loading } = useAuth()
    const { vendorProfile, shop, role, isVendorLoading, isDemo, isPendingApproval } = useVendor()

    // route protection logic
    useEffect(() => {
        if (!loading && !isVendorLoading) {
            // Unauthenticated users trying to access vendor pages (ALLOW /vendor and /vendor/signup)
            if (!user && pathname !== "/vendor" && pathname !== "/vendor/signup") {
                router.replace("/vendor") // Redirect to vendor login instead of customer login
                return
            }

            // Authenticated non-vendors trying to access vendor pages
            if (user && userRole === "user" && pathname.startsWith("/vendor")) {
                router.replace("/") // Or a "not authorized" page
                return
            }

            // Redirect pending vendors to the pending-approval page
            if (user && (userRole === "vendor_owner" || userRole === "vendor_staff")) {
                // If pending, force them to pending-approval
                if (userStatus === "pending" && pathname !== "/vendor/pending-approval") {
                    router.replace("/vendor/pending-approval")
                    return
                }

                // Setup redirect logic for owners
                if (userRole === "vendor_owner" && shop) {
                    const isSetupIncomplete = !shop.category || !shop.campus || !shop.upiId;

                    if (isSetupIncomplete && pathname !== "/vendor/setup") {
                        router.replace("/vendor/setup");
                        return;
                    }

                    // If active and setup is complete, redirect away from auth pages
                    if (userStatus === "active" && !isSetupIncomplete && (pathname === "/vendor" || pathname === "/vendor/signup" || pathname === "/vendor/pending-approval" || pathname === "/vendor/setup")) {
                        router.replace("/vendor/dashboard")
                        return;
                    }
                } else {
                    // Standard logic for staff
                    if (userStatus === "active" && (pathname === "/vendor" || pathname === "/vendor/signup" || pathname === "/vendor/pending-approval")) {
                        router.replace("/vendor/dashboard")
                        return;
                    }
                }
            }
        }
    }, [loading, isVendorLoading, user, userRole, pathname, router, shop])

    // Don't render sidebar on vendor login, signup, setup, and pending pages
    if (pathname === "/vendor" || pathname === "/vendor/signup" || pathname === "/vendor/pending-approval" || pathname === "/vendor/setup") {
        return <>{children}</>
    }

    if (loading || isVendorLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                    <p className="text-sm text-gray-500 font-medium">Loading...</p>
                </div>
            </div>
        )
    }

    // Unauthenticated or unauthorized rendering fallback (should be caught by useEffect redirect)
    if (!user || (userRole !== "vendor_owner" && userRole !== "vendor_staff")) {
        return null; // Let the redirect handle it
    }

    const staffRole = vendorProfile?.role || null

    // Staff pending approval screen
    if (isPendingApproval) {
        const isRejected = vendorProfile?.status === "REJECTED"
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className={cn(
                        "h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg",
                        isRejected ? "bg-red-100 shadow-red-100" : "bg-blue-100 shadow-blue-100"
                    )}>
                        {isRejected ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                    </div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">
                        {isRejected ? "Access Denied" : "Waiting for Approval"}
                    </h1>
                    <p className="text-gray-500 mb-2">
                        {isRejected
                            ? "The shop owner has declined your access request."
                            : "Your request to join has been sent to the shop owner."
                        }
                    </p>
                    {vendorProfile?.shopName && (
                        <p className="text-sm font-bold text-blue-600 bg-blue-50 inline-block px-3 py-1 rounded-full mb-6">
                            Shop: {vendorProfile.shopName}
                        </p>
                    )}
                    {!isRejected && (
                        <p className="text-sm text-gray-400 mb-8">
                            You&apos;ll get access once the owner approves your request. Please check back later.
                        </p>
                    )}
                    <button
                        onClick={async () => { await logout(); router.push("/vendor") }}
                        className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        <LogOut className="h-4 w-4 inline mr-2" />
                        Sign Out
                    </button>
                </div>
            </div>
        )
    }

    const navItems = [
        { name: "Dashboard", href: "/vendor/dashboard", icon: LayoutDashboard, roles: ["OWNER", "MANAGER", "CHEF", "WAITER", "CASHIER"] },
        { name: "Live Orders", href: "/vendor/orders", icon: ShoppingBag, roles: ["OWNER", "MANAGER", "CHEF", "WAITER", "CASHIER"] },
        { name: "Scan Order", href: "/vendor/scan", icon: ScanLine, roles: ["OWNER", "MANAGER", "WAITER", "CASHIER"] },
        { name: "Menu Items", href: "/vendor/menu", icon: UtensilsCrossed, roles: ["OWNER", "MANAGER"] },
        { name: "QR Standee", href: "/vendor/qr", icon: Store, roles: ["OWNER", "MANAGER"] },
        { name: "Staff", href: "/vendor/staff", icon: Users, roles: ["OWNER", "MANAGER"] },
        { name: "Analytics", href: "/vendor/reports", icon: BarChart3, roles: ["OWNER"] },
        { name: "Payments", href: "/vendor/payments", icon: CreditCard, roles: ["OWNER"] },
        { name: "Settings", href: "/vendor/settings", icon: Settings, roles: ["OWNER", "MANAGER"] },
    ]

    const handleLogout = async () => {
        await logout()
        router.push("/vendor")
    }

    const shopName = shop?.name || "My Shop"
    const shopInitials = shopName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <Logo width={140} height={50} />
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                    <div className="h-10 w-10 bg-white rounded-full border border-gray-200 flex items-center justify-center text-emerald-600 bg-emerald-50">
                        <Store className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{shopName}</p>
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {shop?.isOnline ? "Online" : "Offline"}
                        </div>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Menu</p>
                {navItems.filter(item => !staffRole || item.roles.includes(staffRole)).map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium group relative overflow-hidden",
                                isActive
                                    ? "bg-gray-900 text-white shadow-md shadow-gray-200"
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}
                            <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-emerald-400" : "text-gray-400 group-hover:text-gray-600")} />
                            <span className="flex-1">{item.name}</span>
                            {isActive && <ChevronRight className="h-4 w-4 text-gray-500 opacity-50" />}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-white hover:shadow-sm hover:text-red-600 rounded-xl transition-all font-bold text-sm bg-transparent border border-transparent hover:border-gray-200"
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
                <div className="mt-4 flex items-center gap-3 px-2">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-white">
                        {shopInitials}
                    </div>
                    <div className="text-xs">
                        <p className="font-bold text-gray-900">{shopName}</p>
                        <p className="text-gray-500">{staffRole || "Staff"}</p>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans text-gray-900">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 fixed h-full z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                <SidebarContent />
            </aside>

            {/* Mobile Header / Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 w-[80%] max-w-sm bg-white z-50 transform transition-transform duration-300 md:hidden shadow-2xl",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 md:ml-72 flex flex-col min-h-screen transition-all duration-300">
                {/* Mobile Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between md:hidden sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg active:scale-95 transition-transform"
                        >
                            <Menu className="h-6 w-6 text-gray-700" />
                        </button>
                        <Logo width={120} height={40} />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs">
                            {shopInitials}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    return (
        <VendorProvider>
            <VendorLayoutInner>{children}</VendorLayoutInner>
        </VendorProvider>
    )
}
