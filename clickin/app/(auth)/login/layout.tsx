import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Login",
  description:
    "Sign in to your ClickIn account to manage orders, view favorites, and access your profile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
