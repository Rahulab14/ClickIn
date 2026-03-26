import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Cart",
  description:
    "Review your shopping cart items before checkout. Safely view items, update your food portions, and confirm your order on Clickin - Smart Canteen Ordering Platform.",
  openGraph: {
    title: "Your Cart | Clickin",
    description: "Review your cart items securely before placing your order on Clickin.",
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
