"use client"

import { Star, MapPin, Clock, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useState, useEffect } from "react"
import { subscribeToAllShops } from "@/lib/vendor-service"
import { useFavorites } from "@/context/customer/FavoritesContext"
import { VendorShop } from "@/lib/types/vendor"

interface ShopListingProps {
    shops?: VendorShop[]
}

export function ShopListing({ shops: initialShops = [] }: ShopListingProps) {
    const { isShopLiked, toggleShopLike } = useFavorites();
    const [shops, setShops] = useState<VendorShop[]>(initialShops);

    // Subscribe to real-time updates
    useEffect(() => {
        const unsubscribe = subscribeToAllShops((updatedShops) => {
            setShops(updatedShops);
        });
        return () => unsubscribe();
    }, []);

    const displayShops = shops;

    return (
        <div className="py-4 px-4 md:px-0">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg md:text-2xl font-bold text-foreground">Recently Searched</h3>
                <Link href="/shop" className="text-sm font-bold text-emerald-600 hover:underline">
                    See All
                </Link>
            </div>

            <div className="flex flex-col gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-8">
                {displayShops.map((item: any) => {
                    // Normalize data between real Firestore VendorShop and Mock Shop
                    const shop = {
                        id: item.id,
                        name: item.name,
                        location: item.location || "Main Block",
                        image: item.image || item.logo || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
                        rating: item.rating || 0,
                        tags: item.tags || item.cuisineType || ["Food"],
                        isOnline: item.isOnline !== undefined ? item.isOnline : true, // Default to true for mock data
                    };

                    const liked = isShopLiked(shop.id);
                    return (
                        <Link href={`/shop/${shop.id}`} key={shop.id} className={cn("group block", !shop.isOnline && "opacity-75 cursor-not-allowed")}>
                            <div className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group-hover:border-primary/20">
                                {/* Image / Banner Area */}
                                <div className={cn("relative h-48 rounded-2xl overflow-hidden mb-3 bg-gray-50")}>
                                    <img
                                        src={shop.image}
                                        alt={shop.name}
                                        className={cn("w-full h-full object-cover transition-transform duration-500 group-hover:scale-105", !shop.isOnline && "grayscale")}
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

                                    {/* Offline Badge */}
                                    {!shop.isOnline && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 text-white font-black text-xl tracking-tighter italic">
                                            OFFLINE
                                        </div>
                                    )}

                                    {/* Rating Badge */}
                                    <div className="absolute top-3 right-14 bg-white/95 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm flex items-center gap-1 z-20">
                                        <span className="text-xs font-bold text-gray-900">{shop.rating}</span>
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    </div>

                                    {/* Like Button */}
                                    <button
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleShopLike(shop.id); }}
                                        className={cn(
                                            "absolute top-3 right-3 p-1.5 rounded-full transition-all backdrop-blur-sm active:scale-90 z-20",
                                            liked ? "bg-red-500/80 text-white" : "bg-white/80 text-gray-500 hover:text-red-500"
                                        )}
                                    >
                                        <Heart className={cn("h-4 w-4 transition-all", liked && "fill-current")} />
                                    </button>

                                    {/* Promoted Badge */}
                                    {shop.isOnline && (shop.tags.includes("Meals") || shop.rating > 4.4) && (
                                        <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wide z-20">
                                            Best Seller
                                        </div>
                                    )}

                                    <div className="absolute bottom-3 left-3 right-3 text-white z-20">
                                        <div className="flex items-center gap-3 text-[10px] font-medium opacity-90">
                                            {/* Clock/delivery time removed */}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors line-clamp-1">{shop.name}</h4>
                                    </div>
                                    <div className="flex items-center gap-1 text-gray-500 text-xs font-medium mb-3">
                                        <MapPin className="h-3 w-3" />
                                        <span className="truncate max-w-[150px]">{shop.location}</span>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {shop.tags.slice(0, 3).map((tag: string, i: number) => (
                                            <span key={i} className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md group-hover:bg-primary/5 group-hover:text-primary/70 transition-colors">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    )
}

