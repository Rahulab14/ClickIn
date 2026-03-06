"use client"

import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Star, Plus, Minus, Search, Heart, Share2, MapPin, Clock, AlertTriangle } from "lucide-react"
import { useState, useEffect, useMemo } from "react"
import { cn } from "@/lib/utils"
import { useCart } from "@/context/customer/CartContext"
import { useFavorites } from "@/context/customer/FavoritesContext"
import { motion } from "framer-motion"
import { VendorShop, VendorMenuItem } from "@/lib/types/vendor"
import { subscribeToShop, subscribeToMenuItems } from "@/lib/vendor-service"

interface ShopMenuClientProps {
    shop: any; // Using any for hybrid compatibility
    menu: VendorMenuItem[];
}

export function ShopMenuClient({ shop: initialShop, menu: initialMenu }: ShopMenuClientProps) {
    const router = useRouter()
    const [shop, setShop] = useState<any>(initialShop)
    const [menu, setMenu] = useState<VendorMenuItem[]>(initialMenu)
    const shopId = initialShop.id

    // Subscribe to real-time updates
    useEffect(() => {
        if (!shopId || shopId === "demo-shop") return;

        const unsubShop = subscribeToShop(shopId, (updatedShop) => {
            if (updatedShop) setShop(updatedShop)
        })

        const unsubMenu = subscribeToMenuItems(shopId, (updatedMenu) => {
            setMenu(updatedMenu)
        })

        return () => {
            unsubShop()
            unsubMenu()
        }
    }, [shopId])

    // Normalize shop fields for UI
    const shopUI = {
        id: shop.id,
        name: shop.name,
        location: shop.location || "Main Block",
        image: shop.image || shop.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        rating: shop.rating || 0,
        deliveryTime: shop.deliveryTime || `${shop.estimatedWaitTime || 20} mins`,
    }

    const { items, addItem, updateQuantity, getItemCount } = useCart()
    const { isShopLiked, toggleShopLike, isItemLiked, toggleItemLike } = useFavorites()
    const [searchQuery, setSearchQuery] = useState("")
    const [isVegMode, setIsVegMode] = useState(false)
    const [activeCategory, setActiveCategory] = useState("All")

    const addToCart = (itemId: string) => {
        if (shop?.isOnline === false) return // Block if shop is offline
        const item = menu.find(i => i.id === itemId)
        if (!item || !item.available) return
        const stock = item.stock ?? -1
        // Prevent adding beyond available stock
        if (stock >= 0 && (items[itemId] || 0) >= stock) return
        addItem(itemId)
    }
    const removeFromCart = (itemId: string) => updateQuantity(itemId, -1)

    // Filter Logic
    const filteredMenu = useMemo(() => {
        return menu.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesVeg = isVegMode ? item.isVeg : true
            const matchesCategory = activeCategory === "All" ? true : item.category === activeCategory
            return matchesSearch && matchesVeg && matchesCategory
        })
    }, [menu, searchQuery, isVegMode, activeCategory])

    // Helper to check stock state
    const getStockInfo = (item: VendorMenuItem) => {
        const stock = item.stock ?? -1
        const isUnlimited = stock < 0
        const isOut = !item.available || stock === 0
        const isLow = !isUnlimited && stock > 0 && stock <= 5
        const cartQty = items[item.id] || 0
        const isShopOffline = shop?.isOnline === false
        const canAdd = !isOut && !isShopOffline && (isUnlimited || cartQty < stock)
        return { stock, isUnlimited, isOut, isLow, canAdd, cartQty, isShopOffline }
    }

    const allCategories = useMemo(() => {
        return ["All", ...Array.from(new Set(menu.filter(i => isVegMode ? i.isVeg : true).map(item => item.category)))]
    }, [menu, isVegMode])

    const displayCategories = useMemo(() => {
        return activeCategory === "All"
            ? Array.from(new Set(filteredMenu.map(item => item.category)))
            : [activeCategory]
    }, [filteredMenu, activeCategory])

    const groupedMenu = useMemo(() => {
        return displayCategories.reduce((acc, category) => {
            acc[category] = filteredMenu.filter(item => item.category === category)
            return acc
        }, {} as Record<string, VendorMenuItem[]>)
    }, [filteredMenu, displayCategories])

    const cartItemCount = getItemCount()
    const cartTotal = useMemo(() => {
        return Object.entries(items).reduce((total, [itemId, qty]) => {
            const item = menu.find(i => i.id === itemId)
            return total + (item ? (item.price * qty) : 0)
        }, 0)
    }, [items, menu])

    const handleCheckout = () => {
        if (cartItemCount === 0) return
        router.push(`/checkout?shopId=${shopId}`)
    }

    return (
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto w-full bg-white min-h-screen shadow-sm relative overflow-hidden">
            {/* Immersive Header */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-x-0 bottom-0 h-4/5 fade-to-top z-10"
                />
                <img
                    src={shopUI.image}
                    alt={shopUI.name}
                    className="w-full h-full object-cover grayscale-[20%]"
                />
                <div className="absolute inset-0 bg-black/40 z-10"></div>
            </div>

            {/* Offline Overlay on Header */}
            {shop?.isOnline === false && (
                <div className="absolute inset-x-0 top-0 pt-20 px-4 z-30 flex justify-center pointer-events-none">
                    <div className="bg-red-600 border-2 border-red-400/50 shadow-2xl text-white px-6 py-3 rounded-full flex items-center gap-3 animate-in slide-in-from-top-4">
                        <AlertTriangle className="h-5 w-5" strokeWidth={3} />
                        <div>
                            <p className="font-black text-sm tracking-widest uppercase">Shop is Closed</p>
                            <p className="text-[10px] font-bold text-red-100 uppercase tracking-widest">Not accepting orders</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Nav */}
            <div className="relative h-72 md:h-96 w-full transition-all duration-700 ease-in-out group overflow-hidden">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500" />

                {/* Navbar Overlay */}
                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
                    <button
                        onClick={() => router.back()}
                        className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl text-white hover:bg-white/30 transition-all hover:scale-110 active:scale-95 shadow-2xl"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div className="flex gap-4">
                        <button className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl text-white hover:bg-white/30 transition-all hover:scale-110 active:scale-95 shadow-2xl">
                            <Share2 className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => toggleShopLike(shopId)}
                            className={cn(
                                "backdrop-blur-xl border border-white/20 p-3 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-2xl",
                                isShopLiked(shopId) ? "bg-red-500/80 text-white" : "bg-white/10 text-white hover:bg-white/30"
                            )}
                        >
                            <Heart className={cn("h-5 w-5", isShopLiked(shopId) && "fill-current")} />
                        </button>
                    </div>
                </div>

                {/* Shop Info Overlay */}
                <div className="absolute bottom-12 left-0 right-0 p-8 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-4xl mx-auto"
                    >
                        <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] leading-none italic">
                            {shopUI.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-2xl text-sm font-black shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/20">
                                {shopUI.rating} <Star className="h-4 w-4 fill-current" />
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-2xl text-sm font-black flex items-center gap-2 shadow-2xl">
                                <MapPin className="h-4 w-4 text-emerald-400" />
                                {shopUI.location}
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-2xl text-sm font-black flex items-center gap-2 shadow-2xl">
                                <Clock className="h-4 w-4 text-amber-400" />
                                {shopUI.deliveryTime}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Menu Section */}
            <div className="bg-white rounded-t-[2.5rem] -mt-8 relative z-10 px-4 pt-8 md:px-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] mb-40">
                {/* Controls: Search & Veg Toggle */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="relative flex-1 h-12">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search &quot;ice cream&quot;"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full h-full pl-10 pr-12 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all"
                        />
                    </div>

                    <div className="flex flex-col items-center justify-center gap-1 min-w-[60px]">
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-wider leading-none transition-colors",
                            isVegMode ? "text-emerald-700" : "text-gray-400"
                        )}>
                            Pure Veg
                        </span>
                        <button
                            onClick={() => setIsVegMode(!isVegMode)}
                            className={cn(
                                "w-10 h-6 rounded-full transition-colors duration-300 relative focus:outline-none shadow-sm border",
                                isVegMode ? "bg-emerald-500 border-emerald-600" : "bg-gray-200 border-gray-300"
                            )}
                        >
                            <div className={cn(
                                "absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform duration-300",
                                isVegMode ? "translate-x-4" : "translate-x-0"
                            )} />
                        </button>
                    </div>
                </div>

                {/* Categories Filters */}
                <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                    {allCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 border",
                                activeCategory === cat
                                    ? "bg-gray-900 text-white border-gray-900 shadow-md transform scale-105"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="space-y-10 min-h-[300px]">
                    {Object.keys(groupedMenu).length === 0 ? (
                        <div className="text-center py-10 opacity-60">
                            <p className="text-lg font-bold">No items found</p>
                            <p className="text-sm">Try changing filters</p>
                        </div>
                    ) : (
                        displayCategories.map(category => (
                            groupedMenu[category] && groupedMenu[category].length > 0 && (
                                <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-5 flex items-center gap-3">
                                        {category}
                                        <span className="text-sm font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{groupedMenu[category].length}</span>
                                    </h3>
                                    <div className="space-y-6">
                                        {groupedMenu[category].map(item => {
                                            const si = getStockInfo(item)
                                            return (
                                                <motion.div
                                                    layout
                                                    key={item.id}
                                                    className={cn("group p-5 rounded-[2.5rem] border border-gray-100/80 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 bg-white flex gap-5 md:gap-8 relative overflow-hidden", si.isOut && "opacity-60")}
                                                >
                                                    {/* Item Info */}
                                                    <div className="flex-1 space-y-3 z-10 pt-2">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <div className={cn("h-5 w-5 border-2 rounded-md flex items-center justify-center p-0.5 shadow-sm", item.isVeg ? "border-emerald-500 bg-emerald-50/50" : "border-rose-500 bg-rose-50/50")}>
                                                                <div className={cn("h-full w-full rounded-full shadow-inner", item.isVeg ? "bg-emerald-500" : "bg-rose-500")} />
                                                            </div>
                                                            {item.bestseller && (
                                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-amber-700 bg-amber-100/80 px-3 py-1 rounded-full border border-amber-200/50 tracking-widest uppercase">
                                                                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                                                    Bestseller
                                                                </div>
                                                            )}
                                                            {si.isOut && (
                                                                <span className="text-[9px] font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100 uppercase tracking-widest">Sold Out</span>
                                                            )}
                                                            {si.isLow && !si.isOut && (
                                                                <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 flex items-center gap-1">
                                                                    <AlertTriangle className="h-2.5 w-2.5" /> Only {si.stock} left
                                                                </span>
                                                            )}
                                                            {!si.isUnlimited && !si.isOut && !si.isLow && (
                                                                <span className="text-[9px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                                    {si.stock} available
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => toggleItemLike(item.id)}
                                                                className={cn(
                                                                    "ml-auto p-1.5 rounded-full transition-all active:scale-90",
                                                                    isItemLiked(item.id) ? "text-red-500" : "text-gray-300 hover:text-red-400"
                                                                )}
                                                            >
                                                                <Heart className={cn("h-4 w-4 transition-all", isItemLiked(item.id) && "fill-current")} />
                                                            </button>
                                                        </div>
                                                        <h4 className={cn("font-black text-xl tracking-tight group-hover:text-primary transition-colors", si.isOut ? "text-gray-400" : "text-gray-900")}>{item.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-black text-gray-900 text-lg">₹{item.price}</p>

                                                        </div>
                                                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed font-bold tracking-tight">{item.description}</p>
                                                    </div>

                                                    {/* Item Image & Add Button */}
                                                    <div className="relative w-40 h-36 md:w-48 md:h-44 flex-shrink-0">
                                                        <div className={cn("w-full h-full rounded-[2rem] bg-gray-50/50 overflow-hidden shadow-sm relative group-hover:shadow-xl transition-all duration-500 border border-gray-100 flex items-center justify-center", si.isOut && "grayscale")}>
                                                            <div className="text-6xl transition-transform duration-700 group-hover:scale-110">
                                                                {item.image || "🍱"}
                                                            </div>
                                                        </div>
                                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-32 h-11 bg-white rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center justify-between overflow-hidden ring-4 ring-white group-hover:-translate-y-2 transition-all">
                                                            {si.isShopOffline ? (
                                                                <span className="w-full h-full flex items-center justify-center text-[12px] font-black text-red-500 bg-red-50">Closed</span>
                                                            ) : si.isOut ? (
                                                                <span className="w-full h-full flex items-center justify-center text-[12px] font-black text-gray-400">Unavailable</span>
                                                            ) : items[item.id] ? (
                                                                <div className="flex items-center justify-between w-full h-full">
                                                                    <button onClick={() => removeFromCart(item.id)} className="w-10 h-full flex items-center justify-center text-rose-500 hover:bg-rose-50"><Minus className="h-5 w-5" /></button>
                                                                    <span className="text-base font-black text-gray-900">{items[item.id]}</span>
                                                                    <button onClick={() => addToCart(item.id)} className={cn("w-10 h-full flex items-center justify-center transition-colors", si.canAdd ? "text-emerald-500 hover:bg-emerald-50" : "text-gray-300 cursor-not-allowed")} disabled={!si.canAdd}><Plus className="h-5 w-5" /></button>
                                                                </div>
                                                            ) : (
                                                                <button onClick={() => addToCart(item.id)} className="w-full h-full text-[13px] font-black text-primary hover:bg-primary/5 transition-all">Add +</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        ))
                    )}
                </div>
            </div>

            {/* Floating Cart Footer */}
            {cartItemCount > 0 && (
                <div className="fixed bottom-6 left-0 right-0 z-50 px-6 animate-in slide-in-from-bottom-20 duration-700">
                    <button
                        onClick={handleCheckout}
                        className="w-full max-w-md md:max-w-2xl mx-auto bg-gray-900 text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between group hover:scale-[1.02] transition-all"
                    >
                        <div className="flex flex-col items-start px-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">
                                {cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'} Added
                            </span>
                            <span className="text-2xl font-black">₹{cartTotal}</span>
                        </div>
                        <div className="bg-primary px-6 py-3 rounded-2xl flex items-center gap-4">
                            <span className="font-black text-sm uppercase">Place order</span>
                            <ArrowLeft className="h-5 w-5 rotate-180" strokeWidth={3} />
                        </div>
                    </button>
                </div>
            )}
        </div>
    )
}
