import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Staff Login",
  description:
    "Sign in to your ClickIn staff account to manage orders, process payments, and view daily reports.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StaffLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
