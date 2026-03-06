"use client"

import { useEffect, useState } from "react"
import { useVendorAuth } from "@/context/vendor/VendorContext"
import { subscribeToDailySummary } from "@/lib/vendor-service"
import { useAuth } from "@/context/auth/AuthContext"
import {
    Store, Star, MapPin, Phone, Mail, Clock, ShoppingBag, Users, TrendingUp,
    ChevronRight, Shield, Settings, CreditCard, Bell, ChefHat, Edit2, LogOut, Crown,
    Wifi, WifiOff, Award, BarChart3, Calendar, FileText, Banknote, QrCode
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { DailySummary } from "@/lib/types/vendor"

export default function VendorProfilePage() {
    const { role, shopId, shop, vendorProfile, isVendorLoading } = useVendorAuth()
    const { user, logout } = useAuth()
    const router = useRouter()
    const [summary, setSummary] = useState<DailySummary | null>(null)

    useEffect(() => {
        if (!shopId) return
        const unsub = subscribeToDailySummary(shopId, setSummary)
        return () => unsub()
    }, [shopId])

    if (isVendorLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-10 w-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
            </div>
        )
    }

    const shopName = shop?.name || vendorProfile?.shopName || "My Shop"
    const ownerName = vendorProfile?.name || user?.displayName || "Owner"
    const ownerEmail = vendorProfile?.email || user?.email || ""
    const shopPhone = shop?.phone || shop?.contactPhone || ""
    const shopAddress = shop?.address || ""
    const shopRating = shop?.rating || 0
    const shopRatingCount = shop?.ratingCount || 0
    const isOnline = shop?.isOnline ?? false
    const waitTime = shop?.estimatedWaitTime || 20
    const cuisineTypes = shop?.cuisineType || []
    const memberSince = vendorProfile?.createdAt ? new Date(vendorProfile.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "N/A"

    const quickLinks = [
        { icon: Settings, label: "Shop Settings", desc: "Hours, details & payment", href: "/vendor/settings", color: "text-gray-700 bg-gray-100" },
        { icon: ChefHat, label: "Menu Management", desc: "Add & update dishes", href: "/vendor/menu", color: "text-emerald-700 bg-emerald-50" },
        { icon: Users, label: "Staff Management", desc: "Approve & manage staff", href: "/vendor/staff", color: "text-blue-700 bg-blue-50" },
        { icon: ShoppingBag, label: "Order History", desc: "View all past orders", href: "/vendor/orders", color: "text-purple-700 bg-purple-50" },
        { icon: BarChart3, label: "Reports & Analytics", desc: "Sales & revenue reports", href: "/vendor/reports", color: "text-amber-700 bg-amber-50" },
        { icon: QrCode, label: "QR Standee", desc: "Generate & print QR code", href: "/vendor/qr", color: "text-teal-700 bg-teal-50" },
        { icon: Bell, label: "Notifications", desc: "Alert preferences", href: "/vendor/settings", color: "text-red-700 bg-red-50" },
        { icon: Shield, label: "Security", desc: "Password & access", href: "/vendor/settings", color: "text-indigo-700 bg-indigo-50" },
    ]

    return (
        <div className="space-y-5 pb-28 md:pb-8 max-w-2xl mx-auto">

            {/* Profile Hero Card */}
            <Card className="overflow-hidden border-0 shadow-lg relative">
                {/* Gradient Background */}
                <div className="h-28 md:h-36 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgMGwyMCAyMC0yMCAyMEwwIDIweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-50" />
                    {/* Edit Button */}
                    <Link href="/vendor/settings" className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/25 transition-colors">
                        <Edit2 className="h-4 w-4 text-white" />
                    </Link>
                    {/* Role Badge */}
                    <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4">
                        <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 font-bold text-[10px] md:text-xs px-2.5 py-1 flex items-center gap-1">
                            <Crown className="h-3 w-3" />
                            {role}
                        </Badge>
                    </div>
                </div>

                {/* Profile Info */}
                <CardContent className="pt-0 px-4 md:px-6 pb-5 relative">
                    {/* Avatar */}
                    <div className="flex items-end gap-4 -mt-10 md:-mt-12 mb-4">
                        <div className="shrink-0 h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                            {shop?.logo ? (
                                <img src={shop.logo} alt={shopName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                                    <Store className="h-8 w-8 md:h-10 md:w-10 text-emerald-600" />
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 pb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight truncate">{shopName}</h1>
                                {isOnline ? (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                        <Wifi className="h-3 w-3" /> Live
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                                        <WifiOff className="h-3 w-3" /> Offline
                                    </span>
                                )}
                            </div>
                            <p className="text-xs md:text-sm text-gray-500 font-medium truncate">Managed by {ownerName}</p>
                        </div>
                    </div>

                    {/* Quick Info Row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs md:text-sm text-gray-600">
                        {shopRating > 0 && (
                            <span className="flex items-center gap-1 font-bold text-amber-600">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {shopRating.toFixed(1)}
                                <span className="text-gray-400 font-medium">({shopRatingCount})</span>
                            </span>
                        )}
                        {shopAddress && (
                            <span className="flex items-center gap-1 text-gray-500">
                                <MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate max-w-[180px]">{shopAddress}</span>
                            </span>
                        )}
                        <span className="flex items-center gap-1 text-gray-500">
                            <Clock className="h-3.5 w-3.5" /> ~{waitTime} min
                        </span>
                    </div>

                    {/* Cuisine Tags */}
                    {cuisineTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {cuisineTypes.map(c => (
                                <span key={c} className="text-[10px] md:text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                                    {c}
                                </span>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="border-border/50 shadow-sm">
                <CardContent className="p-0 divide-y divide-gray-50">
                    {shopPhone && (
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="h-9 w-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                <Phone className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Phone</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{shopPhone}</p>
                            </div>
                        </div>
                    )}
                    {ownerEmail && (
                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                                <Mail className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                                <p className="text-sm font-bold text-gray-900 truncate">{ownerEmail}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3 px-4 py-3">
                        <div className="h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                            <Calendar className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Member Since</p>
                            <p className="text-sm font-bold text-gray-900">{memberSince}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Today's Stats */}
            {summary && (
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Today&apos;s Overview</h3>
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-emerald-50/50 to-white">
                            <CardContent className="p-3 md:p-4 text-center">
                                <Banknote className="h-5 w-5 text-emerald-600 mx-auto mb-1.5" />
                                <p className="text-lg md:text-xl font-black text-gray-900">₹{summary.totalRevenue.toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Revenue</p>
                            </CardContent>
                        </Card>
                        <Card className="border-border/50 shadow-sm">
                            <CardContent className="p-3 md:p-4 text-center">
                                <ShoppingBag className="h-5 w-5 text-blue-600 mx-auto mb-1.5" />
                                <p className="text-lg md:text-xl font-black text-gray-900">{summary.totalOrders}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Orders</p>
                            </CardContent>
                        </Card>
                        <Card className="border-border/50 shadow-sm">
                            <CardContent className="p-3 md:p-4 text-center">
                                <TrendingUp className="h-5 w-5 text-amber-600 mx-auto mb-1.5" />
                                <p className="text-lg md:text-xl font-black text-gray-900">₹{summary.averageOrderValue}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">Avg Order</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Top Selling Items */}
            {summary && summary.topSellingItems.length > 0 && (
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Top Sellers Today</h3>
                    <Card className="border-border/50 shadow-sm">
                        <CardContent className="p-0 divide-y divide-gray-50">
                            {summary.topSellingItems.slice(0, 5).map((item, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3">
                                    <div className={cn(
                                        "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                                        i === 0 ? "bg-amber-100 text-amber-700" :
                                            i === 1 ? "bg-gray-200 text-gray-600" :
                                                i === 2 ? "bg-orange-100 text-orange-700" :
                                                    "bg-gray-100 text-gray-500"
                                    )}>
                                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{item.count} sold</p>
                                    </div>
                                    <span className="text-sm font-black text-gray-900 shrink-0">₹{item.revenue.toLocaleString()}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Quick Links */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Quick Links</h3>
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardContent className="p-0 divide-y divide-gray-50">
                        {quickLinks.map((link) => {
                            const Icon = link.icon
                            return (
                                <Link key={link.label} href={link.href}>
                                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group cursor-pointer">
                                        <div className={cn("h-9 w-9 rounded-full flex items-center justify-center shrink-0", link.color)}>
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900">{link.label}</p>
                                            <p className="text-[10px] text-gray-400 font-medium">{link.desc}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors" />
                                    </div>
                                </Link>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>

            {/* Logout */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <button
                        onClick={async () => {
                            await logout()
                            router.push("/")
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors group text-left"
                    >
                        <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center shrink-0 group-hover:bg-red-100 transition-colors">
                            <LogOut className="h-4 w-4 text-red-500" />
                        </div>
                        <span className="text-sm font-bold text-red-500">Log Out</span>
                    </button>
                </CardContent>
            </Card>

            {/* Footer Credits */}
            <div className="text-center pt-2 pb-4">
                <p className="text-[10px] text-gray-300 font-medium">
                    Powered by <span className="font-bold text-gray-400">ClickIn Partner</span> • v1.0
                </p>
            </div>
        </div>
    )
}
