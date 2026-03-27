import { Home2Header } from "@/components/home2/header";
import { HeroBanner } from "@/components/home2/hero-banner";
import { CategoryGrid } from "@/components/home2/category-grid";
import { ShopListing } from "@/components/home2/shop-listing";
import { Home2BottomNav } from "@/components/home2/bottom-nav";
import { getAllShops } from "@/lib/vendor-service";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clickin - Smart Canteen Ordering Platform",
  description:
    "Clickin is a smart QR-based food ordering system for college canteens. Scan, order, pay and pickup without waiting.",
  openGraph: {
    title: "Clickin - Smart Canteen Ordering Platform",
    description:
      "Discover and order from your favorite local restaurants with Clickin",
    type: "website",
  },
};








export default async function Home2Page() {
  const shops = await getAllShops();

  return (
    <div className="min-h-screen bg-background font-sans relative pb-20 md:pb-10">
      <Home2Header />
      <main className="container max-w-7xl mx-auto md:space-y-8">
        <h1 className="sr-only">Clickin - Smart Canteen Ordering Platform</h1>
        <HeroBanner />
        <CategoryGrid />
        <ShopListing shops={shops} />
        
      </main>
      <Home2BottomNav />
    </div>
  );
}
