import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Signup",
  description:
    "Register your restaurant or shop on ClickIn. Start reaching customers and managing your orders through our platform.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function VendorSignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
