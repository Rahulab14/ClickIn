"use client"

import { useEffect, useState } from "react"
import { useStaff } from "@/context/staff/StaffContext"
import { getOrderHistory } from "@/lib/vendor-service"
import type { VendorOrder } from "@/lib/types/vendor"
import Link from "next/link"
import { Clock, Search, History, ChevronRight, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StaffOrdersPage() {
    const { shopId, isStaffLoading } = useStaff()
    const [orders, setOrders] = useState<VendorOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        if (!shopId) return

        const loadPastOrders = async () => {
            setLoading(true)
            // Fetch the last 50 orders (historical)
            const history = await getOrderHistory(shopId, 50)
            setOrders(history)
            setLoading(false)
        }

        loadPastOrders()
    }, [shopId])

    if (isStaffLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        )
    }

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 mb-1">Order History</h1>
                <p className="text-sm text-gray-500 font-medium">View recently processed and completed orders.</p>
            </header>

            {/* Search */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search by Order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                />
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="font-bold text-gray-900 text-lg">No orders found</h3>
                    <p className="text-gray-500 text-sm mt-1">Nothing matched your search.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredOrders.map(order => {
                        const isCompleted = order.status === "COMPLETED";
                        const isCancelled = order.status === "CANCELLED";

                        return (
                            <Link
                                href={`/staff/orders/${order.id}`}
                                key={order.id}
                                className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between hover:shadow-md transition-all group"
                            >
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-black text-gray-900">
                                            #{order.id.slice(-4).toUpperCase()}
                                        </span>
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit",
                                            isCompleted ? "bg-emerald-100 text-emerald-700" :
                                                isCancelled ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
                                        )}>
                                            {isCompleted && <CheckCircle2 className="h-3 w-3" />}
                                            {isCancelled && <XCircle className="h-3 w-3" />}
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 font-medium flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3.5 w-3.5" />
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span className="inline-block w-1 h-1 rounded-full bg-gray-300" />
                                        <span>{order.orderType}</span>
                                        <span className="inline-block w-1 h-1 rounded-full bg-gray-300" />
                                        <span>{order.items.length} items</span>
                                    </div>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
