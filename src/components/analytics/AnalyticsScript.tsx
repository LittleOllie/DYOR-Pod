import Script from "next/script";

const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;
const siteDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export function AnalyticsScript() {
  if (provider === "plausible" && siteDomain) {
    return (
      <Script
        defer
        data-domain={siteDomain}
        src="https://plausible.io/js/script.js"
        strategy="afterInteractive"
      />
    );
  }

  if (provider === "fathom" && process.env.NEXT_PUBLIC_FATHOM_SITE_ID) {
    return (
      <Script
        defer
        src={`https://cdn.usefathom.com/script.js`}
        data-site={process.env.NEXT_PUBLIC_FATHOM_SITE_ID}
        strategy="afterInteractive"
      />
    );
  }

  if (provider === "ga" && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}');
          `}
        </Script>
      </>
    );
  }

  return null;
}
