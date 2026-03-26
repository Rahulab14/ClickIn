import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders",
  description:
    "Track and manage your fast-food and canteen orders on Clickin. View live status, purchase history, and pick-up details.",
  openGraph: {
    title: "My Orders | Clickin",
    description: "Track and manage your orders on Clickin.",
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
