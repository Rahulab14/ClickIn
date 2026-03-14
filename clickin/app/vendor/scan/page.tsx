"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Check, Camera, X, Zap, ZapOff, ScanLine, ShieldCheck, AlertTriangle, Hash, ArrowRight } from "lucide-react"
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
    const [dismissedOffline, setDismissedOffline] = useState(false)

    // QR Scanner state
    const [showScanner, setShowScanner] = useState(false)
    const [scanning, setScanning] = useState(false)
    const [torchOn, setTorchOn] = useState(false)
    const [torchSupported, setTorchSupported] = useState(false)
    const [cameraReady, setCameraReady] = useState(false)
    const [cameraError, setCameraError] = useState("")
    const scannerRef = useRef<any>(null)
    const scannerContainerId = "vendor-qr-reader"

    useEffect(() => {
        if (!shopId) return
        const unsubscribe = subscribeToOrders(shopId, setAllOrders)
        return () => unsubscribe()
    }, [shopId])

    useEffect(() => {
        setDismissedOffline(false)
    }, [shop?.isOnline])

    // --- QR Scanner Logic ---
    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState()
                if (state === 2 || state === 3) {
                    await scannerRef.current.stop()
                }
            } catch { /* ignore */ }
            scannerRef.current = null
        }
        setScanning(false)
        setCameraReady(false)
        setTorchOn(false)
        setTorchSupported(false)
    }, [])

    const startScanner = useCallback(async () => {
        setCameraError("")
        try {
            const { Html5Qrcode } = await import("html5-qrcode")
            const html5QrCode = new Html5Qrcode(scannerContainerId)
            scannerRef.current = html5QrCode

            await html5QrCode.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
                (decodedText: string) => {
                    if (navigator.vibrate) navigator.vibrate(100)
                    // Try to extract order ID from URL or raw text
                    let orderId = decodedText
                    try {
                        const url = new URL(decodedText)
                        const pathParts = url.pathname.split("/")
                        orderId = pathParts[pathParts.length - 1] || decodedText
                    } catch { /* Not a URL, use raw text */ }
                    handleScanResult(orderId)
                    stopScanner()
                    setShowScanner(false)
                },
                () => { /* ignore scan failures */ }
            )

            setScanning(true)
            setCameraReady(true)

            try {
                const capabilities = html5QrCode.getRunningTrackCameraCapabilities()
                if (capabilities.torchFeature().isSupported()) {
                    setTorchSupported(true)
                }
            } catch { /* Torch not supported */ }
        } catch (err: any) {
            console.error("Camera error:", err)
            if (err.toString().includes("NotAllowedError")) {
                setCameraError("Camera permission denied. Please allow camera access.")
            } else if (err.toString().includes("NotFoundError")) {
                setCameraError("No camera found on this device.")
            } else {
                setCameraError("Failed to start camera. Please try again.")
            }
        }
    }, [stopScanner])

    const toggleTorch = useCallback(async () => {
        if (!scannerRef.current || !torchSupported) return
        try {
            const capabilities = scannerRef.current.getRunningTrackCameraCapabilities()
            const newState = !torchOn
            await capabilities.torchFeature().apply(newState)
            setTorchOn(newState)
        } catch { /* ignore */ }
    }, [torchOn, torchSupported])

    const openScanner = () => {
        setShowScanner(true)
        setTimeout(() => startScanner(), 300)
    }

    const closeScanner = () => {
        stopScanner()
        setShowScanner(false)
        setCameraError("")
    }

    // --- Order Logic ---
    const getShortId = (fullId: string) => {
        if (!fullId) return ""
        const parts = fullId.split('-')
        if (parts.length >= 3) {
            return `${parts[1].slice(-3)}-${parts[2]}`
        }
        return fullId.slice(-8).toUpperCase()
    }

    const handleScanResult = (input: string) => {
        const cleanInput = input.trim().toUpperCase()
        if (!cleanInput) return

        setError("")
        setScannedOrder(null)
        setSuccess(false)

        const order = allOrders.find(o =>
            o.id.toUpperCase() === cleanInput ||
            o.id.toUpperCase().endsWith(cleanInput.replace(/[^A-Z0-9]/g, "")) ||
            getShortId(o.id) === cleanInput
        )

        if (order) {
            setScannedOrder(order)
            setManualId(order.id)
        } else {
            setError(`Order "${input}" not found. Verify it's the correct ID or OTP.`)
        }
    }

    const handleManualVerify = () => {
        handleScanResult(manualId)
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

    const readyOrders = allOrders.filter(o => o.status === "READY")

    return (
        <div className="max-w-xl mx-auto space-y-5 pb-20 md:pb-0 relative">
            {/* Offline Popup */}
            {shop?.isOnline === false && !dismissedOffline && (
                <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setDismissedOffline(true)}>
                    <div className="bg-white border border-red-100 px-6 py-5 rounded-2xl shadow-2xl shadow-red-200/30 max-w-xs w-full animate-in zoom-in-95 duration-200 relative" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setDismissedOffline(true)} className="absolute top-3 right-3 p-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                            <X className="h-4 w-4 text-gray-500" />
                        </button>
                        <div className="flex items-start gap-3.5">
                            <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                <AlertTriangle className="h-5 w-5 text-red-500 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-red-900 tracking-tight leading-tight">Shop is Offline</h3>
                                <p className="text-xs text-red-600/80 mt-1 leading-relaxed">
                                    Order verification is paused. Ask a <span className="font-bold text-red-800">Manager</span> or <span className="font-bold text-red-800">Owner</span> to go online.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900">Scan & Verify</h2>
                    <p className="text-sm text-gray-500 mt-0.5 font-medium">Verify customer orders by scanning QR or entering order ID.</p>
                </div>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 font-bold py-1">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Live Sync
                </Badge>
            </div>

            {/* Scan QR Button — Premium Hero Action */}
            <button
                onClick={openScanner}
                className="w-full group relative bg-gray-900 hover:bg-black text-white rounded-2xl p-5 flex items-center gap-4 shadow-xl shadow-gray-900/20 transition-all active:scale-[0.98] overflow-hidden"
            >
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-transparent to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="h-14 w-14 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform relative z-10">
                    <Camera className="h-7 w-7 text-white" />
                </div>
                <div className="text-left relative z-10">
                    <h3 className="text-lg font-black tracking-tight">Scan QR Code</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Open camera to scan customer's order QR</p>
                </div>
                <ScanLine className="h-5 w-5 text-emerald-400 ml-auto shrink-0 relative z-10" />
            </button>

            {/* Manual Entry */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3 text-sm">
                    <Hash className="h-4 w-4 text-gray-400" /> Or enter Order ID manually
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
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700 animate-in fade-in duration-200">
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

            {/* Ready for Pickup */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Ready for Pickup ({readyOrders.length})
                </h3>
                <div className="space-y-2">
                    {readyOrders.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4">No orders ready for pickup</p>
                    )}
                    {readyOrders.map(o => (
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

            {/* ===== QR Scanner Modal ===== */}
            {showScanner && (
                <div className="fixed inset-0 z-50 bg-black flex flex-col">
                    {/* Scanner Header */}
                    <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
                        <button onClick={closeScanner} className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors">
                            <X className="h-5 w-5 text-white" />
                        </button>
                        <h1 className="text-sm font-bold tracking-wider uppercase text-white/90 flex items-center gap-2">
                            <ScanLine className="h-4 w-4" /> Scan Order QR
                        </h1>
                        {torchSupported && scanning ? (
                            <button
                                onClick={toggleTorch}
                                className={cn(
                                    "p-2.5 rounded-full backdrop-blur-md border transition-all",
                                    torchOn
                                        ? "bg-amber-500/80 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                        : "bg-white/10 border-white/10 hover:bg-white/20"
                                )}
                            >
                                {torchOn ? <Zap className="h-5 w-5 text-white" /> : <ZapOff className="h-5 w-5 text-white/70" />}
                            </button>
                        ) : <div className="w-10" />}
                    </header>

                    {/* Camera Viewfinder */}
                    <div className="flex-1 flex items-center justify-center relative">
                        <div
                            id={scannerContainerId}
                            className="w-full h-full absolute inset-0 [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
                        />

                        {/* Scanning Overlay */}
                        {scanning && cameraReady && (
                            <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                                <div className="absolute inset-0 bg-black/40" />
                                <div className="relative w-60 h-60 sm:w-64 sm:h-64">
                                    <div className="absolute inset-0 bg-transparent rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />
                                    <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-line rounded-full shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
                                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-xl" />
                                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-xl" />
                                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-xl" />
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-xl" />
                                </div>
                            </div>
                        )}

                        {/* Loading State */}
                        {!scanning && !cameraError && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950 gap-4">
                                <div className="h-12 w-12 border-4 border-emerald-900 border-t-emerald-400 rounded-full animate-spin" />
                                <p className="text-sm font-medium text-white/60">Starting camera...</p>
                            </div>
                        )}

                        {/* Error State */}
                        {cameraError && (
                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950 gap-6 p-8">
                                <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <X className="h-10 w-10 text-red-400" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-lg font-bold text-white mb-2">Camera Error</h2>
                                    <p className="text-sm text-white/60 max-w-xs">{cameraError}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => { setCameraError(""); startScanner(); }} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors">
                                        Try Again
                                    </button>
                                    <button onClick={closeScanner} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/10 transition-colors">
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-16 pb-8 px-6">
                        {scanning ? (
                            <div className="text-center space-y-2">
                                <p className="text-white/90 font-bold text-sm">Scan customer's order QR code</p>
                                <p className="text-white/40 text-xs">Point your camera at the QR code shown on the customer's phone</p>
                                {torchSupported && (
                                    <button
                                        onClick={toggleTorch}
                                        className={cn(
                                            "mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all",
                                            torchOn
                                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                : "bg-white/10 text-white/60 border border-white/10 hover:bg-white/20"
                                        )}
                                    >
                                        {torchOn ? <Zap className="h-3.5 w-3.5" /> : <ZapOff className="h-3.5 w-3.5" />}
                                        {torchOn ? "Light On" : "Turn on Light"}
                                    </button>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Scan line animation CSS */}
            <style jsx global>{`
                @keyframes scan-line {
                    0%, 100% { top: 10%; }
                    50% { top: 85%; }
                }
                .animate-scan-line {
                    animation: scan-line 2.5s ease-in-out infinite;
                    position: absolute;
                }
                #vendor-qr-reader__dashboard, #vendor-qr-reader__status_span, #vendor-qr-reader__header_message {
                    display: none !important;
                }
                #vendor-qr-reader {
                    border: none !important;
                }
                #vendor-qr-reader video {
                    border-radius: 0 !important;
                }
            `}</style>
        </div>
    )
}
