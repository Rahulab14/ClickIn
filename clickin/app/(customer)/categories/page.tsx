"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { subscribeToGlobalMenuItems } from "@/lib/vendor-service";
import { VendorMenuItem } from "@/lib/types/vendor";

const CATEGORY_ICONS: Record<string, string> = {
  "hamburger": "🍔", "burger": "🍔",
  "pizza": "🍕",
  "noodles": "🍜", "chinese": "🍜",
  "chicken": "🍗", "non-veg": "🍗",
  "vegetable": "🥬", "veg": "🥬",
  "dessert": "🍰", "sweets": "🍰",
  "drink": "🍺", "beverage": "🍺", "beverages": "🧃",
  "bread": "🍞", "roti": "🍞",
  "paneer": "⬜",
  "pancakes": "🥞",
  "cheese": "🧀",
  "french fries": "🍟", "fries": "🍟",
  "sandwich": "🥪",
  "gobi": "🍄",
  "masala tea": "🍲", "tea": "☕", "coffee": "☕",
  "salad": "🥗",
  "full meals": "🍱", "meals": "🍱", "thali": "🍱",
  "cooked rice": "🍚", "rice": "🍚", "biryani": "🍗",
  "dosa": "🍝", "south indian": "🍝",
  "cup cake": "🍣", "cake": "🍣",
  "ice cream": "🍨",
  "cookies": "🍪", "snacks": "🍪",
  "others": "🥮"
};

const getCategoryIcon = (name: string) => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "🍱"; // Default icon
};

export default function CategoriesPage() {
  const router = useRouter();
  const [items, setItems] = useState<VendorMenuItem[]>([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToGlobalMenuItems((newItems) => {
      setItems(newItems);
      setIsLive(true);
    });
    return () => unsubscribe();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(items.map(item => item.category)));
    return uniqueCategories.map(name => {
      // Truncate logic if needed (matching original UI style like "Cooked Ri..")
      let displayName = name;
      if (displayName.length > 10) {
        displayName = displayName.substring(0, 8) + "..";
      }
      
      return {
        name,
        displayName,
        icon: getCategoryIcon(name)
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans selection:bg-indigo-100">
      <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800 dark:text-gray-200" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
            More Category
            {isLive && (
              <div className="flex items-center gap-1.5 ml-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-600 tracking-widest uppercase">Live</span>
              </div>
            )}
          </h1>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-8 gap-x-4 px-4 pt-4 pb-20">
          {categories.map((cat, index) => (
            <Link
              key={index}
              href={`/categories/${encodeURIComponent(cat.name)}`}
              className="flex flex-col items-center gap-3 cursor-pointer group"
            >
              {/* Icon Container */}
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-[2.5rem] md:text-[3rem] transition-all duration-300 group-hover:scale-110 drop-shadow-sm filter bg-gray-50 dark:bg-gray-950 rounded-2xl group-hover:bg-indigo-50 border border-transparent group-hover:border-indigo-100">
                {cat.icon}
              </div>
              {/* Label */}
              <span className="text-[12px] md:text-[13px] font-bold text-gray-800 dark:text-gray-200 text-center leading-tight truncate px-1 w-full group-hover:text-indigo-600 transition-colors">
                {cat.displayName}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
