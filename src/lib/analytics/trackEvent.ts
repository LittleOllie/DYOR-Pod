export type AnalyticsEvent =
  | "join_x_space"
  | "spotify_click"
  | "apple_podcasts_click"
  | "newsletter_submit"
  | "contact_submit"
  | "host_profile_click"
  | "show_card_click";

type AnalyticsProperties = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: AnalyticsProperties }) => void;
    fathom?: { trackGoal: (code: string, cents?: number) => void };
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: AnalyticsEvent, properties?: AnalyticsProperties): void {
  if (typeof window === "undefined") return;

  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;

  if (!provider) return;

  switch (provider) {
    case "plausible":
      window.plausible?.(event, { props: properties });
      break;
    case "fathom":
      window.fathom?.trackGoal(event);
      break;
    case "ga":
      window.gtag?.("event", event, properties);
      break;
    default:
      break;
  }
}
