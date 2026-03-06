import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders",
  description:
    "Track and manage your orders on ClickIn. View order status, delivery details, and order history.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
