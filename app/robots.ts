import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // El panel no aporta nada a un buscador y no debe aparecer en resultados.
      disallow: "/admin",
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
