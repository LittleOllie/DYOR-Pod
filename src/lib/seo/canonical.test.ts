import { describe, expect, it } from "vitest";
import { getCanonicalUrl, createPageMetadata } from "@/lib/seo/canonical";

describe("canonical URLs", () => {
  it("uses NEXT_PUBLIC_SITE_URL as the production base", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.dyorpod.com";
    expect(getCanonicalUrl("/")).toBe("https://www.dyorpod.com");
    expect(getCanonicalUrl("/contact")).toBe("https://www.dyorpod.com/contact");
    expect(getCanonicalUrl("/legal")).toBe("https://www.dyorpod.com/legal");
    expect(getCanonicalUrl("/mission")).toBe("https://www.dyorpod.com/mission");
  });

  it("creates per-page metadata with matching canonical and openGraph url", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.dyorpod.com";
    const metadata = createPageMetadata({
      path: "/contact",
      title: "Contact | DYOR",
      description: "Contact DYOR.",
    });

    expect(metadata.alternates?.canonical).toBe("https://www.dyorpod.com/contact");
    expect(metadata.openGraph?.url).toBe("https://www.dyorpod.com/contact");
  });
});
