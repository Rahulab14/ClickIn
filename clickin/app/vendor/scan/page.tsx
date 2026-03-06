"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Check, Camera, X, FlashlightOff, Flashlight, ShieldCheck, AlertTriangle, Hash, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useVendorAuth } from "@/context/vendor/VendorContext"
import { subscribeToOrders, updateOrderStatus } from "@/lib/vendor-service"
import type { VendorOrder } from "@/lib/types/vendor"

export default function VendorScanPage() {
    const { shopId, shop } = useVendorAuth()
    const [manualId, setManualId] = useState("")
    const [scannedOrder, setScannedOrder] = useState<VendorOrder | null>(null)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [allOrders, setAllOrders] = useState<VendorOrder[]>([])

    useEffect(() => {
        if (!shopId) return

        // Use real-time listener instead of one-time fetch
        const unsubscribe = subscribeToOrders(shopId, setAllOrders)

        return () => unsubscribe()
    }, [shopId])

    const getShortId = (fullId: string) => {
        if (!fullId) return ""
        // Matches the format displayed to customer ORD-YYYYMMDD-XXXX
        // We show the last parts to the customer as the "Short ID" or "OTP"
        const parts = fullId.split('-')
        if (parts.length >= 3) {
            return `${parts[1].slice(-3)}-${parts[2]}`
        }
        return fullId.slice(-8).toUpperCase()
    }

    const handleManualVerify = () => {
        const input = manualId.trim().toUpperCase()
        if (!input) return

        setError("")
        setScannedOrder(null)
        setSuccess(false)

        // Try exact match first, then suffix match
        const order = allOrders.find(o =>
            o.id.toUpperCase() === input ||
            o.id.toUpperCase().endsWith(input.replace(/[^A-Z0-9]/g, "")) ||
            getShortId(o.id) === input
        )

        if (order) {
            setScannedOrder(order)
        } else {
            setError(`Order "${manualId}" not found. Verify it's the correct ID or OTP.`)
        }
    }

    const handleMarkComplete = () => {
        if (!scannedOrder) return
        updateOrderStatus(scannedOrder.id, "COMPLETED")
        setAllOrders(allOrders.map(o => o.id === scannedOrder.id ? { ...o, status: "COMPLETED" } : o))
        setSuccess(true)
        setTimeout(() => {
            setScannedOrder(null)
            setSuccess(false)
            setManualId("")
        }, 2500)
    }

    return (
        <div className="max-w-xl mx-auto space-y-6 pb-20 md:pb-0 relative">
            {shop?.isOnline === false && (
                <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-md flex items-center justify-center rounded-2xl">
                    <div className="bg-red-50 border border-red-200 p-6 rounded-2xl shadow-xl max-w-sm text-center animate-in zoom-in-95">
                        <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-xl font-black text-red-900 mb-2">Shop is Offline</h3>
                        <p className="text-sm font-medium text-red-700">
                            You cannot verify orders while the shop is closed. <br /><br />
                            A Manager or Owner needs to turn the shop online from the Dashboard.
                        </p>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900">Scan & Verify</h2>
                    <p className="text-sm text-muted-foreground mt-1">Verify customer orders by scanning QR or entering order ID.</p>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 font-bold py-1">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Sync
                </Badge>
            </div>

            {/* Camera section placeholder */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-square max-h-[300px] flex items-center justify-center">
                <div className="text-center">
                    <Camera className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">QR Scanner Coming Soon</p>
                    <p className="text-gray-600 text-sm">Use manual entry below</p>
                </div>
                {/* Scanner Frame Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500" />
                    </div>
                </div>
            </div>

            {/* Manual Entry */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                    <Hash className="h-4 w-4 text-gray-500" /> Enter Order ID or OTP
                </h3>
                <div className="flex gap-2">
                    <Input
                        placeholder="e.g. 512-IUN8"
                        value={manualId}
                        onChange={(e) => setManualId(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleManualVerify()}
                        className="flex-1 font-mono uppercase"
                    />
                    <Button onClick={handleManualVerify} className="bg-emerald-600 hover:bg-emerald-700 font-bold">
                        Verify
                    </Button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700 animate-in fade-in duration-200">
                        <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
                    </div>
                )}
            </div>

            {/* Scanned Order Result */}
            {scannedOrder && !success && (
                <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-lg animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-xl font-black text-gray-900">{getShortId(scannedOrder.id)}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Customer ID: {scannedOrder.id.slice(-6).toUpperCase()}</p>
                            <p className="text-sm font-medium text-gray-500">{scannedOrder.customerName} • {scannedOrder.payment}</p>
                        </div>
                        <span className={cn(
                            "px-3 py-1 rounded-full text-sm font-bold",
                            scannedOrder.status === "READY" ? "bg-emerald-100 text-emerald-700" :
                                scannedOrder.status === "PREPARING" ? "bg-amber-100 text-amber-700" :
                                    "bg-blue-100 text-blue-700"
                        )}>
                            {scannedOrder.status}
                        </span>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-3 mb-4">
                        {scannedOrder.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-1.5 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className={cn("h-3 w-3 border-2 rounded-sm flex items-center justify-center", item.isVeg ? "border-emerald-600" : "border-red-600")}>
                                        <div className={cn("h-1.5 w-1.5 rounded-full", item.isVeg ? "bg-emerald-600" : "bg-red-600")} />
                                    </div>
                                    <span className="font-medium">{item.name}</span>
                                    <span className="text-gray-400">×{item.quantity}</span>
                                </div>
                                <span className="font-bold">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between text-base font-black text-gray-900">
                            <span>Total</span>
                            <span>₹{scannedOrder.total}</span>
                        </div>
                    </div>

                    <Button onClick={handleMarkComplete} className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-12 text-base">
                        <ShieldCheck className="h-5 w-5 mr-2" /> Mark as Completed
                    </Button>
                </div>
            )}

            {/* Success State */}
            {success && (
                <div className="bg-emerald-50 p-8 rounded-2xl border-2 border-emerald-500 text-center animate-in zoom-in-95 duration-300">
                    <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
                        <Check className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-emerald-800">Order Verified!</h3>
                    <p className="text-emerald-600 mt-1">Order has been marked as completed.</p>
                </div>
            )}

            {/* Recent activity */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Ready for Pickup ({allOrders.filter(o => o.status === "READY").length})</h3>
                <div className="space-y-2">
                    {allOrders.filter(o => o.status === "READY").length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No orders ready for pickup</p>
                    )}
                    {allOrders.filter(o => o.status === "READY").map(o => (
                        <button
                            key={o.id}
                            onClick={() => { setManualId(o.id); setScannedOrder(o); setError("") }}
                            className="w-full flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors text-left"
                        >
                            <div>
                                <span className="font-bold text-gray-900">{getShortId(o.id)}</span>
                                <span className="text-[10px] font-bold text-gray-400 ml-2">#{o.id.slice(-4).toUpperCase()}</span>
                                <span className="text-sm text-gray-500 ml-2">{o.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-bold text-emerald-700">₹{o.total}</span>
                                <ArrowRight className="h-4 w-4 text-emerald-500" />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
