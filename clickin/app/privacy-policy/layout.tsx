import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read the Privacy Policy for Clickin - Smart Canteen Ordering Platform.",
  openGraph: {
    title: "Privacy Policy | Clickin",
    description: "Privacy Policy for Clickin.",
  }
};

export default function PrivacyPolicyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
