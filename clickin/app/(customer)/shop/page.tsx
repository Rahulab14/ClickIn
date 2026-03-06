import { getAllShops } from "@/lib/vendor-service";
import { ShopListClient } from "@/components/customer/shop-list-client";
import { SHOPS } from "@/lib/mock-data";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Restaurants & Shops",
  description:
    "Browse all available restaurants and shops on ClickIn. Find the best deals, view menus, and place your order today.",
  openGraph: {
    title: "All Restaurants & Shops | ClickIn",
    description: "Explore all available restaurants and shops near you",
    type: "website",
  },
};

export default async function ShopsPage() {
  // SSR initial data
  const firestoreShops = await getAllShops();

  // If no shops in firestore yet (first run/demo), we can still show layout or fallback
  // But typically we want real data.

  return <ShopListClient initialShops={firestoreShops} />;
}
