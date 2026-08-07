import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { LogoIntroGate } from "@/components/brand/LogoIntroSplash";
import { MissionAscentRoot } from "@/features/mission-ascent/components/MissionAscentRoot";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { podcast } from "@/content/podcast";
import { site, siteTagline, siteTitle } from "@/content/site";
import { getHeaderStateAsync } from "@/lib/schedule/getHeaderState";
import { AnalyticsScript } from "@/components/analytics/AnalyticsScript";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
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

const title = siteTitle;
const description = siteTagline;

export const metadata: Metadata = {
  metadataBase: new URL(site.domain),
  title: {
    default: siteTitle,
    template: "%s | DYOR",
  },
  description,
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
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "DYOR",
    statusBarStyle: "black-translucent",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isLive, ctaHref, featuredShow } = await getHeaderStateAsync();

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} min-h-full`}>
      <head>
        <JsonLd />
      </head>
      <body className="bg-atmosphere min-h-full antialiased">
        <AnalyticsScript />
        <ServiceWorkerRegister />
        <MissionAscentRoot>
        <div className="bg-grid-shine" aria-hidden="true" />
        <ScrollToTop />
        <LogoIntroGate />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <div className="site-shell">
          <SiteHeader
            isLive={isLive}
            ctaHref={ctaHref}
            nextEventLabel={featuredShow.name}
          />
          <main id="main-content" className="relative flex-1 pb-[env(safe-area-inset-bottom)] md:pb-0">
            {children}
          </main>
          <SiteFooter />
        </div>
        </MissionAscentRoot>
      </body>
    </html>
  );
}
