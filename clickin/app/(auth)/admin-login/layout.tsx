import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login",
  description:
    "Sign in to the ClickIn admin dashboard to manage vendors, staff, users, and platform settings.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
