"use client"

import { ArrowLeft, Star, Heart, SlidersHorizontal, ArrowUpDown, Tag, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { VendorShop } from "@/lib/types/vendor"
import { subscribeToAllShops } from "@/lib/vendor-service"
import { SHOPS } from "@/lib/mock-data"

interface CategoryDetailClientProps {
    slug: string;
}

export function CategoryDetailClient({ slug }: CategoryDetailClientProps) {
    const router = useRouter()
    const [favorites, setFavorites] = useState<Set<string>>(new Set())
    const [activeFilter, setActiveFilter] = useState<string | null>(null)
    const [shops, setShops] = useState<VendorShop[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const lowerSlug = slug.toLowerCase()
        const unsubscribe = subscribeToAllShops((allShops) => {
            let matchingShops = allShops.filter(shop => {
                const tagMatch = (shop.tags || []).some(t => t.toLowerCase().includes(lowerSlug) || lowerSlug.includes(t.toLowerCase()))
                const cuisineMatch = (shop.cuisineType ? (typeof shop.cuisineType === 'string' ? [shop.cuisineType] : shop.cuisineType) : []).some(c => c.toLowerCase().includes(lowerSlug) || lowerSlug.includes(c.toLowerCase()))
                return tagMatch || cuisineMatch
            })

            // Fallback to mock data if no real shops match
            if (matchingShops.length === 0) {
                const mockMatches = SHOPS.filter(shop =>
                    shop.tags.some(t => t.toLowerCase().includes(lowerSlug) || lowerSlug.includes(t.toLowerCase())) ||
                    shop.menu.some(item => item.category.toLowerCase().includes(lowerSlug) || lowerSlug.includes(item.category.toLowerCase()))
                ) as any[]
                matchingShops = mockMatches
            }

            setShops(matchingShops)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [slug])

    const filters = ["Filter", "Sort", "Promo", "Self Pick-Up"]

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 pb-20">
            <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full">
                {/* Header */}
                <div className="flex items-center gap-4 p-4 sticky top-0 bg-white/95 backdrop-blur-sm z-30 border-b border-gray-50">
                    <button
                        onClick={() => router.back()}
                        className="p-1.5 -ml-1 hover:bg-gray-100 rounded-full transition-colors active:scale-95"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight">{slug}</h1>
                </div>

                {/* Filter Chips */}
                <div className="flex gap-2.5 px-4 py-3 overflow-x-auto scrollbar-hide">
                    {filters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(activeFilter === filter ? null : filter)}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border whitespace-nowrap transition-all active:scale-95",
                                activeFilter === filter
                                    ? "bg-emerald-500 text-white border-emerald-500"
                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                            )}
                        >
                            {filter === "Filter" && <SlidersHorizontal className="w-3.5 h-3.5" />}
                            {filter === "Sort" && <ArrowUpDown className="w-3.5 h-3.5" />}
                            {filter === "Promo" && <Tag className="w-3.5 h-3.5" />}
                            {filter === "Self Pick-Up" && <MapPin className="w-3.5 h-3.5" />}
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Shop Listings */}
                <div className="px-4 pb-24 space-y-4 mt-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Scanning Shops</p>
                        </div>
                    ) : shops.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <span className="text-4xl">🔍</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-1">No shops found</h3>
                            <p className="text-sm text-gray-500 max-w-xs">
                                No shops currently offer items in the &quot;{slug}&quot; category.
                            </p>
                        </div>
                    ) : (
                        shops.map((shop) => {
                            const image = shop.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"

                            // Deterministic stats
                            const getSeed = (id: string) => {
                                let seed = 0
                                for (let i = 0; i < id.length; i++) {
                                    seed = (seed << 5) - seed + id.charCodeAt(i)
                                    seed |= 0
                                }
                                return Math.abs(seed)
                            }
                            const seed = getSeed(shop.id)
                            const reviewCount = Math.floor((seed % 400) + (seed % 200))
                            const distance = ((seed % 20) / 10 + 0.3).toFixed(1)

                            return (
                                <div
                                    key={shop.id}
                                    onClick={() => router.push(`/shop/${shop.id}`)}
                                    role="button"
                                    tabIndex={0}
                                    className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 items-start text-left hover:shadow-md transition-all duration-200 active:scale-[0.98] group relative cursor-pointer"
                                >
                                    {/* Promo badge */}
                                    {(shop.rating >= 4.5 || !shop.isOnline) && (
                                        <div className={cn(
                                            "absolute top-6 left-6 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md z-10 tracking-wide shadow-sm",
                                            shop.isOnline ? "bg-emerald-500" : "bg-gray-500"
                                        )}>
                                            {shop.isOnline ? "PROMO" : "OFFLINE"}
                                        </div>
                                    )}

                                    {/* Image */}
                                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                        <Image
                                            src={image}
                                            alt={shop.name}
                                            fill
                                            className={cn("object-cover group-hover:scale-105 transition-transform duration-300", !shop.isOnline && "grayscale")}
                                            sizes="(max-width: 768px) 96px, 112px"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0 py-0.5">
                                        <h3 className="font-bold text-[16px] text-gray-900 leading-tight mb-1.5 truncate">
                                            {shop.name}
                                        </h3>

                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                                            <span>{distance} km</span>
                                            <span className="text-gray-300">|</span>
                                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                            <span className="font-semibold text-gray-700">{shop.rating || 0}</span>
                                            <span className="text-gray-400">({reviewCount})</span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <span className="text-emerald-600 text-xs font-bold">₹₹</span>
                                            <span className="text-sm font-bold text-gray-900">Starting ₹40</span>
                                        </div>
                                    </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setFavorites((prev) => {
                                                    const next = new Set(prev)
                                                    if (next.has(shop.id)) next.delete(shop.id)
                                                    else next.add(shop.id)
                                                    return next
                                                })
                                            }}
                                            className="mt-2 p-1 rounded-full hover:bg-gray-50 transition-colors"
                                        >
                                            <Heart
                                                className={cn(
                                                    "w-5 h-5 transition-colors",
                                                    favorites.has(shop.id)
                                                        ? "fill-rose-500 text-rose-500"
                                                        : "text-gray-300 hover:text-rose-300"
                                                )}
                                            />
                                        </button>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}
