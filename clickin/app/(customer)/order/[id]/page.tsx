"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ArrowLeft, Clock, Store, CheckCircle, ChefHat, Check, XCircle } from "lucide-react"
import QRCode from "react-qr-code"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { VendorOrder } from "@/lib/types/vendor"
import { RatingModal } from "@/components/customer/RatingModal"
import { submitOrderRating, getShop } from "@/lib/vendor-service"

export default function OrderStatusPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()

    // Fallback info from URL during initial load or for demo
    const orderId = params.id as string
    const urlStatus = searchParams.get("status") || "NEW"

    const [order, setOrder] = useState<VendorOrder | null>(null)
    const [loading, setLoading] = useState(true)
    const [showRatingModal, setShowRatingModal] = useState(false)
    const [shopName, setShopName] = useState("Shop")

    // Listen to real order updates from Firestore
    useEffect(() => {
        if (!orderId) return;

        let timeoutId: NodeJS.Timeout;

        const unsub = onSnapshot(doc(db, "orders", orderId), async (snap) => {
            if (snap.exists()) {
                const orderData = { id: snap.id, ...snap.data() } as VendorOrder
                setOrder(orderData)

                // Fetch shop name if needed
                if (orderData.shopId) {
                    const shop = await getShop(orderData.shopId)
                    if (shop) setShopName(shop.name)
                }

                // Show rating modal if completed and not rated
                if (orderData.status === "COMPLETED" && !orderData.isRated) {
                    // Slight delay for "Order Completed" message to be seen
                    timeoutId = setTimeout(() => setShowRatingModal(true), 1200)
                }
            }
            setLoading(false)
        }, (err) => {
            console.error("Order snapshot error:", err)
            setLoading(false)
        })

        return () => {
            unsub()
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [orderId])

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans tracking-tight">Loading...</div>
    }

    const currentStatus = order?.status || urlStatus;

    // Determine payment success state
    // In our model, NEW/PENDING_VERIFICATION means it's not confirmed yet
    // PAID, PREPARING, READY, COMPLETED means payment is good.
    const isPaymentConfirmed = ["PAID", "PREPARING", "READY", "COMPLETED"].includes(currentStatus);
    const isCancelled = currentStatus === "CANCELLED";

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans tracking-tight selection:bg-emerald-100">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl px-5 py-4 flex items-center justify-between sticky top-0 z-30 border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/")}
                        className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center transition-all active:scale-95 group hover:bg-gray-50"
                    >
                        <ArrowLeft className="h-5 w-5 text-gray-700 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                    <div>
                        <h1 className="font-black text-xl text-gray-900 leading-none">Order Status</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Order #{orderId.slice(-6).toUpperCase()}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-md mx-auto w-full px-5 pt-8 space-y-6">

                {/* Status Indicator */}
                {!isCancelled ? (
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 text-center relative overflow-hidden group">
                        {/* Decorative background circle */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-gray-50 rounded-full group-hover:scale-110 transition-transform duration-700" />

                        {/* Status Icon */}
                        <div className="flex justify-center mb-6 relative z-10">
                            {!isPaymentConfirmed ? (
                                <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border-4 border-amber-100/30">
                                    <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
                                </div>
                            ) : currentStatus === "PREPARING" ? (
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-100/30">
                                    <ChefHat className="w-10 h-10 text-blue-500 animate-bounce" />
                                </div>
                            ) : currentStatus === "READY" ? (
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100/30">
                                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                                </div>
                            ) : (
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center border-4 border-gray-100">
                                    <Check className="w-10 h-10 text-gray-400" />
                                </div>
                            )}
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 mb-2 relative z-10 tracking-tight">
                            {!isPaymentConfirmed ? "Verifying Payment" :
                                currentStatus === "PAID" ? "Payment Confirmed!" :
                                    currentStatus === "PREPARING" ? "Food is Preparing" :
                                        currentStatus === "READY" ? "Ready for Pickup!" :
                                            "Order Completed"}
                        </h2>
                        <p className="text-sm font-medium text-gray-500 relative z-10 leading-relaxed max-w-[240px] mx-auto">
                            {!isPaymentConfirmed ? "Waiting for confirmation from vendor..." :
                                currentStatus === "PAID" ? "Please show the QR code below at the counter." :
                                    currentStatus === "PREPARING" ? "Your food is being prepared. Hang tight!" :
                                        currentStatus === "READY" ? "Please collect your order from the counter." :
                                            "Hope you enjoyed your meal!"}
                        </p>

                        {/* Status Timeline */}
                        <div className="mt-8 flex items-center justify-between max-w-[200px] mx-auto relative px-2">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                            <div className={cn("w-3 h-3 rounded-full z-10 transition-colors duration-500", isPaymentConfirmed ? "bg-emerald-500" : "bg-gray-200")} />
                            <div className={cn("w-3 h-3 rounded-full z-10 transition-colors duration-500", ["PREPARING", "READY", "COMPLETED"].includes(currentStatus || "") ? "bg-blue-500" : "bg-gray-200")} />
                            <div className={cn("w-3 h-3 rounded-full z-10 transition-colors duration-500", ["READY", "COMPLETED"].includes(currentStatus || "") ? "bg-emerald-500" : "bg-gray-200")} />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-[220px] mx-auto">
                            <span>Paid</span>
                            <span>Cooking</span>
                            <span>Ready</span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-rose-100 text-center overflow-hidden">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center border-4 border-rose-100">
                                <XCircle className="w-8 h-8 text-rose-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Order Cancelled</h2>
                        <p className="text-sm font-medium text-gray-500">Your order has been cancelled.</p>
                    </div>
                )}

                {/* QR Code Section - ONLY SHOW IF PAYMENT IS CONFIRMED */}
                {isPaymentConfirmed && currentStatus !== "COMPLETED" && (
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />

                        <div className="text-center mb-6">
                            <h3 className="font-bold text-gray-900 text-lg tracking-tight">Order QR Code</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Show this at the pickup counter</p>
                        </div>

                        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-gray-50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.08)] mb-6 transform hover:scale-[1.02] transition-transform duration-500">
                            <QRCode
                                value={orderId}
                                size={180}
                                level="H"
                                fgColor="#111827"
                            />
                        </div>

                        <div className="bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
                            <p className="font-mono font-black text-gray-900 tracking-[0.3em] text-sm uppercase">{orderId.slice(-8)}</p>
                        </div>
                    </div>
                )}

                {/* Order Details (if real order exists) */}
                {order && order.items && (
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Order Summary</h2>
                        <div className="space-y-4">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                                            {item.quantity}x
                                        </div>
                                        <span className="font-bold text-gray-900 text-sm">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                            <div className="pt-4 mt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
                                <span className="font-bold text-gray-500">Total Paid</span>
                                <span className="font-black text-xl text-primary">₹{order.total}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <RatingModal
                isOpen={showRatingModal}
                onClose={() => {
                    setShowRatingModal(false)
                    router.push("/")
                }}
                shopName={shopName}
                onSubmit={async (rating) => {
                    if (order) {
                        await submitOrderRating(order.shopId, order.id, rating)
                    }
                }}
            />
        </div>
    )
}
