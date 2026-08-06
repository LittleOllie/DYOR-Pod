import type { MetadataRoute } from "next";
import { getCanonicalUrl } from "@/lib/seo/canonical";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/contact", "/legal", "/mission"] as const;

  return pages.map((path) => ({
    url: getCanonicalUrl(path),
    lastModified: new Date("2026-08-06"),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
