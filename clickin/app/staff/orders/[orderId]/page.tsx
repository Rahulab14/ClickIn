"use client"

import { useEffect, useState } from "react"
import { useStaff } from "@/context/staff/StaffContext"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import type { VendorOrder } from "@/lib/types/vendor"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Clock, Info, Package, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StaffOrderDetailPage() {
    const params = useParams()
    const router = useRouter()
    const orderId = params.orderId as string

    const { shopId, isStaffLoading } = useStaff()
    const [order, setOrder] = useState<VendorOrder | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!shopId || !orderId) return

        const fetchOrder = async () => {
            setLoading(true)
            try {
                // In a robust implementation, we might get this from context or a dedicated service function
                // For direct access, fetching from db directly:
                const snap = await getDoc(doc(db, "orders", orderId))
                if (snap.exists()) {
                    const data = { id: snap.id, ...snap.data() } as VendorOrder
                    // Security check: only show if it belongs to the staff's shop
                    if (data.shopId === shopId) {
                        setOrder(data)
                    }
                }
            } catch (err) {
                console.error("Failed to fetch order details", err)
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [shopId, orderId])

    if (isStaffLoading || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertCircle className="h-12 w-12 text-gray-300 mb-4" />
                <h2 className="text-xl font-black text-gray-900">Order Not Found</h2>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-gray-100 font-bold rounded-xl text-gray-700 hover:bg-gray-200 transition-colors"
                >
                    Go Back
                </button>
            </div>
        )
    }

    const isCompleted = order.status === "COMPLETED";
    const isCancelled = order.status === "CANCELLED";

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <header className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <ArrowLeft className="h-6 w-6 text-gray-900" />
                </button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-gray-900 leading-none">
                        Order #{order.id.slice(-4).toUpperCase()}
                    </h1>
                    <p className="text-xs text-gray-500 font-medium mt-1">
                        {new Date(order.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                </div>
            </header>

            {/* Status & Type Card */}
            <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Status</span>
                    <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-sm font-black tracking-tight",
                        isCompleted ? "bg-emerald-100 text-emerald-700" :
                            isCancelled ? "bg-red-100 text-red-700" :
                                order.status === "NEW" ? "bg-blue-100 text-blue-700" :
                                    "bg-amber-100 text-amber-700"
                    )}>
                        {order.status}
                    </span>
                </div>
                <div className="text-right">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Type</span>
                    <span className="font-bold text-gray-900 flex items-center justify-end gap-1.5">
                        <Package className="h-4 w-4 text-emerald-600" />
                        {order.orderType}
                    </span>
                    {order.tableNumber && (
                        <span className="text-xs font-medium text-gray-500">Table: {order.tableNumber}</span>
                    )}
                </div>
            </div>

            {/* Items Card */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                    <h2 className="font-black text-gray-900 text-lg">Order Items</h2>
                </div>
                <div className="p-5">
                    <ul className="space-y-4">
                        {order.items.map((item, idx) => (
                            <li key={idx} className="flex items-start justify-between border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight">
                                        <span className="text-emerald-600 mr-2">{item.quantity}x</span>
                                        {item.name}
                                    </h3>
                                    {/* Note: Omitted Price display intentionally as requested */}
                                </div>
                                {item.isVeg !== undefined && (
                                    <div className={cn(
                                        "h-5 w-5 rounded-[4px] border-2 flex items-center justify-center flex-shrink-0 ml-3",
                                        item.isVeg ? "border-green-600" : "border-red-600"
                                    )}>
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            item.isVeg ? "bg-green-600" : "bg-red-600"
                                        )} />
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Instructions / Notes (Placeholder for future) */}
            <div className="bg-blue-50/50 rounded-[1.5rem] p-5 border border-blue-100">
                <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-blue-900 text-sm mb-1">Handling Notes</h4>
                        <p className="text-sm font-medium text-blue-700/80 leading-snug">
                            Prepare items exactly as per standard shop operating procedures. Ensure packaging matches the order type (Dine-in vs. Delivery/Takeaway).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
