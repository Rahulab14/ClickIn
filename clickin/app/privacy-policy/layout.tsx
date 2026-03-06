import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how ClickIn collects, uses, and protects your personal information. Read our complete privacy policy.",
  openGraph: {
    title: "Privacy Policy | ClickIn",
    description: "Learn about ClickIn's privacy practices and data protection",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
