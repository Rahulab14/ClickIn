"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Html5Qrcode } from "html5-qrcode"
import { ArrowLeft, Zap, ZapOff, ScanLine, X, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function CustomerScanPage() {
    const router = useRouter()
    const [scanning, setScanning] = useState(false)
    const [torchOn, setTorchOn] = useState(false)
    const [torchSupported, setTorchSupported] = useState(false)
    const [scannedResult, setScannedResult] = useState<string | null>(null)
    const [error, setError] = useState("")
    const [cameraReady, setCameraReady] = useState(false)
    const scannerRef = useRef<Html5Qrcode | null>(null)
    const scannerContainerId = "qr-reader"

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState()
                // 2 = SCANNING, 3 = PAUSED
                if (state === 2 || state === 3) {
                    await scannerRef.current.stop()
                }
            } catch {
                // ignore
            }
            scannerRef.current = null
        }
        setScanning(false)
        setCameraReady(false)
        setTorchOn(false)
        setTorchSupported(false)
    }, [])

    const startScanner = useCallback(async () => {
        setError("")
        setScannedResult(null)

        try {
            const html5QrCode = new Html5Qrcode(scannerContainerId)
            scannerRef.current = html5QrCode

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    // On successful scan
                    setScannedResult(decodedText)
                    // Vibrate if supported
                    if (navigator.vibrate) navigator.vibrate(100)
                    stopScanner()
                },
                () => {
                    // Ignore scan failures (no QR found in frame)
                }
            )

            setScanning(true)
            setCameraReady(true)

            // Check torch capability
            try {
                const capabilities = html5QrCode.getRunningTrackCameraCapabilities()
                if (capabilities.torchFeature().isSupported()) {
                    setTorchSupported(true)
                }
            } catch {
                // Torch not supported
            }
        } catch (err: any) {
            console.error("Camera error:", err)
            if (err.toString().includes("NotAllowedError")) {
                setError("Camera permission denied. Please allow camera access in your browser settings.")
            } else if (err.toString().includes("NotFoundError")) {
                setError("No camera found on this device.")
            } else {
                setError("Failed to start camera. Please try again.")
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
        } catch {
            // ignore
        }
    }, [torchOn, torchSupported])

    // Auto-start the scanner on mount
    useEffect(() => {
        // Small delay to allow DOM to render
        const timer = setTimeout(() => {
            startScanner()
        }, 300)

        return () => {
            clearTimeout(timer)
            stopScanner()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleRescan = () => {
        setScannedResult(null)
        setError("")
        startScanner()
    }

    const handleNavigate = () => {
        if (!scannedResult) return
        // If it's a URL, navigate to it
        try {
            const url = new URL(scannedResult)
            // If it's our own domain, use router
            if (url.hostname.includes("clickin")) {
                router.push(url.pathname + url.search)
            } else {
                window.open(scannedResult, "_blank")
            }
        } catch {
            // Not a URL, could be an order ID — go to order page
            router.push(`/orders/${scannedResult}`)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
                <button
                    onClick={() => router.back()}
                    className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 text-white" />
                </button>

                <h1 className="text-sm font-bold tracking-wider uppercase text-white/90 flex items-center gap-2">
                    <ScanLine className="h-4 w-4" />
                    Scan QR
                </h1>

                {/* Torch Toggle */}
                {torchSupported && scanning && (
                    <button
                        onClick={toggleTorch}
                        className={cn(
                            "p-2 rounded-full backdrop-blur-md border transition-all",
                            torchOn
                                ? "bg-amber-500/80 border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                : "bg-white/10 border-white/10 hover:bg-white/20"
                        )}
                    >
                        {torchOn ? <Zap className="h-5 w-5 text-white" /> : <ZapOff className="h-5 w-5 text-white/70" />}
                    </button>
                )}
                {!torchSupported && <div className="w-9" />}
            </header>

            {/* Camera Viewfinder */}
            <div className="flex-1 flex items-center justify-center relative">
                {/* Scanner Container */}
                <div
                    id={scannerContainerId}
                    className="w-full h-full absolute inset-0 [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
                />

                {/* Scanning Overlay with Corners */}
                {scanning && cameraReady && (
                    <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                        {/* Dark overlay */}
                        <div className="absolute inset-0 bg-black/40" />

                        {/* Scan Area Cutout */}
                        <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                            {/* Clear center */}
                            <div className="absolute inset-0 bg-transparent rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]" />

                            {/* Animated scan line */}
                            <div className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-scan-line rounded-full shadow-[0_0_12px_rgba(52,211,153,0.6)]" />

                            {/* Corner Markers */}
                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-[3px] border-l-[3px] border-emerald-400 rounded-tl-xl" />
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-[3px] border-r-[3px] border-emerald-400 rounded-tr-xl" />
                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-[3px] border-l-[3px] border-emerald-400 rounded-bl-xl" />
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-[3px] border-r-[3px] border-emerald-400 rounded-br-xl" />
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {!scanning && !scannedResult && !error && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950 gap-4">
                        <div className="h-12 w-12 border-4 border-emerald-900 border-t-emerald-400 rounded-full animate-spin" />
                        <p className="text-sm font-medium text-white/60">Starting camera...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950 gap-6 p-8">
                        <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
                            <X className="h-10 w-10 text-red-400" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-lg font-bold text-white mb-2">Camera Error</h2>
                            <p className="text-sm text-white/60 max-w-xs">{error}</p>
                        </div>
                        <button
                            onClick={handleRescan}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom Info / Result Panel */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-16 pb-8 px-6">
                {scannedResult ? (
                    /* Scanned Result */
                    <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                                <ScanLine className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">QR Code Detected</p>
                                <p className="text-sm text-white/80 font-medium truncate">{scannedResult}</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleNavigate}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Open
                            </button>
                            <button
                                onClick={handleRescan}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/10 text-sm"
                            >
                                <ScanLine className="h-4 w-4" />
                                Scan Again
                            </button>
                        </div>
                    </div>
                ) : scanning ? (
                    /* Scanning Instructions */
                    <div className="text-center space-y-2">
                        <p className="text-white/90 font-bold text-sm">Point your camera at a QR code</p>
                        <p className="text-white/40 text-xs">Scan the QR on the table standee to view menu & order</p>

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

            {/* Custom CSS for scan line animation */}
            <style jsx global>{`
                @keyframes scan-line {
                    0%, 100% { top: 10%; }
                    50% { top: 85%; }
                }
                .animate-scan-line {
                    animation: scan-line 2.5s ease-in-out infinite;
                    position: absolute;
                }
                /* Hide html5-qrcode default UI elements */
                #qr-reader__dashboard, #qr-reader__status_span, #qr-reader__header_message {
                    display: none !important;
                }
                #qr-reader {
                    border: none !important;
                }
                #qr-reader video {
                    border-radius: 0 !important;
                }
            `}</style>
        </div>
    )
}
