"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

// Note: Metadata is only supported in server components, but this is a client component
// For SEO on this page, consider converting to a server component or using generateMetadata

export default function CategoriesPage() {
  const router = useRouter();

  const categories = [
    { name: "Hamburger", icon: "🍔" },
    { name: "Pizza", icon: "🍕" },
    { name: "Noodles", icon: "🍜" },
    { name: "Meat", icon: "🍖" },
    { name: "Vegetable", icon: "🥬" },
    { name: "Dessert", icon: "🍰" },
    { name: "Drink", icon: "🍺" },
    { name: "Bread", icon: "🍞" },
    { name: "Croissant", icon: "🥐" },
    { name: "Pancakes", icon: "🥞" },
    { name: "Cheese", icon: "🧀" },
    { name: "French Fr..", icon: "🍟" }, // Explicitly truncated as per request
    { name: "Sandwich", icon: "🥪" },
    { name: "Taco", icon: "🌮" },
    { name: "Pot of Fo..", icon: "🍲" }, // Explicitly truncated
    { name: "Salad", icon: "🥗" },
    { name: "Bento", icon: "🍱" },
    { name: "Cooked Ri..", icon: "🍚" }, // Explicitly truncated
    { name: "Spaghetti", icon: "🍝" },
    { name: "Sushi", icon: "🍣" },
    { name: "Ice Crea..", icon: "🍨" }, // Explicitly truncated
    { name: "Cookies", icon: "🍪" },
    { name: "Beverag..", icon: "🧃" }, // Explicitly truncated
    { name: "Others", icon: "🥮" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100">
      <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 sticky top-0 bg-white z-10">
          <button
            onClick={() => router.back()}
            className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            More Category
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
              <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-[2.5rem] md:text-[3rem] transition-all duration-300 group-hover:scale-110 drop-shadow-sm filter bg-gray-50 rounded-2xl group-hover:bg-indigo-50 border border-transparent group-hover:border-indigo-100">
                {cat.icon}
              </div>
              {/* Label */}
              <span className="text-[12px] md:text-[13px] font-bold text-gray-800 text-center leading-tight truncate px-1 w-full group-hover:text-indigo-600 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
