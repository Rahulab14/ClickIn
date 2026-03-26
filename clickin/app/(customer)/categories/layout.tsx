import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food Categories",
  description: "Browse various food categories on Clickin - Smart Canteen Ordering Platform.",
  openGraph: {
    title: "Food Categories | Clickin",
    description: "Browse various food categories on Clickin - Smart Canteen Ordering Platform.",
  }
};

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
