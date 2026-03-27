"use client"

import Link from "next/link"
import { Search, ArrowLeft, Star, Clock, MapPin, X } from "lucide-react"
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
            staggerChildren: 0.08
        }
    }
}

const itemVariant = {
    hidden: { opacity: 0, y: 30 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
}

export function ShopListClient({ initialShops }: ShopListClientProps) {
    const [shops, setShops] = useState<VendorShop[]>(initialShops)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [filterType, setFilterType] = useState<"ALL" | "VEG" | "RATING">("ALL")
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

            return matchesSearch && matchesCategory && matchesFilterType
        }).sort((a, b) => {
            if (filterType === "RATING") {
                return (b.rating || 0) - (a.rating || 0)
            }
            // Sort by online status first, then by name
            if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1
            return a.name.localeCompare(b.name)
        })
    }, [shops, searchQuery, selectedCategory, filterType])

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-emerald-100 selection:text-emerald-900">
            {/* Glassmorphism Header */}
            <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-gray-200/80 shadow-sm transition-all duration-300">
                <div className="container mx-auto max-w-7xl px-4 py-5 md:py-6">
                    
                    {/* Top Bar */}
                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors active:scale-95">
                                <ArrowLeft className="h-6 w-6" />
                            </Link>
                            <div>
                                <motion.h1
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight"
                                >
                                    Explore Campus
                                </motion.h1>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="flex items-center gap-1.5 mt-1 text-sm font-medium text-gray-500"
                                >
                                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                                    All Canteens & Shops
                                </motion.div>
                            </div>
                        </div>
                        <div className="hidden sm:flex h-11 w-11 bg-emerald-50 rounded-full items-center justify-center text-emerald-700 font-bold text-sm border border-emerald-100 shadow-sm">
                            {filteredShops.length}
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-6 group max-w-3xl">
                        <div className={cn(
                            "absolute inset-0 bg-emerald-500/10 rounded-2xl blur-xl transition-opacity duration-300",
                            isSearchFocused ? "opacity-100" : "opacity-0"
                        )} />
                        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 transition-all duration-300 focus-within:shadow-md focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 overflow-hidden flex items-center">
                            <div className="pl-5 text-gray-400">
                                <Search className="h-5 w-5" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search canteens, dishes, or locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                className="w-full h-14 pl-3 pr-4 text-base font-medium outline-none bg-transparent placeholder:text-gray-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="pr-5 text-gray-400 hover:text-gray-600 transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters Container */}
                    <div className="flex flex-col gap-4 max-w-full">
                        {/* Main Categories */}
                        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
                            {CATEGORIES.map((cat, i) => (
                                <motion.button
                                    key={cat}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border active:scale-95",
                                        selectedCategory === cat
                                            ? "bg-gray-900 text-white border-gray-900 shadow-md shadow-gray-900/10"
                                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                    )}
                                >
                                    {cat}
                                </motion.button>
                            ))}
                        </div>

                        {/* Sub Filters */}
                        <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0"
                        >
                            <button
                                onClick={() => setFilterType(filterType === "VEG" ? "ALL" : "VEG")}
                                className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 active:scale-95", 
                                    filterType === "VEG" 
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50")}
                            >
                                <div className={cn("w-2.5 h-2.5 rounded-full transition-colors", filterType === "VEG" ? "bg-emerald-500" : "bg-emerald-200")} />
                                Pure Veg
                            </button>
                            <button
                                onClick={() => setFilterType(filterType === "RATING" ? "ALL" : "RATING")}
                                className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 active:scale-95", 
                                    filterType === "RATING" 
                                    ? "bg-amber-50 border-amber-200 text-amber-700" 
                                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50")}
                            >
                                <Star className={cn("h-4 w-4 transition-colors", filterType === "RATING" ? "fill-current" : "text-amber-400")} />
                                Top Rated
                            </button>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* Content Grid */}
            <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6">
                <AnimatePresence mode="popLayout">
                    {filteredShops.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-32 text-center"
                        >
                            <div className="bg-white p-6 rounded-3xl mb-6 shadow-xl shadow-gray-100 border border-gray-100">
                                <Search className="h-10 w-10 text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No shops found</h3>
                            <p className="text-base text-gray-500 max-w-md leading-relaxed mb-8">
                                We couldn't find any canteens matching your current filters. Try searching for something else or adjusting your criteria.
                            </p>
                            <button
                                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setFilterType("ALL") }}
                                className="px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-bold shadow-lg shadow-gray-900/20 hover:bg-black hover:shadow-xl hover:shadow-gray-900/20 transition-all active:scale-95"
                            >
                                Clear all filters
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            variants={container}
                            initial="hidden"
                            animate="show"
                            className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        >
                            {filteredShops.map((shop) => {
                                // 1. Use a standard image fallback
                                const baseImage = shop.logo || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80";
                                
                                // 2. Real-time cache buster so updated images show immediately
                                const cacheBuster = shop.updatedAt 
                                    ? new Date(shop.updatedAt).getTime() 
                                    : "latest"; 
                                    
                                const image = baseImage.includes('?') 
                                    ? `${baseImage}&v=${cacheBuster}` 
                                    : `${baseImage}?v=${cacheBuster}`;

                                const isOffline = !shop.isOnline;
                                
                                return (
                                    <motion.div 
                                        key={shop.id} 
                                        variants={itemVariant} 
                                        layout
                                        className={cn(
                                            "relative transition-all duration-300 h-full",
                                            isOffline && "opacity-70 grayscale-[0.25] hover:opacity-100 hover:grayscale-0"
                                        )}
                                    >
                                        <ShopCard
                                            id={shop.id}
                                            name={shop.name}
                                            description={`${shop.location || "Main Block"} • ${(shop.tags || shop.cuisineType || []).join(", ")}`}
                                            rating={shop.rating || 0}
                                            image={image}
                                            imageColor="bg-gray-100"
                                            promoted={shop.rating > 4.5}
                                            discount={isOffline ? "OFFLINE" : null}
                                        />
                                        
                                        {/* Overlay for Offline clarity */}
                                        {isOffline && (
                                            <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                                                Currently Offline
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