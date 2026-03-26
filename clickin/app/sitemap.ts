import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://clickin.co.in";

  // Here, you would typically fetch dynamic routes like /shop/[id] from your database
  // For the MVP, we statically define the core customer routes to ensure immediate indexing.
  const staticRoutes = [
    "",
    "/categories",
    "/shop",
    "/privacy-policy",
    "/help",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  return staticRoutes;
}
