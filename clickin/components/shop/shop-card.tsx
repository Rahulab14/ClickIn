"use client"

import { Star, Bike, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useFavorites } from "@/context/customer/FavoritesContext"

interface ShopCardProps {
    id: string
    name: string
    description: string // Maps to cuisine/location
    rating: number
    priceRange?: string
    image: string
    imageColor: string
    promoted?: boolean
    discount?: string | null
}

export function ShopCard({
    id,
    name,
    description,
    rating,
    priceRange = "1.2 km",
    image,
    imageColor,
    promoted = false,
    discount = null
}: ShopCardProps) {
    const { isShopLiked, toggleShopLike } = useFavorites();
    const liked = isShopLiked(id);

    return (
        <Link href={`/shop/${id}`} className="group cursor-pointer block">
            {/* Image / Banner Area */}
            <div className={cn("relative h-64 md:h-56 lg:h-48 xl:h-56 rounded-[2rem] overflow-hidden shadow-sm mb-4 bg-gray-100 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1", imageColor)}>
                {/* Real Image Content */}
                <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105">
                    <img 
                        src={image} 
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Fallback if image fails to load
                            e.currentTarget.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800";
                        }}
                    />
                </div>

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                {/* Promoted Badge */}
                {promoted && (
                    <span className="absolute top-4 left-4 bg-white/95 text-[10px] font-bold px-2.5 py-1 rounded-md text-black uppercase tracking-wide backdrop-blur-sm shadow-sm">
                        Promoted
                    </span>
                )}

                {/* Like / Favorite Button */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleShopLike(id); }}
                    className={cn(
                        "absolute top-4 right-4 p-2 rounded-full transition-all backdrop-blur-sm active:scale-90",
                        liked ? "bg-red-500/80 text-white" : "bg-white/20 hover:bg-white/40 text-white"
                    )}
                >
                    <Heart className={cn("h-5 w-5 transition-all", liked && "fill-current")} />
                </button>

                {/* Discount Badge */}
                {discount && (
                    <div className="absolute bottom-4 left-4 bg-blue-600/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1 shadow-sm">
                        <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 stroke-current stroke-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                        {discount}
                    </div>
                )}

                {/* Disclaimer/Distance badge placeholder removed */}
            </div>

            {/* Content */}
            <div className="flex justify-between items-start px-1">
                <div className="space-y-1">
                    <h4 className="text-xl font-bold group-hover:text-red-500 transition-colors leading-tight text-gray-900">
                        {name}
                    </h4>
                    <p className="text-sm text-gray-500 font-medium truncate w-[200px]">
                        {description}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 bg-green-700 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                        <span>{rating}</span>
                        <Star className="h-3 w-3 fill-current" />
                    </div>
                    <span className="text-xs font-bold text-gray-400">{priceRange}</span>
                </div>
            </div>
        </Link>
    )
}
