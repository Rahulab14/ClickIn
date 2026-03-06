import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Login",
  description:
    "Sign in to your ClickIn vendor dashboard to manage your restaurant or shop, view orders, and track sales.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function VendorLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
