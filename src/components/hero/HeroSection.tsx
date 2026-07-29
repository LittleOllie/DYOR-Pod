import { NextEventCard } from "@/components/hero/NextEventCard";
import { LinkButton } from "@/components/ui/Button";
import { SpotifyListenButton } from "@/components/ui/SpotifyListenButton";
import { SpotifySocialLink } from "@/components/ui/SpotifySocialLink";
import { ApplePodcastsSocialLink } from "@/components/ui/ApplePodcastsSocialLink";
import { SocialIconLink } from "@/components/ui/SocialIconLink";
import { hero } from "@/content/site";
import { site } from "@/content/site";
import { podcast } from "@/content/podcast";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import type { Show } from "@/types/content";

type HeroSectionProps = {
  featuredShow: Show;
  startDate?: string;
  isAnyLive: boolean;
};

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function HeroSection({ featuredShow, startDate, isAnyLive }: HeroSectionProps) {
  const isLive = getEventStatus(featuredShow) === "live" || isAnyLive;
  const primaryHref = isLive
    ? featuredShow.xUrl ?? site.social.x ?? "/#schedule"
    : "/#schedule";
  const primaryLabel = isLive ? "Join Live on X" : "View Next Space";

  return (
    <section
      className="relative z-10 overflow-hidden px-4 pb-10 pt-6 md:px-6 md:pb-20 md:pt-14"
      aria-labelledby="hero-heading"
    >
      <div className="hero-glow" aria-hidden="true" />

      <div className="relative mx-auto max-w-[var(--content-width)]">
        {/* Mobile: message-first order */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="flex flex-col gap-5 lg:order-1">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand md:text-sm">
                {hero.eyebrow}
              </p>
              <h1
                id="hero-heading"
                className="mt-2 font-heading text-[1.875rem] font-bold leading-[1.12] text-text-primary sm:text-4xl md:text-5xl lg:text-[3.25rem]"
              >
                {hero.headline}
              </h1>
              <p className="prose-width mt-4 text-base leading-relaxed text-text-secondary md:text-lg">
                {hero.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:hidden">
              {hero.supportingPoints.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-border bg-surface/50 px-3 py-1 text-xs text-text-secondary"
                >
                  {point}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <LinkButton
                href={primaryHref}
                variant={isLive ? "live" : "primary"}
                size="lg"
                className="min-h-[52px] w-full sm:w-auto"
                external={primaryHref.startsWith("http")}
              >
                {primaryLabel}
              </LinkButton>
              <SpotifyListenButton href={podcast.spotifyShowUrl} size="lg" className="w-full sm:w-auto" />
            </div>

            <ul className="hidden space-y-2 md:block">
              {hero.supportingPoints.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="hidden gap-2 md:flex">
              {site.social.x && (
                <SocialIconLink href={site.social.x} label="Follow DYOR on X">
                  <XIcon />
                </SocialIconLink>
              )}
              {site.social.spotify && <SpotifySocialLink href={site.social.spotify} />}
              {(site.social.applePodcasts || podcast.applePodcastsUrl) && (
                <ApplePodcastsSocialLink
                  href={site.social.applePodcasts ?? podcast.applePodcastsUrl!}
                />
              )}
            </div>
          </div>

          <div className="relative lg:order-2">
            <NextEventCard show={featuredShow} startDate={startDate} />
          </div>
        </div>
      </div>
    </section>
  );
}
