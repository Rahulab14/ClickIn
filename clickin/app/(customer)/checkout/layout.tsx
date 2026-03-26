import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Complete your order securely on Clickin. Finalize delivery, manage payment, and use our smart canteen ordering system.",
  openGraph: {
    title: "Checkout | Clickin",
    description: "Complete your canteen order securely on Clickin.",
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
