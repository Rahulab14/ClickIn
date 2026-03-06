"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"
import { Download, Printer, Share2, Store, Lock } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function VendorQRGeneratorPage() {
    const router = useRouter()
    const [role, setRole] = useState<string | null>(null)
    const [shopName, setShopName] = useState("Sultan Kacchi Biryani")
    const printRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const storedRole = localStorage.getItem("vendorRole")
        setRole(storedRole)
        if (storedRole && storedRole !== "OWNER") {
            // Optional: Redirect staff away
            // router.push("/vendor/dashboard") 
        }
    }, [])

    const handlePrint = () => {
        window.print()
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
                    <Button onClick={handlePrint} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200">
                        <Printer className="h-4 w-4" /> Print Standee
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* PREVIEW SECTION (The Standee) */}
                <div className="flex justify-center">
                    <div
                        ref={printRef}
                        id="printable-qr"
                        className="w-full max-w-[320px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-200 transform transition-transform hover:scale-[1.02] duration-300"
                    >
                        {/* Header - Payment App Style */}
                        <div className="bg-[#00BFA5] p-6 text-center relative overflow-hidden">
                            {/* Background Pattern */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                            <div className="relative z-10">
                                <h1 className="text-2xl font-black text-white tracking-tight mb-1">Clickin Pay</h1>
                                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">Accepted Here</p>
                            </div>
                        </div>

                        {/* Top Curved Connector */}
                        <div className="h-4 bg-[#00BFA5] rounded-b-[50%] -mt-2 relative z-10"></div>

                        {/* QR Code Area */}
                        <div className="p-8 pb-4 flex flex-col items-center">
                            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">{shopName}</h3>
                            <p className="text-xs text-gray-400 mb-6 font-medium">Scan to View Menu & Order</p>

                            <div className="p-1 bg-white border-2 border-dashed border-emerald-200 rounded-2xl relative">
                                <div className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-[#00BFA5]"></div>
                                <div className="absolute -top-2 -right-2 w-4 h-4 border-t-4 border-r-4 border-[#00BFA5]"></div>
                                <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-4 border-l-4 border-[#00BFA5]"></div>
                                <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-[#00BFA5]"></div>

                                <QRCodeSVG
                                    value={`https://clickin.app/menu/${shopName.toLowerCase().replace(/\s+/g, '-')}`}
                                    size={200}
                                    level="H"
                                    includeMargin={true}
                                    className="rounded-xl"
                                />

                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-white p-1 rounded-full shadow-sm">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <Store className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Logos */}
                        <div className="p-6 pt-2">
                            <div className="flex items-center justify-center gap-4 opacity-60 grayscale hover:grayscale-0 transition-all">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1200px-UPI-Logo-vector.svg.png" alt="UPI" className="h-4 object-contain" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/2560px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="h-4 object-contain" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/768px-Google_%22G%22_logo.svg.png" alt="GPay" className="h-5 object-contain" />
                                <span className="text-[10px] font-bold text-gray-400">+ Cash</span>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                <p className="text-[10px] text-gray-400">Powered by <span className="font-bold text-gray-600">Clickin Partner</span></p>
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
                                    <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer opacity-50 hover:opacity-100"></div>
                                    <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer opacity-50 hover:opacity-100"></div>
                                    <div className="w-8 h-8 rounded-full bg-black cursor-pointer opacity-50 hover:opacity-100"></div>
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
