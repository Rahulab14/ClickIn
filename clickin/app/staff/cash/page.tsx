"use client"

import { useEffect, useState } from "react"
import { useStaff } from "@/context/staff/StaffContext"
import { subscribeToOrders, updateOrderStatus } from "@/lib/vendor-service"
import type { VendorOrder } from "@/lib/types/vendor"
import { Banknote, CheckCircle2, PackageCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StaffCashPage() {
    const { shopId, staffProfile, isStaffLoading } = useStaff()
    const [orders, setOrders] = useState<VendorOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        if (!shopId) return

        setLoading(true)
        const unsubscribe = subscribeToOrders(shopId, (liveOrders) => {
            // Filter only CASH payments that are not yet tracking as "completed" or "cancelled"
            // Typically, cash is collected when order is handed over (READY state)
            const cashOrders = liveOrders
                .filter(o => o.payment === "CASH" && (o.status === "READY" || o.status === "PREPARING" || o.status === "NEW"))
                .sort((a, b) => {
                    const statusWeight = { "READY": 1, "PREPARING": 2, "NEW": 3 };
                    const weightA = statusWeight[a.status as keyof typeof statusWeight] || 9;
                    const weightB = statusWeight[b.status as keyof typeof statusWeight] || 9;

                    if (weightA !== weightB) return weightA - weightB;
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                })

            setOrders(cashOrders)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [shopId])

    const handleConfirmCash = async (orderId: string) => {
        if (!shopId || !staffProfile?.id) return
        setActionLoading(orderId)

        try {
            await updateOrderStatus(orderId, "COMPLETED", { handledByStaffId: staffProfile.id })

            // Notification or local state update can go here, but the listener will remove it
        } catch (error) {
            console.error("Failed to confirm cash", error)
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Banknote className="h-10 w-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">No Cash Orders</h2>
                <p className="text-gray-500 max-w-sm font-medium">
                    All current active orders are pre-paid via UPI.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <header className="mb-8 text-center mt-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Banknote className="h-8 w-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 mb-2">Cash Collection</h1>
                <p className="text-sm text-gray-500 font-medium">Confirm cash received and mark orders as completed.</p>
            </header>

            <div className="space-y-4">
                {orders.map((order) => {
                    const isReady = order.status === "READY"

                    return (
                        <div
                            key={order.id}
                            className={cn(
                                "bg-white rounded-2xl shadow-sm border-2 overflow-hidden flex flex-col transition-all",
                                isReady ? "border-emerald-400" : "border-gray-200"
                            )}
                        >
                            <div className="p-5 flex justify-between items-center bg-gray-50/50 border-b border-gray-100">
                                <div>
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Order ID</span>
                                    <span className="font-black text-gray-900 text-lg leading-none">
                                        #{order.id.slice(-4).toUpperCase()}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Amount Due</span>
                                    <span className="font-black text-emerald-600 text-2xl leading-none flex items-center gap-1 justify-end">
                                        ₹{order.total}
                                    </span>
                                </div>
                            </div>

                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-center text-sm font-bold text-gray-900 mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <span>{order.items.length} items</span>
                                    <span className="text-gray-400">|</span>
                                    <span>{order.orderType}</span>
                                    <span className="text-gray-400">|</span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-md",
                                        isReady ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-700"
                                    )}>{order.status}</span>
                                </div>

                                <ul className="space-y-2 mb-4">
                                    {order.items.map((item, idx) => (
                                        <li key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{item.quantity}x {item.name}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="text-xs text-gray-400 font-bold mb-5 flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    No refunds. Exact change preferred.
                                </div>

                                <button
                                    onClick={() => handleConfirmCash(order.id)}
                                    disabled={actionLoading === order.id}
                                    className="w-full py-4 rounded-xl font-black text-white bg-gray-900 hover:bg-black transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                                >
                                    {actionLoading === order.id ? (
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <PackageCheck className="h-5 w-5" />
                                            Confirm Cash & Complete
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
