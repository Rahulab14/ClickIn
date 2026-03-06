import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help & Support",
  description:
    "Get help and support for your ClickIn orders. Find answers to common questions and contact customer support.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
