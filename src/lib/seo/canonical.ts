import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site/url";

export function getCanonicalUrl(path: string): string {
  const base = getSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath === "/") {
    return base;
  }
  return `${base}${normalizedPath}`;
}

type PageMetadataOptions = {
  path: string;
  title: string;
  description: string;
  openGraph?: Metadata["openGraph"];
  robots?: Metadata["robots"];
};

export function createPageMetadata(options: PageMetadataOptions): Metadata {
  const canonical = getCanonicalUrl(options.path);

  return {
    title: options.title,
    description: options.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: options.title,
      description: options.description,
      url: canonical,
      ...(options.openGraph ?? {}),
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
    },
    robots: options.robots,
  };
}
