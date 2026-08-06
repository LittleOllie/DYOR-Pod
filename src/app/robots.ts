import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/lib/seo/canonical";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${getCanonicalUrl("")}/sitemap.xml`,
  };
}
