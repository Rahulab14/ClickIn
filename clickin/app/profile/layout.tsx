import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description:
    "Manage your ClickIn profile settings, payment methods, delivery addresses, and account preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
