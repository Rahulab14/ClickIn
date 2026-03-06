"use client"

import { cn } from "@/lib/utils"
import { motion, Variants } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

const container: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
}

const item: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

export function CategoryGrid() {
    // Mock Categories with Emojis
    const categories = [
        { id: "1", name: "South Indian", image: "🥘", color: "from-orange-50 to-orange-100 border-orange-200" },
        { id: "2", name: "Biryani", image: "/briyani.png", color: "from-red-50 to-red-100 border-red-200" },

        { id: "3", name: "Juices", image: "🥤", color: "from-green-50 to-green-100 border-green-200" },
        { id: "4", name: "Snacks", image: "🥪", color: "from-yellow-50 to-yellow-100 border-yellow-200" },
        { id: "5", name: "Desserts", image: "🍦", color: "from-pink-50 to-pink-100 border-pink-200" },
        { id: "6", name: "Chinese", image: "🍜", color: "from-slate-50 to-slate-100 border-slate-200" },
        { id: "7", name: "Coffee", image: "☕", color: "from-amber-50 to-amber-100 border-amber-200" },
        { id: "8", name: "North Indian", image: "🍛", color: "from-rose-50 to-rose-100 border-rose-200" },
    ]

    return (
        <div className="py-3 px-4 md:px-0">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg md:text-2xl font-bold text-foreground">What's on your mind?</h3>
                <Link href="/categories" className="text-sm font-bold text-emerald-600 hover:underline">
                    See All
                </Link>
            </div>

            <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-4 md:grid-cols-8 gap-y-8 gap-x-4 md:gap-8 justify-items-center"
            >
                {categories.map((cat) => (
                    <motion.div
                        key={cat.id}
                        variants={item}
                        className="flex flex-col items-center gap-3 group cursor-pointer w-full"
                    >
                        <Link href={`/categories/${encodeURIComponent(cat.name)}`} className="flex flex-col items-center gap-3 w-full">
                            <div className={cn(
                                "relative w-[72px] h-[72px] md:w-28 md:h-28 lg:w-32 lg:h-32 aspect-square flex items-center justify-center shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 bg-gradient-to-br border rounded-[1.5rem] md:rounded-[2rem] group-active:scale-95",
                                cat.color
                            )}>
                                {cat.image.startsWith("/") ? (
                                    <Image src={cat.image} alt={cat.name} width={80} height={80} className="w-10 h-10 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain drop-shadow-sm select-none transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
                                ) : (
                                    <span className="text-4xl md:text-5xl lg:text-6xl drop-shadow-sm select-none transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 filter grayscale-[0.2] group-hover:grayscale-0">
                                        {cat.image}
                                    </span>
                                )}
                            </div>
                            <span className="text-[11px] md:text-sm font-bold text-gray-600 group-hover:text-gray-900 text-center leading-tight whitespace-nowrap transition-colors">
                                {cat.name}
                            </span>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}
