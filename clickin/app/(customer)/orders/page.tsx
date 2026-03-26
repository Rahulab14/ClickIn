"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Search, ArrowLeft, Clock, FileText, RotateCcw, ChevronRight, Receipt } from "lucide-react"
import { Logo } from "@/components/ui/Logo"
import { useAuth } from "@/context/auth/AuthContext"
import { collection, query, where, onSnapshot, Unsubscribe } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { VendorOrder } from "@/lib/types/vendor"
import { getShop } from "@/lib/vendor-service"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/customer/CartContext"

type FormattedOrder = {
    id: string
    hotelName: string
    shopId: string
    image: string
    itemsCount: number
    distance: string
    price: number
    status: string
    originalOrder: VendorOrder
}

export default function CustomerOrdersPage() {
    const [tab, setTab] = useState<"Active" | "History">("Active")
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState<FormattedOrder[]>([])

    const { user } = useAuth()
    const router = useRouter()
    const { clearCart, updateQuantity } = useCart()

    useEffect(() => {
        if (!user) {
            setOrders([])
            setLoading(false)
            return
        }

        setLoading(true)
        const q = query(collection(db, "orders"), where("customerId", "==", user.uid))

        const unsubscribe = onSnapshot(q, async (snap) => {
            try {
                const fetchedOrders: FormattedOrder[] = []

                // Collect promises for shop info to fetch in parallel
                const shopIds = Array.from(new Set(snap.docs.map(d => d.data().shopId)))
                const shopDataMap: Record<string, any> = {}

                await Promise.all(shopIds.map(async (id) => {
                    const shop = await getShop(id)
                    shopDataMap[id] = shop
                }))

                for (const docSnap of snap.docs) {
                    const data = { id: docSnap.id, ...docSnap.data() } as VendorOrder

                    const isActivePhase = ["NEW", "PREPARING", "READY"].includes(data.status)
                    const isHistoryPhase = ["COMPLETED", "CANCELLED"].includes(data.status)

                    if (tab === "Active" && !isActivePhase) continue
                    if (tab === "History" && !isHistoryPhase) continue

                    const shopInfo = shopDataMap[data.shopId]
                    const hotelName = shopInfo?.name || "Unknown Shop"
                    const image = shopInfo?.logo || (data.items.length > 0 ? data.items[0].image : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop")
                    const itemsCount = data.items.reduce((sum, item) => sum + item.quantity, 0)

                    fetchedOrders.push({
                        id: data.id,
                        hotelName,
                        shopId: data.shopId,
                        image: typeof image === "string" ? image : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop",
                        itemsCount,
                        distance: "2.5 km",
                        price: data.total,
                        status: data.status,
                        originalOrder: data
                    })
                }

                fetchedOrders.sort((a, b) => new Date(b.originalOrder.createdAt).getTime() - new Date(a.originalOrder.createdAt).getTime())
                setOrders(fetchedOrders)
            } catch (error) {
                console.error("Error processing orders snapshot:", error)
            } finally {
                setLoading(false)
            }
        }, (error) => {
            console.error("Order snapshot listener error:", error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user, tab])

    const handleOrderAgain = (order: FormattedOrder) => {
        clearCart()
        order.originalOrder.items.forEach(item => {
            updateQuantity(item.menuItemId, item.quantity)
        })
        router.push(`/cart?shopId=${order.shopId}`)
    }

    const handleTrackOrReceipt = (order: FormattedOrder) => {
        router.push(`/order/${order.id}?shopId=${order.shopId}`)
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/40 via-gray-50 to-[#F8F9FA] font-sans pb-24 selection:bg-emerald-100">
            <div className="max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto w-full relative">

                {/* Header */}
                <header className="bg-white/70 backdrop-blur-xl px-5 py-5 flex items-center justify-between sticky top-0 z-30 border-b border-gray-100 dark:border-gray-800 shadow-sm md:mt-6 md:rounded-t-[2.5rem] transition-all duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-3 -ml-1 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:text-black hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95 group"
                        >
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 leading-none tracking-tight">Your Orders</h1>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 opacity-70">Live Activity</p>
                        </div>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                        <Logo width={28} height={28} />
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex items-center px-4 bg-white/40 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 z-10 relative">
                    {(["Active", "History"] as const).map((t) => {
                        const isActive = tab === t
                        return (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={cn(
                                    "flex-1 pb-4 pt-4 text-[13px] font-black uppercase tracking-widest transition-all relative overflow-hidden",
                                    isActive ? "text-emerald-700" : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
                                )}
                            >
                                <span className="relative z-10">{t}</span>
                                {isActive && (
                                    <>
                                        <div className="absolute bottom-0 left-0 right-0 mx-auto w-10 h-1 bg-emerald-600 rounded-t-full z-10" />
                                        <div className="absolute inset-0 bg-emerald-500/5 animate-in fade-in duration-500" />
                                    </>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Content */}
                <div className="px-4 md:px-6 py-6 space-y-5 w-full">
                    {loading ? (
                        <div className="flex justify-center py-24">
                            <div className="relative w-12 h-12">
                                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20"></div>
                                <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 animate-spin"></div>
                            </div>
                        </div>
                    ) : !user ? (
                        <div className="text-center py-20 px-6 bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-sm">
                            <div className="w-16 h-16 bg-gray-100/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white">
                                <Clock className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Login Required</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium mb-6 text-sm">Please log in to view and track your orders.</p>
                            <button onClick={() => router.push("/login")} className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 active:scale-95 transition-all shadow-lg shadow-emerald-500/25">
                                Login Now
                            </button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 px-6 bg-white/50 backdrop-blur-xl rounded-[2rem] border border-white/60 shadow-sm">
                            <div className="w-16 h-16 bg-gray-100/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white">
                                <Receipt className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">No {tab.toLowerCase()} orders</h3>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">When you place an order, it will appear here.</p>
                            <button onClick={() => router.push("/")} className="mt-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all text-sm shadow-sm inline-flex items-center gap-2">
                                Browse Menu <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-5 shadow-sm border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/40 group relative overflow-hidden border-b-4 border-b-transparent hover:border-b-emerald-400">

                                {/* Card Top */}
                                <div className="flex gap-5 mb-6 relative z-10">
                                    {/* Image Container */}
                                    <div className="relative shrink-0 group">
                                        <div className="w-[90px] h-[90px] rounded-[2rem] overflow-hidden bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.05]">
                                            <img
                                                src={order.image}
                                                alt={order.hotelName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {tab === "Active" && (
                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center animate-pulse">
                                                <div className="w-2 h-2 bg-white dark:bg-gray-900 rounded-full" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Content */}
                                    <div className="flex flex-col justify-center flex-1">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <h3 className="font-black text-lg text-gray-900 dark:text-gray-100 leading-none tracking-tight group-hover:text-emerald-600 transition-colors">
                                                {order.hotelName}
                                            </h3>
                                            <div className={cn(
                                                "text-[9px] font-black px-2.5 py-1 rounded-lg tracking-widest uppercase border",
                                                ["COMPLETED", "CANCELLED"].includes(order.status) 
                                                    ? order.status === "COMPLETED" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"
                                                    : "bg-blue-50 border-blue-100 text-blue-600 animate-pulse"
                                            )}>
                                                {order.status}
                                            </div>
                                        </div>

                                        <p className="text-gray-400 dark:text-gray-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span>{order.itemsCount} items</span>
                                            <span className="h-1 w-1 bg-gray-200 rounded-full" />
                                            <span>{order.distance}</span>
                                        </p>

                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-900 dark:text-gray-100 font-black text-xl tracking-tighter">
                                                ₹{order.price.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Container */}
                                <div className="flex gap-3 relative z-10">
                                    <button
                                        onClick={() => handleTrackOrReceipt(order)}
                                        className="flex-[1.2] py-4 px-4 rounded-[1.5rem] bg-gray-900 text-white font-black text-[12px] uppercase tracking-widest hover:bg-black active:scale-[0.98] transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
                                    >
                                        {tab === "Active" ? <Clock className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
                                        {tab === "Active" ? "Track Flow" : "Get Receipt"}
                                    </button>
                                    {tab === "History" && order.status === "COMPLETED" && (
                                        <button
                                            onClick={() => handleOrderAgain(order)}
                                            className="flex-1 py-4 px-4 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 font-black text-[12px] uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                            Re-order
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
