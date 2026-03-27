"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { QRCodeCanvas } from "qrcode.react"
import { Download, Share2, Store, Lock } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/auth/AuthContext"
import { getVendorProfile } from "@/lib/vendor-service"
import { PremiumLoader } from "@/components/ui/PremiumLoader"

export default function VendorQRGeneratorPage() {
    const router = useRouter()
    const { user, userRole } = useAuth()
    const [role, setRole] = useState<string | null>(null)
    const [shopName, setShopName] = useState("")
    const [shopId, setShopId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)
    const printRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const storedRole = localStorage.getItem("vendorRole")
        setRole(storedRole || (userRole === "vendor_owner" ? "OWNER" : "STAFF"))

        async function fetchVendorData() {
            if (user?.uid) {
                const profile = await getVendorProfile(user.uid)
                if (profile) {
                    setShopName(profile.shopName || profile.name || "My Shop")
                    setShopId(profile.shopId)
                }
                setIsLoading(false)
            } else if (user === null) {
                setIsLoading(false)
            }
        }
        fetchVendorData()
    }, [user, userRole])

    const handleDownloadImage = async () => {
        if (!printRef.current) return

        try {
            setIsGenerating(true)

            const element = printRef.current

            // Wait for all images to load to prevent capture from failing
            const images = Array.from(element.querySelectorAll("img"))
            await Promise.all(
                images.map((img) => {
                    if (img.complete) return Promise.resolve()
                    return new Promise((resolve) => {
                        img.onload = resolve
                        img.onerror = resolve
                    })
                })
            )

            // Force reflow/render
            await new Promise(r => requestAnimationFrame(r))

            const { toPng } = await import("html-to-image")

            const dataUrl = await toPng(element, {
                pixelRatio: 3,
                quality: 1,
                backgroundColor: "#ffffff",
                useCORS: true,
                cacheBust: true,
                style: {
                    transform: 'none',
                    margin: '0'
                }
            })

            // Download as PNG
            const link = document.createElement("a")
            link.download = `${shopName || "Clickin"}-QR-Standee.png`
            link.href = dataUrl
            link.click()
        } catch (err: any) {
            console.error("Image download error:", err)
            alert(`Failed to download image: ${err?.message || "Unknown error"}`)
        } finally {
            setIsGenerating(false)
        }
    }

    if (isLoading) {
        return <PremiumLoader message="Loading your QR Standee..." />
    }

    if (!role) return null

    if (role !== "OWNER") {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4">
                <div className="bg-gray-100 p-4 rounded-full mb-4">
                    <Lock className="h-8 w-8 text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
                <p className="text-gray-500 mt-2 max-w-xs mx-auto">Only the Shop Owner can manage and generate QR codes.</p>
                <Button variant="outline" className="mt-6" onClick={() => router.push("/vendor/dashboard")}>
                    Back to Dashboard
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900">QR Standee Generator</h2>
                    <p className="text-gray-500 mt-1">Generate and print your shop's menu QR code.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Share2 className="h-4 w-4" /> Share Link
                    </Button>
                    <Button onClick={handleDownloadImage} disabled={isGenerating} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200">
                        <Download className="h-4 w-4" /> {isGenerating ? 'Generating...' : 'Download Image'}
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* PREVIEW SECTION (The Standee) */}
                <div className="flex justify-center">
                    <div
                        ref={printRef}
                        id="printable-qr"
                        className="w-full max-w-[320px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200"
                        style={{ width: '320px' }}
                    >
                        {/* Header - Payment App Style */}
                        <div className="bg-[#00BFA5] p-6 text-center relative overflow-hidden">
                            {/* Background Pattern (CSS-only, no external URL) */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)', backgroundSize: '8px 8px'}}></div>

                            <div className="relative z-10">
                                <h1 className="text-2xl font-black text-white tracking-tight mb-1">Clickin</h1>
                                <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Scan • Order • Pickup</p>
                            </div>
                        </div>

                        {/* Top Curved Connector */}
                        <div className="h-4 bg-[#00BFA5] rounded-b-[50%] -mt-2 relative z-10"></div>

                        {/* QR Code Area */}
                        <div className="p-8 pb-1 flex flex-col items-center print:flex-grow print:justify-center">

                            {/* Bigger font menu boldness low */}
                            
                            <h1 className="text-3xl font-black text-[#0A2647] tracking-tight mb-1 print:text-[3rem]">Menu & Order</h1>
                           
                            <p className="text-sm text-gray-400 mb-6 font-medium print:text-[1.5rem] print:mb-12 print:mt-2">Scan to View </p>

                            <div className="p-1 bg-white border-2 border-dashed border-[#00BFA5]/60 rounded-2xl relative print:border-[3px] print:p-4 print:rounded-[2.5rem]">
                                <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-4 border-l-4 border-[#00BFA5] print:-top-3 print:-left-3 print:w-8 print:h-8 print:border-t-8 print:border-l-8"></div>
                                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-4 border-r-4 border-[#00BFA5] print:-top-3 print:-right-3 print:w-8 print:h-8 print:border-t-8 print:border-r-8"></div>
                                <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-4 border-l-4 border-[#00BFA5] print:-bottom-3 print:-left-3 print:w-8 print:h-8 print:border-b-8 print:border-l-8"></div>
                                <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-4 border-r-4 border-[#00BFA5] print:-bottom-3 print:-right-3 print:w-8 print:h-8 print:border-b-8 print:border-r-8"></div>

                                <QRCodeCanvas
                                    id="qr-code"
                                    value={typeof window !== 'undefined' ? `${window.location.origin}/shop/${shopId || 'demo-shop'}` : `https://clickin-1.vercel.app/shop/${shopId || 'demo-shop'}`}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                    className="rounded-xl print:!w-[400px] print:!h-[400px] print:rounded-3xl"
                                />

                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-white p-1 rounded-full shadow-sm print:p-2">
<img
  src="/logo.png"
  alt="Logo"
  crossOrigin="anonymous"
  className="w-8 h-8 rounded-full"
/>                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Logos */}
                        <div className="p-2 pt-2 w-full">
                            <div className="flex flex-row items-center justify-center gap-6 sm:gap-8 md:gap-10 opacity-90 transition-all py-2">
                                <img src="/upi.png" alt="BHIM UPI" className="h-19 sm:h-10 print:h-10 object-contain" />
                                <img src="/famapp.png" alt="Famapp" className="h-10 sm:h-10 print:h-10 object-contain" />
                            </div>












                            <div className="mt-4 pt-1 border-t border-gray-100 text-center">
                                <p className="text-[10px] text-gray-400">Powered by <span className="font-bold text-gray-600">ClickIn</span></p>
                            </div>
                        </div>

                        {/* Decorative Bottom Bar */}
                        <div className="h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600"></div>
                    </div>
                </div>

                {/* INSTRUCTIONS / INFO */}
                <div className="space-y-6">
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">How to use</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-gray-600">
                            <p>1. <strong>Print this page</strong> on glossy paper or cardstock for best results.</p>
                            <p>2. Place the QR code on every table, or at your billing counter.</p>
                            <p>3. Customers scan with any camera app to verify menu and pay.</p>

                            <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 mt-2">
                                <p className="text-xs text-amber-800 font-medium flex gap-2">
                                    <span className="font-bold">Note:</span>
                                    This QR code links directly to your digital menu. Payments sent here will be notified to your Owner Dashboard instantly.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Customization</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Standee Theme</label>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#00BFA5] ring-2 ring-offset-2 ring-emerald-500 cursor-pointer"></div>
                                    
                                </div>
                            </div>
                            

                            
                        </CardContent>
                    </Card>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-qr, #printable-qr * {
                        visibility: visible;
                    }
                    #printable-qr {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%) scale(1.5);
                        border: none;
                        box-shadow: none;
                    }
                }
            `}</style>
        </div>
    )
}
