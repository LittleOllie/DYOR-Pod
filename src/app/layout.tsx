import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { LogoIntroGate } from "@/components/brand/LogoIntroSplash";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { podcast } from "@/content/podcast";
import { site } from "@/content/site";
import { getHeaderState } from "@/lib/schedule/getHeaderState";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const title = "DYOR Podcast | Live Crypto Spaces, News & Opinion";
const description =
  "Join DYOR for weekly live crypto conversations on X, market analysis, interviews and the DYOR Podcast on Spotify and Apple Podcasts.";

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title,
  description,
  alternates: { canonical: site.domain },
  openGraph: {
    title,
    description,
    url: site.domain,
    siteName: "DYOR",
    locale: "en_US",
    type: "website",
    images: [{ url: "/og/dyor-social-preview.jpg", width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og/dyor-social-preview.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#061821",
};

function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "DYOR",
        url: site.domain,
        description,
      },
      {
        "@type": "Organization",
        name: "DYOR",
        url: site.domain,
        sameAs: [site.social.x, site.social.spotify, site.social.applePodcasts].filter(
          Boolean,
        ),
      },
      {
        "@type": "PodcastSeries",
        name: "The DYOR Podcast",
        url: podcast.spotifyShowUrl,
        webFeed: podcast.spotifyShowUrl,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLive, ctaHref, featuredShow } = getHeaderState();

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} min-h-full`}>
      <head>
        <JsonLd />
      </head>
      <body className="bg-atmosphere min-h-full antialiased">
        <LogoIntroGate />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteHeader
          isLive={isLive}
          ctaHref={ctaHref}
          nextEventLabel={featuredShow.name}
        />
        <main id="main-content" className="relative flex-1 pb-24 md:pb-0">
          {children}
        </main>
        <MobileActionBar isLive={isLive} ctaHref={ctaHref} />
        <SiteFooter />
      </body>
    </html>
  );
}
