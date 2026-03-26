import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Support",
  description:
    "Get instant help and support for your Clickin orders. Find answers and contact our smart canteen ordering platform customer support.",
  openGraph: {
    title: "Help & Support | Clickin",
    description: "Get instant help and support for your Clickin orders.",
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
