"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, DollarSign, ShoppingBag, Users, Clock, ChevronRight, TrendingUp, Lock, ChefHat, CheckCircle2, AlertCircle, BarChart3, CreditCard, Banknote, XCircle, Plus, Settings, Store, Package, AlertTriangle, Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useVendorAuth } from "@/context/vendor/VendorContext"
import { subscribeToDailySummary, subscribeToOrders, subscribeToStaffActivity, subscribeToMenuItems, toggleShopOnline } from "@/lib/vendor-service"
import type { DailySummary, VendorOrder, StaffActivity, VendorMenuItem } from "@/lib/types/vendor"

export default function VendorDashboard() {
    const { role, shopId, shop, vendorProfile } = useVendorAuth()
    const [summary, setSummary] = useState<DailySummary | null>(null)
    const [activeOrders, setActiveOrders] = useState<VendorOrder[]>([])
    const [staffActivity, setStaffActivity] = useState<StaffActivity[]>([])
    const [menuItems, setMenuItems] = useState<VendorMenuItem[]>([])
    const [isOnline, setIsOnline] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [togglingOnline, setTogglingOnline] = useState(false)

    // Live clock — updates every second for a professional feel
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    // Real-time subscriptions
    useEffect(() => {
        if (!shopId) return

        const unsubSummary = subscribeToDailySummary(shopId, setSummary)
        const unsubOrders = subscribeToOrders(shopId, setActiveOrders)
        const unsubStaff = subscribeToStaffActivity(shopId, setStaffActivity)
        const unsubMenu = subscribeToMenuItems(shopId, setMenuItems)

        return () => {
            unsubSummary()
            unsubOrders()
            unsubStaff()
            unsubMenu()
        }
    }, [shopId])

    useEffect(() => {
        setIsOnline(shop?.isOnline ?? true)
    }, [shop])

    const handleToggleOnline = async () => {
        if (!shopId || togglingOnline) return
        setTogglingOnline(true)
        try {
            await toggleShopOnline(shopId, !isOnline)
            setIsOnline(!isOnline)
        } catch (e) {
            console.error("Failed to toggle shop status:", e)
        }
        setTogglingOnline(false)
    }

    const newOrders = activeOrders.filter(o => o.status === "NEW").length
    const preparingOrders = activeOrders.filter(o => o.status === "PREPARING").length
    const readyOrders = activeOrders.filter(o => o.status === "READY").length

    // Real-time stock analysis
    const lowStockItems = menuItems.filter(m => (m.stock ?? -1) >= 0 && m.stock > 0 && m.stock <= 5)
    const outOfStockItems = menuItems.filter(m => (m.stock ?? -1) === 0)
    const totalMenuItems = menuItems.length
    const availableItems = menuItems.filter(m => m.available).length

    // Get the shop/vendor name dynamically
    const shopName = shop?.name || vendorProfile?.shopName || "My Shop"
    const ownerName = vendorProfile?.name || "Owner"

    const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const formattedDate = currentTime.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

    // Safe summary values (prevents crashes when summary is null — data simply shows 0)
    const s = {
        totalRevenue: summary?.totalRevenue ?? 0,
        onlineRevenue: summary?.onlineRevenue ?? 0,
        cashRevenue: summary?.cashRevenue ?? 0,
        totalOrders: summary?.totalOrders ?? 0,
        completedOrders: summary?.completedOrders ?? 0,
        cancelledOrders: summary?.cancelledOrders ?? 0,
        averageOrderValue: summary?.averageOrderValue ?? 0,
        peakHour: summary?.peakHour ?? "—",
        topSellingItems: summary?.topSellingItems ?? [],
        hourlySales: summary?.hourlySales ?? [],
    }

    return (
        <div className="space-y-5 md:space-y-8 pb-28 md:pb-8 min-h-screen">
            {!isOnline && (
                <div className="bg-red-600 text-white p-4 md:p-6 rounded-[2rem] shadow-xl border-4 border-red-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4">
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl md:text-2xl font-black flex items-center justify-center sm:justify-start gap-2"><WifiOff className="h-6 w-6" strokeWidth={3} /> SHOP IS OFFLINE</h2>
                        <p className="text-red-100 text-sm font-bold mt-1">Customers cannot place new orders right now.</p>
                    </div>
                    <button onClick={handleToggleOnline} disabled={togglingOnline} className="w-full sm:w-auto bg-white text-red-600 font-black text-sm px-6 py-4 rounded-2xl hover:bg-red-50 active:scale-95 transition-all shadow-lg shrink-0 flex items-center justify-center gap-2 ring-4 ring-white/20">
                        {togglingOnline ? "UPDATING..." : "TURN ONLINE NOW"}
                        <Wifi className="h-5 w-5" strokeWidth={3} />
                    </button>
                </div>
            )}
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 truncate">
                            {role === "OWNER" || role === "MANAGER" ? shopName : "Kitchen Operations"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium truncate">
                            {role === "OWNER"
                                ? <>Welcome back, <span className="text-emerald-600 font-bold">{ownerName}</span></>
                                : role === "MANAGER"
                                    ? <>Welcome, <span className="text-emerald-600 font-bold">{ownerName}</span></>
                                    : "Focus on speed and order accuracy."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Live/Offline toggle button */}
                        <button
                            onClick={handleToggleOnline}
                            disabled={togglingOnline}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 rounded-full font-black text-[10px] md:text-xs shadow-sm border-2 transition-all active:scale-95 tracking-wide",
                                isOnline
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-emerald-500/20"
                                    : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 shadow-red-500/20"
                            )}
                        >
                            <span className="relative flex h-2.5 w-2.5 md:h-3 md:w-3">
                                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isOnline ? "bg-emerald-400" : "bg-red-400")}></span>
                                <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5 md:h-3 md:w-3", isOnline ? "bg-emerald-500" : "bg-red-500")}></span>
                            </span>
                            {togglingOnline ? "..." : isOnline ? "ACCEPTING ORDERS" : "SHOP OFFLINE"}
                            {isOnline ? <Wifi className="h-3.5 w-3.5" strokeWidth={2.5} /> : <WifiOff className="h-3.5 w-3.5" strokeWidth={2.5} />}
                        </button>
                        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <Clock className="h-3 w-3" />
                            <span className="tabular-nums">{formattedTime}</span>
                            <span className="text-gray-300">•</span>
                            <span>{formattedDate}</span>
                        </div>
                    </div>
                </div>

                {/* Live Order Ribbon */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1">
                    <Link href="/vendor/orders" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 shrink-0 hover:bg-blue-100 transition-colors">
                        <ShoppingBag className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-bold text-blue-700">{newOrders} New</span>
                    </Link>
                    <Link href="/vendor/orders" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 shrink-0 hover:bg-amber-100 transition-colors">
                        <ChefHat className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-bold text-amber-700">{preparingOrders} Preparing</span>
                    </Link>
                    <Link href="/vendor/orders" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 shrink-0 hover:bg-emerald-100 transition-colors">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-bold text-emerald-700">{readyOrders} Ready</span>
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 shrink-0">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-xs font-bold text-gray-600">{availableItems}/{totalMenuItems} Menu Active</span>
                    </div>
                    {outOfStockItems.length > 0 && (
                        <Link href="/vendor/menu" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-100 shrink-0 hover:bg-red-100 transition-colors animate-pulse">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-xs font-bold text-red-600">{outOfStockItems.length} Sold Out</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Real-time Stock Alerts */}
            {lowStockItems.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-3 animate-in fade-in duration-300">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-amber-800 text-xs">Low Stock Alert</h4>
                        <div className="text-[10px] text-amber-700 mt-0.5 leading-relaxed flex flex-wrap gap-1.5">
                            {lowStockItems.map(i => (
                                <Link key={i.id} href={`/vendor/menu?search=${encodeURIComponent(i.name)}`} className="font-bold underline decoration-amber-300 hover:text-amber-900 bg-amber-100/50 px-1.5 py-0.5 rounded">
                                    {i.name} ({i.stock} left)
                                </Link>
                            ))}
                        </div>
                    </div>
                    <Link href="/vendor/menu" className="text-[10px] font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg shrink-0 transition-colors">
                        Update Stock
                    </Link>
                </div>
            )}
            {outOfStockItems.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3 animate-in fade-in duration-300">
                    <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-red-800 text-xs">Out of Stock</h4>
                        <div className="text-[10px] text-red-600 mt-0.5 leading-relaxed flex flex-wrap items-center gap-1.5">
                            {outOfStockItems.map(i => (
                                <Link key={i.id} href={`/vendor/menu?search=${encodeURIComponent(i.name)}`} className="font-bold underline decoration-red-300 hover:text-red-900 bg-red-100/50 px-1.5 py-0.5 rounded">
                                    {i.name}
                                </Link>
                            ))}
                            <span>— customers can't order these items.</span>
                        </div>
                    </div>
                    <Link href="/vendor/menu" className="text-[10px] font-bold text-red-600 bg-red-100 hover:bg-red-200 px-2.5 py-1 rounded-lg shrink-0 transition-colors">
                        Restock
                    </Link>
                </div>
            )}

            {/* OWNER DASHBOARD */}
            {(role === "OWNER" || role === "MANAGER") && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

                    {/* 1. FINANCIAL SUMMARY CARDS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {/* Total Sales */}
                        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-white to-emerald-50/50 hover:shadow-md transition-all group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-4">
                                <CardTitle className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Today&apos;s Sales</CardTitle>
                                <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <DollarSign className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 md:p-4 pt-0">
                                <div className="text-xl md:text-3xl font-black text-gray-900">₹{s.totalRevenue.toLocaleString()}</div>
                                <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1" /> Live Revenue
                                </p>
                            </CardContent>
                        </Card>

                        {/* Online Revenue */}
                        <Card className="border-border/50 shadow-sm bg-white hover:shadow-md transition-all group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-4">
                                <CardTitle className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Online (UPI)</CardTitle>
                                <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 md:p-4 pt-0">
                                <div className="text-lg md:text-2xl font-black text-gray-900">₹{s.onlineRevenue.toLocaleString()}</div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                    <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${s.totalRevenue > 0 ? Math.round((s.onlineRevenue / s.totalRevenue) * 100) : 0}%` }}></div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 font-medium">{s.totalRevenue > 0 ? Math.round((s.onlineRevenue / s.totalRevenue) * 100) : 0}% of total</p>
                            </CardContent>
                        </Card>

                        {/* Cash Revenue */}
                        <Card className="border-border/50 shadow-sm bg-white hover:shadow-md transition-all group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-4">
                                <CardTitle className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Cash</CardTitle>
                                <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Banknote className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 md:p-4 pt-0">
                                <div className="text-lg md:text-2xl font-black text-gray-900">₹{s.cashRevenue.toLocaleString()}</div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                    <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${s.totalRevenue > 0 ? Math.round((s.cashRevenue / s.totalRevenue) * 100) : 0}%` }}></div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 font-medium">{s.totalRevenue > 0 ? Math.round((s.cashRevenue / s.totalRevenue) * 100) : 0}% of total</p>
                            </CardContent>
                        </Card>

                        {/* Orders */}
                        <Card className="border-border/50 shadow-sm bg-white hover:shadow-md transition-all group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3 md:p-4">
                                <CardTitle className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Orders</CardTitle>
                                <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ShoppingBag className="h-3.5 w-3.5 md:h-4 md:w-4 text-purple-600" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 md:p-4 pt-0">
                                <div className="flex items-baseline gap-2 flex-wrap">
                                    <span className="text-lg md:text-2xl font-black text-gray-900">{s.totalOrders}</span>
                                    {s.cancelledOrders > 0 && (
                                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded flex items-center">
                                            <XCircle className="h-3 w-3 mr-0.5" /> {s.cancelledOrders}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 font-medium">Avg: ₹{s.averageOrderValue}</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-12">

                        {/* 2. ANALYTICS GRAPH */}
                        <Card className="lg:col-span-8 border-border/50 shadow-sm">
                            <CardHeader className="p-3 md:p-5 border-b border-gray-100 flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm md:text-base font-bold flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4 text-gray-500" /> Hourly Sales
                                    </CardTitle>
                                    <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">Peak: <span className="font-bold text-gray-900">{s.peakHour}</span></p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2 bg-gray-100 font-bold text-gray-900">today</Button>
                                    <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-gray-500">week</Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 md:p-5">
                                {s.hourlySales.length > 0 ? (
                                    <>
                                        <div className="h-40 md:h-56 flex items-end justify-between gap-[2px] md:gap-1">
                                            {s.hourlySales.map((h, i) => {
                                                const maxRevenue = Math.max(...s.hourlySales.map(sl => sl.revenue))
                                                const heightPct = maxRevenue > 0 ? (h.revenue / maxRevenue) * 100 : 0
                                                return (
                                                    <div key={i} className="flex flex-col justify-end items-center h-full w-full gap-2 group relative">
                                                        <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                                            {h.hour} • ₹{h.revenue}
                                                        </div>
                                                        <div
                                                            className={cn(
                                                                "w-full rounded-t-sm transition-all duration-500 hover:opacity-80",
                                                                i >= 11 && i <= 14 ? "bg-emerald-500" : "bg-emerald-200"
                                                            )}
                                                            style={{ height: `${heightPct}%`, minHeight: heightPct > 0 ? '2px' : '0' }}
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                        <div className="flex justify-between mt-2 text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                            <span>12 AM</span>
                                            <span>6 AM</span>
                                            <span>12 PM</span>
                                            <span>6 PM</span>
                                            <span>12 AM</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-40 md:h-56 flex items-center justify-center text-gray-400 text-sm font-medium">
                                        <div className="text-center">
                                            <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-30" />
                                            <p>Sales data syncing...</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 3. SIDEBAR: Top Sellers + Stock Overview */}
                        <div className="lg:col-span-4 space-y-4">
                            {/* Top Selling Items */}
                            {s.topSellingItems.length > 0 && (
                                <Card className="border-border/50 shadow-sm">
                                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-3 md:p-4">
                                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                                            🔥 Top Sellers
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-gray-100">
                                            {s.topSellingItems.slice(0, 5).map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
                                                        <span className="text-xs font-bold text-gray-900 truncate">{item.name}</span>
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full shrink-0">{item.count} sold</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Real-time Stock Overview */}
                            <Card className="border-border/50 shadow-sm">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-3 md:p-4">
                                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Package className="h-4 w-4 text-gray-500" /> Stock Overview</span>
                                        <Link href="/vendor/menu" className="text-xs text-blue-600 hover:underline font-bold">Manage</Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 md:p-4 space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center p-2 rounded-lg bg-emerald-50">
                                            <div className="text-lg font-black text-emerald-700">{availableItems}</div>
                                            <div className="text-[9px] font-bold text-emerald-600 uppercase">Active</div>
                                        </div>
                                        <div className="text-center p-2 rounded-lg bg-amber-50">
                                            <div className="text-lg font-black text-amber-700">{lowStockItems.length}</div>
                                            <div className="text-[9px] font-bold text-amber-600 uppercase">Low</div>
                                        </div>
                                        <div className="text-center p-2 rounded-lg bg-red-50">
                                            <div className="text-lg font-black text-red-600">{outOfStockItems.length}</div>
                                            <div className="text-[9px] font-bold text-red-500 uppercase">Out</div>
                                        </div>
                                    </div>
                                    {/* Low stock items list */}
                                    {lowStockItems.length > 0 && (
                                        <div className="space-y-1.5 pt-1">
                                            {lowStockItems.slice(0, 4).map(item => (
                                                <div key={item.id} className="flex items-center justify-between text-xs px-1">
                                                    <span className="text-gray-700 font-medium truncate">{item.name}</span>
                                                    <span className={cn("font-black tabular-nums shrink-0 px-1.5 py-0.5 rounded text-[10px]",
                                                        item.stock <= 2 ? "text-red-600 bg-red-50" : "text-amber-600 bg-amber-50"
                                                    )}>{item.stock} left</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Staff Activity */}
                            <Card className="border-border/50 shadow-sm flex flex-col">
                                <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-3 md:p-4">
                                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                                        <span className="flex items-center gap-2"><ChefHat className="h-4 w-4 text-gray-500" /> Staff Activity</span>
                                        <Link href="/vendor/staff" className="text-xs text-blue-600 hover:underline font-bold">Manage</Link>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 overflow-y-auto max-h-[200px]">
                                    <div className="divide-y divide-gray-100">
                                        {staffActivity.length > 0 ? staffActivity.slice(0, 5).map((log, i) => (
                                            <div key={log.id || i} className="flex flex-col gap-1 p-3 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                                                            {log.staffName.charAt(0)}
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-900">{log.staffName} <span className="font-normal text-gray-500 text-[10px]">({log.staffRole})</span></p>
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 font-medium shrink-0">
                                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className={cn(
                                                    "text-[10px] pl-8 font-medium",
                                                    log.impact === "positive" ? "text-emerald-700" :
                                                        log.impact === "negative" ? "text-red-600" : "text-gray-600"
                                                )}>
                                                    {log.action}
                                                </p>
                                            </div>
                                        )) : (
                                            <div className="p-6 text-center text-gray-400 text-xs">No recent activity</div>
                                        )}
                                    </div>
                                </CardContent>
                                <div className="p-2.5 bg-gray-50 border-t border-gray-100 text-center">
                                    <span className="text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
                                        <Lock className="h-3 w-3" /> Audit Log Secure
                                    </span>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* 4. MANAGEMENT ACTIONS */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <Link href="/vendor/menu" className="block">
                            <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition-all group cursor-pointer h-full">
                                <div className="h-9 w-9 md:h-10 md:w-10 bg-emerald-50 rounded-full flex items-center justify-center mb-2 md:mb-3 group-hover:bg-emerald-100 transition-colors">
                                    <Plus className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-xs md:text-sm">Add Menu Item</h3>
                                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">Update prices & dishes</p>
                            </div>
                        </Link>
                        <Link href="/vendor/staff" className="block">
                            <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all group cursor-pointer h-full">
                                <div className="h-9 w-9 md:h-10 md:w-10 bg-blue-50 rounded-full flex items-center justify-center mb-2 md:mb-3 group-hover:bg-blue-100 transition-colors">
                                    <Users className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-xs md:text-sm">Manage Staff</h3>
                                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">Add users & permissions</p>
                            </div>
                        </Link>
                        <Link href="/vendor/settings" className="block">
                            <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-gray-900 hover:shadow-md transition-all group cursor-pointer h-full">
                                <div className="h-9 w-9 md:h-10 md:w-10 bg-gray-100 rounded-full flex items-center justify-center mb-2 md:mb-3 group-hover:bg-gray-200 transition-colors">
                                    <Store className="h-4 w-4 md:h-5 md:w-5 text-gray-700" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-xs md:text-sm">Shop Settings</h3>
                                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">Timings, UPI & details</p>
                            </div>
                        </Link>
                        <Link href="/vendor/reports" className="block">
                            <div className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 shadow-sm hover:border-purple-500 hover:shadow-md transition-all group cursor-pointer h-full">
                                <div className="h-9 w-9 md:h-10 md:w-10 bg-purple-50 rounded-full flex items-center justify-center mb-2 md:mb-3 group-hover:bg-purple-100 transition-colors">
                                    <Banknote className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                                </div>
                                <h3 className="font-bold text-gray-900 text-xs md:text-sm">Financial Reports</h3>
                                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">Download settlements</p>
                            </div>
                        </Link>
                    </div>
                </div>
            )}


            {/* STAFF DASHBOARD */}
            {role !== "OWNER" && role !== "MANAGER" && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Kitchen Priority Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm col-span-2 md:col-span-1 overflow-hidden relative">
                            <div className="absolute right-0 top-0 p-3 opacity-10">
                                <ShoppingBag className="h-20 w-20" />
                            </div>
                            <CardHeader className="pb-1 p-3 md:p-4">
                                <CardTitle className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500 font-bold">New Orders</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 md:p-4 pt-0">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl md:text-5xl font-black text-blue-600">{newOrders}</span>
                                    <span className="text-xs font-bold bg-blue-50 px-2 py-0.5 rounded-full text-blue-700">Pending</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-medium mt-2 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> {activeOrders.length > 0 ? `Oldest: ${Math.round((Date.now() - new Date(activeOrders[activeOrders.length - 1]?.createdAt).getTime()) / 60000)}m ago` : 'No pending orders'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-l-4 border-l-amber-500 shadow-sm overflow-hidden relative">
                            <div className="absolute right-0 top-0 p-3 opacity-10">
                                <ChefHat className="h-20 w-20" />
                            </div>
                            <CardHeader className="pb-1 p-3 md:p-4">
                                <CardTitle className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500 font-bold">Preparing</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 md:p-4 pt-0">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl md:text-5xl font-black text-amber-500">{preparingOrders}</span>
                                    <span className="text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-full text-amber-700">Active</span>
                                </div>
                                <div className="mt-2 text-[10px] font-medium text-gray-600 truncate">
                                    {activeOrders.filter(o => o.status === "PREPARING").slice(0, 2).map(o => o.items[0]?.name).join(", ") || "None"}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-l-4 border-l-emerald-500 shadow-sm overflow-hidden relative">
                            <div className="absolute right-0 top-0 p-3 opacity-10">
                                <CheckCircle2 className="h-20 w-20" />
                            </div>
                            <CardHeader className="pb-1 p-3 md:p-4">
                                <CardTitle className="text-[10px] md:text-xs uppercase tracking-wider text-gray-500 font-bold">Done Today</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3 md:p-4 pt-0">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl md:text-5xl font-black text-emerald-600">{s.completedOrders}</span>
                                    <span className="text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-emerald-700">Served</span>
                                </div>
                                <p className="text-[10px] text-emerald-600 font-medium mt-2">Great pace! ⚡</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Staff Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <Link href="/vendor/scan" className="block h-28 md:h-36">
                            <Card className="bg-gray-900 border-gray-900 text-white shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all active:scale-[0.99] group h-full cursor-pointer relative overflow-hidden">
                                <div className="absolute right-0 bottom-0 p-4 opacity-20 transform translate-x-4 translate-y-4">
                                    <CheckCircle2 className="h-28 w-28" />
                                </div>
                                <CardContent className="p-4 md:p-6 h-full flex flex-col justify-center relative z-10">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/50 shrink-0">
                                            <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black tracking-tight">Verify Order</h3>
                                            <p className="text-gray-400 font-medium text-xs md:text-sm">Scan Customer QR Code</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        <Link href="/vendor/orders" className="block h-28 md:h-36">
                            <Card className="bg-white border-gray-200 text-gray-900 shadow-sm hover:shadow-xl hover:border-blue-500 hover:scale-[1.01] transition-all active:scale-[0.99] group h-full cursor-pointer relative overflow-hidden">
                                <div className="absolute right-0 bottom-0 p-4 opacity-5 transform translate-x-4 translate-y-4">
                                    <ChefHat className="h-28 w-28" />
                                </div>
                                <CardContent className="p-4 md:p-6 h-full flex flex-col justify-center relative z-10">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                                            <ChefHat className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-black tracking-tight">Kitchen Display</h3>
                                            <p className="text-gray-500 font-medium text-xs md:text-sm">View Live Orders List</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    </div>

                    {/* Staff Stock Alert — real-time */}
                    {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
                        <Card className="border-l-4 border-l-red-500 shadow-sm bg-red-50/50">
                            <CardContent className="p-3 md:p-4 flex gap-3 md:gap-4 items-start">
                                <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-500 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-xs md:text-sm">Stock Alert</h4>
                                    <p className="text-[10px] md:text-xs text-gray-600 mt-1">
                                        {[...outOfStockItems.map(i => <span key={i.id}><span className="font-bold text-red-600">{i.name}</span> (out)</span>),
                                        ...lowStockItems.map(i => <span key={i.id}><span className="font-bold text-amber-600">{i.name}</span> ({i.stock} left)</span>)]
                                            .reduce((acc: any[], elem, idx, arr) => idx < arr.length - 1 ? [...acc, elem, ", "] : [...acc, elem], [])}
                                        {" "}— please inform the manager.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    )
}
