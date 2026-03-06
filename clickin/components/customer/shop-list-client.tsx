"use client"

import Link from "next/link"
import { Search, ArrowLeft, Star, Clock, MapPin } from "lucide-react"
import { ShopCard } from "@/components/shop/shop-card"
import { useState, useMemo, useEffect } from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { VendorShop } from "@/lib/types/vendor"
import { subscribeToAllShops } from "@/lib/vendor-service"

interface ShopListClientProps {
    initialShops: VendorShop[]
}

const CATEGORIES = ["All", "South Indian", "Snacks", "Juices", "Biryani", "Meals", "Desserts"]

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
}

export function ShopListClient({ initialShops }: ShopListClientProps) {
    const [shops, setShops] = useState<VendorShop[]>(initialShops)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [filterType, setFilterType] = useState<"ALL" | "VEG" | "RATING" | "FASTEST">("ALL")
    const [isSearchFocused, setIsSearchFocused] = useState(false)

    // Subscribe to real-time updates
    useEffect(() => {
        const unsubscribe = subscribeToAllShops((updatedShops) => {
            setShops(updatedShops)
        })
        return () => unsubscribe()
    }, [])

    const filteredShops = useMemo(() => {
        return shops.filter(shop => {
            // Search Text
            const matchesSearch =
                (shop.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                (shop.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) || false) ||
                (shop.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false)

            // Category Filter
            const matchesCategory = selectedCategory === "All" || (shop.tags?.includes(selectedCategory) || false)

            // Quick Filters
            let matchesFilterType = true
            if (filterType === "VEG") matchesFilterType = shop.cuisineType?.includes("Veg") || shop.tags?.includes("Veg") || false
            if (filterType === "RATING") matchesFilterType = (shop.rating || 0) >= 4.5
            // Fastest logic is simplified for Sort

            return matchesSearch && matchesCategory && matchesFilterType
        }).sort((a, b) => {
            if (filterType === "FASTEST") {
                return (a.estimatedWaitTime || 0) - (b.estimatedWaitTime || 0)
            }
            if (filterType === "RATING") {
                return (b.rating || 0) - (a.rating || 0)
            }
            // Sort by online status first, then by name
            if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1
            return a.name.localeCompare(b.name)
        })
    }, [shops, searchQuery, selectedCategory, filterType])

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* Glassmorphism Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="container mx-auto max-w-7xl px-4 py-4 md:py-5">
                    <div className="flex items-center gap-4 mb-5">
                        <Link href="/" className="p-2.5 -ml-2.5 rounded-full hover:bg-gray-100/80 text-gray-700 transition-all active:scale-95">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <div className="flex-1">
                            <motion.h1
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-2xl font-bold text-gray-900 tracking-tight"
                            >
                                Explore Campus
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-xs font-semibold text-gray-500 flex items-center gap-1.5 mt-0.5"
                            >
                                <MapPin className="h-3 w-3 text-emerald-600" />
                                All Canteens & Shops
                            </motion.p>
                        </div>
                        <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm shadow-sm border border-emerald-100">
                            {filteredShops.length}
                        </div>
                    </div>

                    {/* Enhanced Search Bar */}
                    <div className="relative mb-5 group">
                        <div className={cn(
                            "absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl transition-opacity duration-300",
                            isSearchFocused ? "opacity-100" : "opacity-0"
                        )} />
                        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 transition-all duration-300 focus-within:shadow-lg focus-within:border-emerald-500/50 overflow-hidden flex items-center">
                            <div className="pl-4 text-gray-400">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search canteens, dishes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className="w-full h-12 pl-3 pr-4 text-base font-medium outline-none bg-transparent placeholder:text-gray-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="pr-4 text-xs font-bold text-emerald-600 hover:underline"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Animated Category Pills */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 mask-fade-sides">
                        {CATEGORIES.map((cat, i) => (
                            <motion.button
                                key={cat}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border active:scale-95",
                                    selectedCategory === cat
                                        ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-900/20"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                )}
                            >
                                {cat}
                            </motion.button>
                        ))}
                    </div>

                    {/* Enhanced Sub-Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex gap-3 mt-3 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4"
                    >
                        <button
                            onClick={() => setFilterType(filterType === "VEG" ? "ALL" : "VEG")}
                            className={cn("flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 active:scale-95", filterType === "VEG" ? "bg-emerald-50 border-emerald-200 text-emerald-700 ring-2 ring-emerald-500/20" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}
                        >
                            <div className={cn("w-2 h-2 rounded-full transition-colors", filterType === "VEG" ? "bg-emerald-500" : "bg-emerald-200")} />
                            Pure Veg
                        </button>
                        <button
                            onClick={() => setFilterType(filterType === "RATING" ? "ALL" : "RATING")}
                            className={cn("flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 active:scale-95", filterType === "RATING" ? "bg-amber-50 border-amber-200 text-amber-700 ring-2 ring-amber-500/20" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}
                        >
                            <Star className={cn("h-3.5 w-3.5 transition-colors", filterType === "RATING" ? "fill-current" : "text-amber-400")} />
                            Top Rated
                        </button>
                        <button
                            onClick={() => setFilterType(filterType === "FASTEST" ? "ALL" : "FASTEST")}
                            className={cn("flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-300 active:scale-95", filterType === "FASTEST" ? "bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-blue-500/20" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300")}
                        >
                            <Clock className="h-3.5 w-3.5" />
                            Fastest
                        </button>
                    </motion.div>
                </div>
            </header>

            {/* Content with Framer Motion */}
            <div className="container mx-auto max-w-7xl p-4 md:p-6">
                <AnimatePresence mode="popLayout">
                    {filteredShops.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-24 text-center"
                        >
                            <div className="bg-white p-6 rounded-full mb-6 shadow-xl shadow-gray-100 ring-8 ring-gray-50">
                                <Search className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No shops found</h3>
                            <p className="text-sm text-gray-500 max-w-[240px] leading-relaxed">
                                We couldn't find any canteens matching your search. Try different keywords?
                            </p>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setFilterType("ALL") }}
                                className="mt-8 px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-bold shadow-lg shadow-gray-900/20 hover:bg-black transition-all active:scale-95"
                            >
                                Clear all filters
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        >
                            {filteredShops.map((shop) => {
                                const image = shop.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800";
                                return (
                                    <motion.div key={shop.id} variants={itemVariant} layout>
                                        <ShopCard
                                            id={shop.id}
                                            name={shop.name}
                                            description={`${shop.location || "Main Block"} • ${(shop.tags || shop.cuisineType || []).join(", ")}`}
                                            rating={shop.rating || 0}
                                            deliveryTime={`${shop.estimatedWaitTime || 20} mins`}
                                            image={image}
                                            imageColor="bg-gray-100"
                                            promoted={shop.rating > 4.5}
                                            discount={!shop.isOnline ? "OFFLINE" : null}
                                        />
                                        {!shop.isOnline && (
                                            <div className="mt-2 text-center">
                                                <span className="text-[10px] font-black text-gray-400 italic">OFFLINE</span>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
