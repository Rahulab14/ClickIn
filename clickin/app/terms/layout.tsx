import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read ClickIn's terms of service and conditions of use. Understand your rights and responsibilities as a user.",
  openGraph: {
    title: "Terms of Service | ClickIn",
    description: "ClickIn's terms of service and user agreement",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
