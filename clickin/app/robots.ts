import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/vendor/", "/admin/", "/staff/"], // Prevent crawling internal/dashboard routes
    },
    sitemap: "https://clickin.co.in/sitemap.xml",
  };
}
