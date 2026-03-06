import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Providers } from "./providers";
import { RoleGuard } from "./RoleGuard";

export const metadata: Metadata = {
  title: {
    default: "ClickIn - Self Billing Platform",
    template: "%s | ClickIn",
  },
  description:
    "ClickIn is the premier self-billing platform for quick service restaurants and food delivery. Browse local shops, order food, track deliveries, and manage your dining experience with ease.",
  keywords: [
    "self-billing",
    "food delivery",
    "restaurants",
    "orders",
    "quick service",
    "food ordering platform",
  ],
  authors: [{ name: "ClickIn" }],
  creator: "ClickIn",
  publisher: "ClickIn",
  formatDetection: {
    email: false,
    telephone: false,
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clickin.app",
    title: "ClickIn - Self Billing Platform",
    description:
      "The premier self-billing platform for quick service restaurants and food delivery",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "ClickIn Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClickIn - Self Billing Platform",
    description: "Order food and manage billing with ClickIn",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ClickIn",
    description:
      "ClickIn is the premier self-billing platform for quick service restaurants and food delivery",
    url: "https://clickin.app",
    applicationCategory: "FoodDelivery",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      ratingCount: "250",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <RoleGuard>{children}</RoleGuard>
        </Providers>
      </body>
    </html>
  );
}
