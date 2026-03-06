"use client"

import { useState } from "react"
import { useStaff } from "@/context/staff/StaffContext"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { updateOrderStatus } from "@/lib/vendor-service"
import type { VendorOrder } from "@/lib/types/vendor"
import { QrCode, Search, CheckCircle2, AlertCircle, PackageCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export default function StaffScanPage() {
    const { shopId, staffProfile, isStaffLoading } = useStaff()
    const [scanId, setScanId] = useState("")
    const [scannedOrder, setScannedOrder] = useState<VendorOrder | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [successMsg, setSuccessMsg] = useState("")
    const [processing, setProcessing] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!scanId.trim() || !shopId) return

        setLoading(true)
        setError("")
        setSuccessMsg("")
        setScannedOrder(null)

        try {
            // Find the order
            const snap = await getDoc(doc(db, "orders", scanId.trim()))
            if (!snap.exists()) {
                setError("Order not found. Please check the ID or OTP.")
                setLoading(false)
                return
            }

            const data = { id: snap.id, ...snap.data() } as VendorOrder

            if (data.shopId !== shopId) {
                setError("This order belongs to a different shop.")
                setLoading(false)
                return
            }

            if (data.status === "COMPLETED") {
                setError("This order has already been completed.")
                setScannedOrder(data)
                setLoading(false)
                return
            }

            if (data.status === "CANCELLED") {
                setError("This order was cancelled.")
                setScannedOrder(data)
                setLoading(false)
                return
            }

            setScannedOrder(data)

        } catch (err) {
            console.error("Error looking up order:", err)
            setError("Failed to look up order. Check connection.")
        } finally {
            setLoading(false)
        }
    }

    const handleMarkPickedUp = async () => {
        if (!scannedOrder || !staffProfile?.id) return

        setProcessing(true)
        setError("")

        try {
            await updateOrderStatus(scannedOrder.id, "COMPLETED", { handledByStaffId: staffProfile.id })

            setSuccessMsg("Order successfully marked as Picked Up!")
            // Update local state to prevent multiple clicks
            setScannedOrder(prev => prev ? { ...prev, status: "COMPLETED" } : null)
        } catch (err) {
            console.error("Failed to complete order:", err)
            setError("Failed to update the order. Please try again.")
        } finally {
            setProcessing(false)
        }
    }

    if (isStaffLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-8 w-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-xl mx-auto">
            <header className="mb-8 text-center mt-4">
                <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <QrCode className="h-8 w-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 mb-2">Scan & Verify</h1>
                <p className="text-sm text-gray-500 font-medium">Verify customer orders via ID or OTP for quick handoff.</p>
            </header>

            {/* Input Form */}
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    placeholder="Enter Order ID or OTP"
                    value={scanId}
                    onChange={(e) => setScanId(e.target.value)}
                    className="w-full bg-white border-2 border-gray-200 rounded-2xl py-4 pl-5 pr-14 text-center text-lg font-black tracking-widest focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-400"
                />
                <button
                    type="submit"
                    disabled={loading || !scanId.trim()}
                    className="absolute right-2 top-2 bottom-2 aspect-square bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                    {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search className="h-5 w-5" />}
                </button>
            </form>

            {/* Simulated Camera Area */}
            {/* <div className="aspect-square w-full sm:w-64 max-w-sm mx-auto bg-gray-100 rounded-3xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                <QrCode className="h-12 w-12 mb-3 opacity-50" />
                <span className="font-bold text-sm">Tap to Open Camera</span>
            </div> */}

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    {successMsg}
                </div>
            )}

            {/* Scan Result */}
            {scannedOrder && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Order ID</span>
                            <span className="font-black text-gray-900 leading-none text-lg">
                                #{scannedOrder.id.slice(-4).toUpperCase()}
                            </span>
                        </div>
                        <span className={cn(
                            "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                            scannedOrder.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                                scannedOrder.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                                    "bg-blue-100 text-blue-700"
                        )}>
                            {scannedOrder.status}
                        </span>
                    </div>

                    <div className="p-5 space-y-3 border-b border-gray-50">
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-gray-500">Items:</span>
                            <span className="text-gray-900">{scannedOrder.items.length} items</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-gray-500">Type:</span>
                            <span className="text-gray-900">{scannedOrder.orderType}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-gray-500">Payment:</span>
                            <span className="text-gray-900">{scannedOrder.payment}</span>
                        </div>
                    </div>

                    <div className="p-5 bg-gray-50/30">
                        {scannedOrder.status === "COMPLETED" || scannedOrder.status === "CANCELLED" ? (
                            <button
                                disabled
                                className="w-full py-4 rounded-xl font-black text-white bg-gray-300 cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="h-5 w-5" />
                                Handled
                            </button>
                        ) : (
                            <button
                                onClick={handleMarkPickedUp}
                                disabled={processing}
                                className="w-full py-4 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {processing ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <PackageCheck className="h-5 w-5" />
                                        Mark as Picked Up
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
