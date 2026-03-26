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
  metadataBase: new URL("https://clickin.co.in"),
  title: {
    default: "Clickin - Smart Canteen Ordering Platform",
    template: "%s | Clickin",
  },
  description:
    "Clickin is a smart QR-based food ordering system for college canteens. Scan, order, pay and pickup without waiting.",
  keywords: [
    "clickin",
    "clickin app",
    "clickin canteen",
    "smart canteen ordering",
    "qr food ordering system",
    "self-billing",
    "food delivery",
    "restaurants",
  ],
  authors: [{ name: "Clickin" }],
  creator: "Clickin",
  publisher: "Clickin",
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
    locale: "en_IN",
    url: "https://clickin.co.in",
    siteName: "Clickin",
    title: "Clickin - Smart Canteen Ordering Platform",
    description: "Smart QR-based food ordering system for college canteens. Order, pay and pickup without waiting.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Clickin Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Clickin - Smart Canteen Ordering Platform",
    description: "Order food and manage billing with the Clickin smart canteen ordering system.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schemaData = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Clickin",
      description:
        "Clickin is the premier self-billing platform for quick service restaurants and food delivery",
      url: "https://clickin.co.in",
      applicationCategory: "FoodDelivery",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "350",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Clickin",
      url: "https://clickin.co.in/",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://clickin.co.in/shop?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "SiteNavigationElement",
          position: 1,
          name: "Explore Categories",
          url: "https://clickin.co.in/categories"
        },
        {
          "@type": "SiteNavigationElement",
          position: 2,
          name: "All Shops",
          url: "https://clickin.co.in/shop"
        },
        {
          "@type": "SiteNavigationElement",
          position: 3,
          name: "My Orders",
          url: "https://clickin.co.in/orders"
        },
        {
          "@type": "SiteNavigationElement",
          position: 4,
          name: "Help & Support",
          url: "https://clickin.co.in/help"
        }
      ]
    }
  ];

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
