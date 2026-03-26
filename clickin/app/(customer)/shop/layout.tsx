import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Shops",
  description: "Discover all available vendors and canteens on Clickin - Smart Canteen Ordering Platform.",
  openGraph: {
    title: "All Shops | Clickin",
    description: "Discover all available vendors and canteens on Clickin.",
  }
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
