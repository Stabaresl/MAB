import type { MetadataRoute } from "next";

import { getAllProducts, getCategories } from "@/lib/catalog";
import { siteUrl } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [categories, products] = await Promise.all([getCategories(), getAllProducts()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/catalogo`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/nosotros`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contacto`, changeFrequency: "monthly", priority: 0.7 },
  ];

  return [
    ...staticRoutes,
    ...categories.map((category) => ({
      url: `${base}/catalogo/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${base}/producto/${product.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
