"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { getShopById, SHOPS } from "@/lib/mock-data"
import { ArrowLeft, Trash2, ShoppingBag, ChevronRight, Home, MoreHorizontal, Check } from "lucide-react"
import { Suspense, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { useCart } from "@/context/customer/CartContext"

function CartPageContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const shopId = searchParams.get("shopId")
    const cartData = searchParams.get("data")

    const { items: cartItems, updateQuantity: contextUpdateQty, removeItem: contextRemoveItem } = useCart()
    const [shop, setShop] = useState<any>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        if (shopId) {
            setShop(getShopById(shopId))
        } else {
            // Fallback: If no shopId, maybe try to infer from items or show empty?
            // For now, let's keep the dummy fallback if strict "no shopId" behavior isn't defined, 
            // OR just don't load shop and let "Loading..." or Empty state handle it.
            // But if we have items in context, we probably want to show them.
            // Problem: We need 'shop' object to get item details (name, price, image).
            // Passing shopId in context would be better long term.
            // For this MVP, let's assume we always get shopId passed or default to first shop if testing.
            const dummyShop = SHOPS[0]
            setShop(dummyShop)
        }
    }, [shopId])

    const updateQuantity = (itemId: string, delta: number) => {
        contextUpdateQty(itemId, delta)
    }

    const removeItem = (itemId: string) => {
        contextRemoveItem(itemId)
    }

    const handleCheckout = () => {
        if (!shopId) return;
        router.push(`/checkout?shopId=${shopId}`);
    }

    if (!shop) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>
    }

    const items = Object.entries(cartItems).map(([itemId, qty]) => {
        const item = shop.menu.find((i: any) => i.id === itemId)
        return item ? { ...item, qty } : null
    }).filter(Boolean) as any[]

    const itemTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0)
    const grandTotal = itemTotal

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col font-sans">
                {/* Header */}
                <div className="px-5 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 flex items-center justify-center"
                        >
                            <ArrowLeft className="h-6 w-6 text-gray-900" />
                        </button>
                        <h1 className="font-bold text-xl text-gray-900">My Cart</h1>
                    </div>
                    <button className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center">
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                </div>

                {/* Empty State */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-12">
                    {/* Clipboard Illustration */}
                    <div className="relative w-56 h-56 mb-8">
                        {/* Back clipboard (tilted left) */}
                        <svg
                            className="absolute left-4 top-4"
                            width="140" height="170" viewBox="0 0 140 170" fill="none"
                            style={{ transform: "rotate(-12deg)" }}
                        >
                            <rect x="5" y="20" width="130" height="145" rx="14" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5" />
                            <rect x="40" y="10" width="60" height="20" rx="6" fill="#34D399" />
                            <rect x="45" y="6" width="50" height="10" rx="5" fill="#34D399" />
                            <rect x="58" y="2" width="24" height="8" rx="4" fill="#10B981" />
                        </svg>
                        {/* Front clipboard */}
                        <svg
                            className="absolute left-12 top-2"
                            width="150" height="180" viewBox="0 0 150 180" fill="none"
                            style={{ transform: "rotate(2deg)" }}
                        >
                            <rect x="5" y="22" width="140" height="155" rx="14" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1.5" />
                            <rect x="10" y="25" width="130" height="148" rx="12" fill="#F3F4F6" />
                            <rect x="42" y="12" width="66" height="22" rx="6" fill="#34D399" />
                            <rect x="48" y="8" width="54" height="12" rx="5" fill="#34D399" />
                            <rect x="60" y="3" width="30" height="10" rx="5" fill="#10B981" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">Empty</h2>
                    <p className="text-gray-400 text-base leading-relaxed text-center max-w-[260px]">
                        You don&apos;t have any foods in cart at this time
                    </p>

                    {/* Navigation Routes */}
                    <div className="flex flex-col gap-3 mt-8 w-full max-w-[260px]">
                        <button
                            onClick={() => router.push("/")}
                            className="w-full py-3.5 bg-emerald-500 text-white font-bold text-sm rounded-2xl active:scale-[0.97] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Browse Menu
                        </button>
                        <button
                            onClick={() => router.push("/categories")}
                            className="w-full py-3.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-2xl active:scale-[0.97] transition-all flex items-center justify-center gap-2"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Explore Categories
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-indigo-100">
            <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full">
                {/* Header */}
                <div className="px-5 py-8 flex items-center justify-between sticky top-0 z-30 bg-gray-50/80 backdrop-blur-xl border-b border-gray-100/50 shadow-sm md:mt-4 md:rounded-t-3xl">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center transition-all active:scale-95 group hover:bg-gray-50"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-700 group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <h1 className="font-black text-2xl text-gray-900 tracking-tight">My Cart</h1>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{items.length} items to checkout</p>
                        </div>
                    </div>
                    <button className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="h-6 w-6" />
                    </button>
                </div>

                <div className="px-5 pt-6 space-y-6 pb-32">
                    <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                            <SwipeableCartItem
                                key={item.id}
                                item={item}
                                onRemove={() => removeItem(item.id)}
                                onCheckout={handleCheckout}
                            />
                        ))}
                    </AnimatePresence>

                    {/* Summary Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2rem] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.05)] border border-gray-100"
                    >
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold text-sm">Item Total</span>
                                <span className="text-gray-900 font-black text-lg">₹{itemTotal}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold text-sm">Delivery Fee</span>
                                <span className="text-emerald-500 font-black text-sm uppercase tracking-widest">Free</span>
                            </div>
                            <div className="h-px bg-gray-100 w-full" />
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-gray-900 font-black text-xl">Grand Total</span>
                                <span className="text-primary font-black text-2xl">${grandTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isProcessing}
                            className="w-full bg-gray-900 text-white py-5 rounded-[1.5rem] font-black text-lg shadow-2xl shadow-gray-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                        >
                            {isProcessing ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                                />
                            ) : (
                                <>
                                    Proceed to Checkout
                                    <ChevronRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

function SwipeableCartItem({ item, onRemove, onCheckout }: { item: any, onRemove: () => void, onCheckout: () => void }) {
    const x = useMotionValue(0)
    const cardHeight = 110 // Match image scale

    // Swipe Right (x > 0) -> Delete (Red, Left Icon)
    // Swipe Left (x < 0) -> Checkout (Green, Right Icon)

    const backgroundOpacity = useTransform(x, [-50, 0, 50], [1, 0, 1])
    // Left swipe reveals Right (Checkout) - Green/White?
    // Right swipe reveals Left (Delete) - Red

    const rightSideColor = "#10B981" // Green for Checkout
    const leftSideColor = "#EF4444" // Red for Delete

    // Dynamic background gradient to show correct color on correct side
    // We can just use a solid color if we know direction or use a clever gradient
    // Simpler: Two divs behind the card.

    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.x < -100) { // Swiped Left
            onCheckout()
        } else if (info.offset.x > 100) { // Swiped Right
            onRemove()
        }
    }

    return (
        <motion.div
            layout
            exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.9, transition: { duration: 0.3 } }}
            className="relative w-full mb-6"
            style={{ height: cardHeight }}
        >
            {/* Background Actions Layer */}
            <div className="absolute inset-0 rounded-[2rem] overflow-hidden flex shadow-inner">
                {/* Left Side (Revealed when swiping Right) - DELETE */}
                <div className="w-1/2 h-full bg-rose-500 flex items-center pl-10">
                    <motion.div style={{ opacity: useTransform(x, [0, 80], [0, 1]), scale: useTransform(x, [0, 80], [0.5, 1.2]) }}>
                        <Trash2 className="text-white h-8 w-8 drop-shadow-lg" />
                    </motion.div>
                </div>
                {/* Right Side (Revealed when swiping Left) - CHECKOUT */}
                <div className="w-1/2 h-full bg-emerald-500 flex items-center justify-end pr-10">
                    <motion.div style={{ opacity: useTransform(x, [0, -80], [0, 1]), scale: useTransform(x, [0, -80], [0.5, 1.2]) }}>
                        <Check className="text-white h-9 w-9 drop-shadow-lg" />
                    </motion.div>
                </div>
            </div>

            {/* Foreground Card */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.8}
                onDragEnd={handleDragEnd}
                style={{ x }}
                className="absolute inset-0 bg-white rounded-[2rem] p-4 flex gap-5 items-center shadow-[0_10px_30px_rgba(0,0,0,0.03)] z-10 cursor-grab active:cursor-grabbing border border-gray-100/50"
            >
                {/* Image Stack Effect */}
                <div className="relative w-24 h-full flex-shrink-0">
                    <div className="absolute top-0 bottom-0 -left-2 w-full bg-gray-900 rounded-[1.5rem] transform scale-[0.85] origin-right h-full opacity-10" />
                    <div className="absolute top-0 bottom-0 -left-1 w-full bg-primary/20 rounded-[1.5rem] transform scale-[0.92] origin-right h-full" />

                    {/* Main Image */}
                    <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-gray-50 flex items-center justify-center text-4xl shadow-md z-10 border-2 border-white ring-1 ring-black/[0.03]">
                        {item.image}
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center h-full">
                    <h3 className="font-black text-gray-900 text-lg leading-tight mb-1 line-clamp-1">{item.name}</h3>

                    <div className="flex items-center gap-2 mb-3">
                        <div className="px-2 py-0.5 bg-gray-100 rounded-md text-[10px] font-black text-gray-500 uppercase tracking-wider">
                            {item.qty} items
                        </div>
                        <div className="px-2 py-0.5 bg-primary/10 rounded-md text-[10px] font-black text-primary uppercase tracking-wider">
                            1.5 km
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="font-black text-primary text-xl">
                            ${(item.price * item.qty).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-3 bg-gray-50 px-2 py-1 rounded-xl border border-gray-100">
                            <span className="text-xs font-black text-gray-900">Qty: {item.qty}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default function CartPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>}>
            <CartPageContent />
        </Suspense>
    )
}
