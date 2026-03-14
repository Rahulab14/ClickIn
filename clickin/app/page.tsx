import { Home2Header } from "@/components/home2/header";
import { HeroBanner } from "@/components/home2/hero-banner";
import { CategoryGrid } from "@/components/home2/category-grid";
import { ShopListing } from "@/components/home2/shop-listing";
import { Home2BottomNav } from "@/components/home2/bottom-nav";
import { getAllShops } from "@/lib/vendor-service";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClickIn - Self Billing Platform",
  description:
    "Explore local restaurants and shops on ClickIn. Browse menus, place orders, and enjoy quick delivery of your favorite meals.",
  openGraph: {
    title: "Browse Restaurants and Order Food | ClickIn",
    description:
      "Discover and order from your favorite local restaurants with ClickIn",
    type: "website",
  },
};








export default async function Home2Page() {
  const shops = await getAllShops();

  return (
    <div className="min-h-screen bg-background font-sans relative pb-20 md:pb-10">
      <Home2Header />
      <main className="container max-w-7xl mx-auto md:space-y-8">
        <HeroBanner />
        <CategoryGrid />
        <ShopListing shops={shops} />
        <div className="flex justify-center py-8">
          <Link
            href="/vendor-login"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Vendor Dashboard
          </Link>
        </div>
        <div className="flex justify-center py-8">
          <Link
            href="/staff-login"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Staff Login
          </Link>
        </div>
        <div className="flex justify-center py-8">
          <Link
            href="/admin-login"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Admin Dashboard
          </Link>
        </div>
      </main>
      <Home2BottomNav />
    </div>
  );
}
