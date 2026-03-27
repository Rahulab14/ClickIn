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
    const [isLive, setIsLive] = useState(false)
    const shopId = initialShop.id

    // Subscribe to real-time updates
    useEffect(() => {
        if (!shopId || shopId === "demo-shop") {
            setIsLive(false)
            return
        }

        const unsubShop = subscribeToShop(shopId, (updatedShop) => {
            if (updatedShop) {
                setShop(updatedShop)
                setIsLive(true)
            }
        })

        const unsubMenu = subscribeToMenuItems(shopId, (updatedMenu) => {
            setMenu(updatedMenu)
            setIsLive(true)
        })

        return () => {
            unsubShop()
            unsubMenu()
        }
    }, [shopId])

    // Hardware Back Button Hijack for QR Scans (Android OS / Google Lens)
    useEffect(() => {
        // If the user arrived here directly (no internal referral), intercept the back button
        const isDirectVisit = !document.referrer.includes(window.location.host)
        
        if (isDirectVisit) {
            // Push a duplicate state so the hardware back button doesn't close the browser
            window.history.pushState(null, "", window.location.href)
            
            const handleHardwareBack = () => {
                // When they press the Android Native Back Button, route to home instead of Exiting Android Chrome
                router.push("/")
            }
            
            window.addEventListener("popstate", handleHardwareBack)
            return () => window.removeEventListener("popstate", handleHardwareBack)
        }
    }, [router])

    // Normalize shop fields for UI
    const shopUI = {
        id: shop.id,
        name: shop.name,
        location: shop.location || "Main Block",
        image: shop.image || shop.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
        rating: shop.rating || 0,
    }

    const { items, addItem, updateQuantity, getItemCount } = useCart()
    const { isShopLiked, toggleShopLike, isItemLiked, toggleItemLike } = useFavorites()
    const [searchQuery, setSearchQuery] = useState("")
    const [isVegMode, setIsVegMode] = useState(false)
    const [activeCategory, setActiveCategory] = useState("All")

    const addToCart = (itemId: string) => {
        if (shop?.isOnline === false) return 
        const item = menu.find(i => i.id === itemId)
        if (!item || !item.available) return
        const stock = item.stock ?? -1
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
        // Expanded width for desktop grids
        <div className="max-w-full xl:max-w-[1400px] mx-auto w-full bg-gray-50/50 min-h-screen relative pb-32">
            
            {/* Immersive Header */}
            <div className="absolute top-0 inset-x-0 h-72 md:h-96 z-0">
                <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
                <img
                    src={shopUI.image}
                    alt={shopUI.name}
                    className="w-full h-full object-cover grayscale-[15%]"
                />
                <div className="absolute inset-0 bg-black/30 z-10"></div>
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

            {/* Header Content */}
            <div className="relative h-72 md:h-96 w-full group overflow-hidden max-w-7xl mx-auto">
                {/* Navbar */}
                <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-20">
                    <button
                        onClick={() => {
                            const referrer = document.referrer
                            const isExternal = !referrer || !referrer.includes(window.location.host)
                            const currentPath = window.location.pathname

                            if (isExternal) {
                                router.replace("/")
                                return
                            }

                            router.back()

                            setTimeout(() => {
                                if (window.location.pathname === currentPath) {
                                    router.replace("/")
                                }
                            }, 150)
                        }}
                        className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl text-white hover:bg-white/30 transition-all hover:scale-110 active:scale-95 shadow-xl"
                    >
                        <ArrowLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                    <div className="flex gap-3 md:gap-4 items-center">
                        {isLive && (
                            <div className="hidden md:flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Live Sync
                            </div>
                        )}
                        {!isLive && shopId !== "demo-shop" && (
                            <div className="hidden md:flex items-center gap-2 bg-amber-500/20 backdrop-blur-md border border-amber-500/30 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-400">
                                <Clock className="h-3 w-3 animate-spin" />
                                Connecting...
                            </div>
                        )}
                        <button className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl text-white hover:bg-white/30 transition-all hover:scale-110 active:scale-95 shadow-xl">
                            <Share2 className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => toggleShopLike(shopId)}
                            className={cn(
                                "backdrop-blur-xl border border-white/20 p-3 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-xl",
                                isShopLiked(shopId) ? "bg-red-500/80 text-white border-red-500/50" : "bg-white/10 text-white hover:bg-white/30"
                            )}
                        >
                            <Heart className={cn("h-5 w-5", isShopLiked(shopId) && "fill-current")} />
                        </button>
                    </div>
                </div>

                {/* Shop Title Info */}
                <div className="absolute bottom-10 left-0 right-0 p-4 md:p-8 z-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tight text-white drop-shadow-md">
                            {shopUI.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-black shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/20">
                                {shopUI.rating} <Star className="h-3.5 w-3.5 fill-current" />
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 shadow-lg">
                                <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                                {shopUI.location}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-gray-50 rounded-t-[2.5rem] md:rounded-t-[3rem] -mt-6 relative z-10 px-4 pt-8 pb-20 md:px-8 lg:px-12 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Controls: Search & Veg Toggle */}
                    <div className="flex items-center gap-4 mb-8 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                        <div className="relative flex-1 h-12">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search menus, dishes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full h-full pl-12 pr-4 bg-transparent border-none text-base font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
                            />
                        </div>
                        <div className="h-8 w-px bg-gray-200 mx-2"></div>
                        <div className="flex items-center gap-3 pr-2 cursor-pointer" onClick={() => setIsVegMode(!isVegMode)}>
                            <span className={cn(
                                "text-xs md:text-sm font-bold transition-colors select-none",
                                isVegMode ? "text-emerald-600" : "text-gray-400"
                            )}>
                                Pure Veg
                            </span>
                            <button
                                className={cn(
                                    "w-11 h-6 rounded-full transition-colors duration-300 relative focus:outline-none shadow-inner border",
                                    isVegMode ? "bg-emerald-500 border-emerald-600" : "bg-gray-200 border-gray-300"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform duration-300",
                                    isVegMode ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                    </div>

                    {/* Categories Filters */}
                    <div className="flex gap-2.5 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 mb-6">
                        {allCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 border active:scale-95",
                                    activeCategory === cat
                                        ? "bg-gray-900 text-white border-gray-900 shadow-md"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Menu Grid */}
                    <div className="space-y-12 min-h-[400px]">
                        {Object.keys(groupedMenu).length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-60">
                                <Search className="h-12 w-12 text-gray-300 mb-4" />
                                <p className="text-xl font-bold text-gray-600">No items found</p>
                                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            displayCategories.map(category => (
                                groupedMenu[category] && groupedMenu[category].length > 0 && (
                                    <div key={category} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                            {category}
                                            <span className="text-sm font-bold text-emerald-700 bg-emerald-100/50 px-2.5 py-1 rounded-lg border border-emerald-200/50">
                                                {groupedMenu[category].length}
                                            </span>
                                        </h3>
                                        
                                        {/* CSS GRID APPLIED HERE */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                                            {groupedMenu[category].map(item => {
                                                const si = getStockInfo(item)
                                                return (
                                                    <motion.div
                                                        layout
                                                        key={item.id}
                                                        className={cn(
                                                            "group p-4 md:p-5 rounded-[2rem] border border-gray-200/60 hover:border-emerald-500/30 hover:shadow-xl transition-all duration-300 bg-white flex justify-between gap-4 md:gap-6 relative",
                                                            si.isOut && "opacity-60 bg-gray-50"
                                                        )}
                                                    >
                                                        {/* Absolute Favorite Button (Top Right of Info) */}
                                                        <button
                                                            onClick={() => toggleItemLike(item.id)}
                                                            className="absolute top-4 right-[140px] md:right-[165px] z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 shadow-sm transition-all active:scale-90"
                                                        >
                                                            <Heart className={cn("h-4 w-4 transition-colors", isItemLiked(item.id) ? "fill-red-500 text-red-500" : "text-gray-400")} />
                                                        </button>

                                                        {/* Left side: Item Info */}
                                                        <div className="flex-1 flex flex-col pt-1">
                                                            {/* Tags */}
                                                            <div className="flex items-center flex-wrap gap-2 mb-2">
                                                                <div className={cn("h-4 w-4 border-2 rounded flex items-center justify-center p-0.5", item.isVeg ? "border-emerald-600 bg-emerald-50" : "border-rose-600 bg-rose-50")}>
                                                                    <div className={cn("h-full w-full rounded-full", item.isVeg ? "bg-emerald-600" : "bg-rose-600")} />
                                                                </div>
                                                                
                                                                {item.bestseller && (
                                                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                                                                        Bestseller
                                                                    </span>
                                                                )}
                                                                
                                                                {si.isOut ? (
                                                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">Sold Out</span>
                                                                ) : si.isLow ? (
                                                                    <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 flex items-center gap-1">
                                                                        <AlertTriangle className="h-2.5 w-2.5" /> {si.stock} left
                                                                    </span>
                                                                ) : null}
                                                            </div>
                                                            
                                                            <h4 className={cn("font-bold text-lg leading-tight md:text-xl text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2", si.isOut && "text-gray-500")}>
                                                                {item.name}
                                                            </h4>
                                                            <p className="font-black text-gray-900 mt-1 mb-2">₹{item.price}</p>
                                                            <p className="text-xs md:text-sm text-gray-500 leading-relaxed line-clamp-2 mt-auto">
                                                                {item.description}
                                                            </p>
                                                        </div>

                                                        {/* Right side: Image & Add Button */}
                                                        <div className="relative w-[120px] h-[120px] md:w-[140px] md:h-[140px] flex-shrink-0 flex flex-col items-center">
                                                            <div className={cn("w-full h-full rounded-[1.5rem] bg-gray-100 overflow-hidden shadow-sm relative group-hover:shadow-md transition-all duration-500 flex items-center justify-center", si.isOut && "grayscale")}>
                                                                {item.image && (item.image.startsWith('http') || item.image.startsWith('/')) ? (
                                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                                ) : (
                                                                    <span className="text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-500">{item.image || "🍲"}</span>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Floating Add Button Overlapping Image */}
                                                            <div className="absolute -bottom-3 w-[100px] md:w-[110px] h-10 bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-emerald-100 flex items-center justify-between overflow-hidden group-hover:-translate-y-1 group-hover:shadow-lg transition-all duration-300">
                                                                {si.isShopOffline ? (
                                                                    <span className="w-full h-full flex items-center justify-center text-xs font-bold text-red-500 bg-red-50">Closed</span>
                                                                ) : si.isOut ? (
                                                                    <span className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">Sold</span>
                                                                ) : items[item.id] ? (
                                                                    <div className="flex items-center justify-between w-full h-full">
                                                                        <button onClick={() => removeFromCart(item.id)} className="w-8 md:w-10 h-full flex items-center justify-center text-rose-500 hover:bg-rose-50 active:bg-rose-100 transition-colors"><Minus className="h-4 w-4" /></button>
                                                                        <span className="text-sm font-black text-gray-900">{items[item.id]}</span>
                                                                        <button onClick={() => addToCart(item.id)} className={cn("w-8 md:w-10 h-full flex items-center justify-center transition-colors hover:bg-emerald-50 active:bg-emerald-100", si.canAdd ? "text-emerald-500" : "text-gray-300")} disabled={!si.canAdd}><Plus className="h-4 w-4" /></button>
                                                                    </div>
                                                                ) : (
                                                                    <button onClick={() => addToCart(item.id)} className="w-full h-full text-sm font-black text-emerald-600 hover:bg-emerald-50 transition-colors">ADD</button>
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
            </div>

            {/* Floating Cart Footer */}
            {cartItemCount > 0 && (
                <div className="fixed bottom-6 left-0 right-0 z-50 px-4 md:px-8 animate-in slide-in-from-bottom-20 duration-500 pointer-events-none">
                    <div className="max-w-7xl mx-auto flex justify-center lg:justify-end pointer-events-auto">
                        <button
                            onClick={handleCheckout}
                            className="w-full md:w-auto min-w-[320px] bg-gray-900 text-white p-3 md:p-4 rounded-[2rem] shadow-2xl shadow-gray-900/40 flex items-center justify-between gap-6 hover:scale-[1.02] hover:bg-black transition-all"
                        >
                            <div className="flex flex-col items-start px-3 md:px-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                                    {cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'}
                                </span>
                                <span className="text-xl md:text-2xl font-black text-emerald-400">₹{cartTotal}</span>
                            </div>
                            <div className="bg-emerald-500 text-gray-900 px-6 py-3.5 rounded-2xl flex items-center gap-3">
                                <span className="font-black text-sm uppercase">Checkout</span>
                                <ArrowLeft className="h-4 w-4 rotate-180" strokeWidth={3} />
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}