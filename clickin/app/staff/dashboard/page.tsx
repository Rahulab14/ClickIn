"use client"

import { useEffect, useState } from "react"
import { useStaff } from "@/context/staff/StaffContext"
import { subscribeToOrders, updateOrderStatus } from "@/lib/vendor-service"
import type { VendorOrder, OrderStatus } from "@/lib/types/vendor"
import { Clock, ChefHat, CheckSquare, PackageCheck, AlertCircle, PlayCircle, Store, Coffee, X, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

// Order Progress Stepper (Parity with Vendor)
function OrderProgress({ status }: { status: OrderStatus }) {
    const steps = ["NEW", "PREPARING", "READY", "COMPLETED"] as OrderStatus[]
    const currentIndex = steps.indexOf(status)
    if (status === "CANCELLED") {
        return <div className="flex items-center gap-1 text-[10px] text-red-600 font-bold uppercase"><X className="h-3 w-3" /> Cancelled</div>
    }
    return (
        <div className="flex items-center gap-1">
            {steps.map((step, i) => (
                <div key={step} className="flex items-center">
                    <div className={cn(
                        "h-2 w-2 rounded-full transition-all duration-500",
                        i <= currentIndex ? "bg-emerald-500 scale-110 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-gray-200"
                    )} />
                    {i < steps.length - 1 && (
                        <div className={cn("h-[1px] w-3 md:w-4", i < currentIndex ? "bg-emerald-500" : "bg-gray-100")} />
                    )}
                </div>
            ))}
        </div>
    )
}

function getNextStatus(current: OrderStatus): OrderStatus | null {
    switch (current) {
        case "NEW": return "PREPARING"
        case "PREPARING": return "READY"
        case "READY": return "COMPLETED"
        default: return null
    }
}

function getNextStatusLabel(current: OrderStatus): string {
    switch (current) {
        case "NEW": return "Start Prep"
        case "PREPARING": return "Mark Ready"
        case "READY": return "Handover"
        default: return ""
    }
}

function getTimeSince(dateString: string) {
    const timeDiff = Date.now() - new Date(dateString).getTime()
    const minutes = Math.floor(timeDiff / 60000)
    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    const extraMinutes = minutes % 60
    return `${hours}h ${extraMinutes}m ago`
}

export default function StaffDashboardPage() {
    const { shopId, staffProfile, isStaffLoading } = useStaff()
    const [orders, setOrders] = useState<VendorOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    // Force real-time updates for the "time since" display every minute
    const [, setTick] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => setTick(t => t + 1), 60000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!shopId) return

        setLoading(true)
        const unsubscribe = subscribeToOrders(shopId, (liveOrders) => {
            // Sort to show oldest NEW orders first, then by priority/status
            const sortedOrders = [...liveOrders].sort((a, b) => {
                const statusWeight = { "NEW": 1, "PREPARING": 2, "READY": 3, "COMPLETED": 4, "CANCELLED": 5 };
                const weightA = statusWeight[a.status] || 9;
                const weightB = statusWeight[b.status] || 9;

                if (weightA !== weightB) return weightA - weightB;

                // Oldest first for active
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            })
            setOrders(sortedOrders)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [shopId])

    const handleUpdateStatus = async (orderId: string, currentStatus: OrderStatus) => {
        if (!shopId) return;

        const nextStatus = getNextStatus(currentStatus);
        if (!nextStatus) return;

        const staffId = staffProfile?.id || staffProfile?.uid || "staff-unknown";
        setActionLoading(orderId);

        // Optimistic UI Update - manually update local state so it feels instant
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o))

        try {
            await updateOrderStatus(orderId, nextStatus, { handledByStaffId: staffId })
            // Success: listener will eventually bring the "true" state from DB
        } catch (error) {
            console.error("Failed to update status", error)
            // Rollback on error - the listener or a re-fetch might be needed, but for now just log
        } finally {
            setActionLoading(null)
        }
    }

    if (isStaffLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm border border-gray-100 animate-in zoom-in duration-500">
                    <Coffee className="h-10 w-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Kitchen is Clear</h2>
                <p className="text-gray-500 max-w-xs font-medium leading-relaxed">
                    No active orders at the moment. Take a breather, or help prep for the next rush!
                </p>
                <div className="mt-8 flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-600 text-xs font-bold uppercase tracking-widest animate-pulse">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    Waiting for incoming orders
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <header className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-gray-900 mb-1">Live Kitchen</h1>
                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60">Staff Production Line</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </div>
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Live Sync</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {orders.map((order) => {
                    // Compute visual traits for different statuses
                    const isNew = order.status === "NEW";
                    const isPreparing = order.status === "PREPARING";
                    const isReady = order.status === "READY";

                    // Priority visual for old NEW orders (> 15 mins)
                    const isDelayed = isNew && (Date.now() - new Date(order.createdAt).getTime()) > 15 * 60000;

                    return (
                        <div
                            key={order.id}
                            className={cn(
                                "bg-white rounded-[2.5rem] shadow-sm border border-gray-100/50 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/40 group relative",
                                isDelayed ? "border-red-500/30" : ""
                            )}
                        >
                            {isDelayed && (
                                <div className="absolute top-0 left-0 right-0 h-1 bg-red-500 z-20" />
                            )}

                            {/* Card Header */}
                            <div className={cn(
                                "p-6 border-b border-gray-50 transition-colors",
                                isNew ? (isDelayed ? "bg-red-50/50" : "bg-gray-50/50") : "",
                                isPreparing ? "bg-blue-50/50" : "",
                                isReady ? "bg-emerald-50/50" : ""
                            )}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1.5 leading-none">Order Slot</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-gray-900 text-2xl tracking-tighter leading-none">
                                                #{order.id.slice(-4).toUpperCase()}
                                            </span>
                                            <OrderProgress status={order.status} />
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={cn(
                                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-none",
                                        isNew ? (isDelayed ? "bg-red-500 text-white" : "bg-blue-600 text-white") : "",
                                        isPreparing ? "bg-amber-400 text-white shadow-sm shadow-amber-200" : "",
                                        isReady ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200" : ""
                                    )}>
                                        {order.status}
                                    </Badge>
                                </div>

                                {/* Order Meta Grid */}
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <div className="bg-white/80 p-2.5 rounded-2xl flex items-center gap-2 border border-gray-100 shadow-sm">
                                        <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center">
                                            <Clock className="h-3 w-3 text-gray-400" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-600 truncate">{getTimeSince(order.createdAt)}</span>
                                    </div>
                                    <div className="bg-white/80 p-2.5 rounded-2xl flex items-center gap-2 border border-gray-100 shadow-sm">
                                        <div className="w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center">
                                            <Store className="h-3 w-3 text-gray-400" />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-600 truncate">{order.orderType}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body - Content */}
                            <div className="p-6 flex-1 bg-gradient-to-b from-white to-gray-50/30">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] leading-none">Kitchen Load</span>
                                    <span className="text-[10px] font-bold text-gray-400 leading-none">{order.items.length} Units</span>
                                </div>

                                <ul className="space-y-3">
                                    {order.items.map((item, idx) => (
                                        <li key={idx} className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center font-black text-xs text-gray-400 border border-gray-100">
                                                    {item.quantity}
                                                </div>
                                                <span className="font-bold text-gray-800 text-sm truncate max-w-[120px]">
                                                    {item.name}
                                                </span>
                                            </div>
                                            {item.isVeg !== undefined && (
                                                <div className={cn(
                                                    "h-3.5 w-3.5 rounded-[3px] border-[1.5px] p-[1.5px] flex items-center justify-center",
                                                    item.isVeg ? "border-emerald-600" : "border-rose-600"
                                                )}>
                                                    <div className={cn("h-full w-full rounded-full", item.isVeg ? "bg-emerald-600" : "bg-rose-600")} />
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Card Footer - Dynamic Actions */}
                            <div className="p-6 pt-0 bg-gray-50/30">
                                <button
                                    disabled={actionLoading === order.id}
                                    onClick={() => handleUpdateStatus(order.id, order.status)}
                                    className={cn(
                                        "w-full py-4 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.15em] transition-all relative overflow-hidden flex items-center justify-center gap-3",
                                        isNew ? "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5" : "",
                                        isPreparing ? "bg-amber-500 text-white shadow-lg shadow-amber-100 hover:shadow-amber-200 hover:-translate-y-0.5" : "",
                                        isReady ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100 hover:shadow-emerald-200 hover:-translate-y-0.5" : "",
                                        actionLoading === order.id ? "opacity-70 cursor-not-allowed translate-y-0" : ""
                                    )}
                                >
                                    {actionLoading === order.id ? (
                                        <Clock className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            {isNew && <><PlayCircle className="h-4 w-4" /> {getNextStatusLabel(order.status)}</>}
                                            {isPreparing && <><ChefHat className="h-5 w-5" /> {getNextStatusLabel(order.status)}</>}
                                            {isReady && <><PackageCheck className="h-5 w-5" /> {getNextStatusLabel(order.status)}</>}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
