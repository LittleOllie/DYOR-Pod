import Link from "next/link";
import { NextEventCard } from "@/components/hero/NextEventCard";
import { LinkButton } from "@/components/ui/Button";
import { HeadingWithAccent } from "@/components/ui/ColorfulAccent";
import { hero, heroDesktop, heroMobile } from "@/content/site";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import type { Show } from "@/types/content";

type HeroSectionProps = {
  featuredShow: Show;
  startDate?: string;
  isAnyLive: boolean;
};

export function HeroSection({ featuredShow, startDate, isAnyLive }: HeroSectionProps) {
  const isLive = getEventStatus(featuredShow) === "live" || isAnyLive;
  const primaryHref = isLive
    ? featuredShow.xUrl ?? "/#schedule"
    : "/#schedule";
  const primaryLabelMobile = isLive ? "Join live" : heroMobile.primaryCta;
  const primaryLabelDesktop = isLive ? "Join live on X" : heroDesktop.primaryCta;

  return (
    <section
      className="relative z-10 overflow-x-clip md:px-0 md:pb-24 md:pt-16 lg:pb-28 lg:pt-20"
      aria-labelledby="hero-heading"
    >
      <div className="hero-glow" aria-hidden="true" />

      <div className="mobile-page-container desktop-container relative min-w-0 md:px-0">
        <div className="flex min-w-0 flex-col gap-8 pt-11 pb-10 md:gap-14 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-12 xl:gap-16 lg:pt-4 lg:pb-8">
          <div className="flex min-w-0 flex-col gap-5 lg:gap-7">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand md:text-sm md:tracking-[0.2em]">
                <span className="md:hidden">{heroMobile.eyebrow}</span>
                <span className="hidden md:inline">{hero.eyebrow}</span>
              </p>
              <h1
                id="hero-heading"
                className="mt-3 font-heading text-[2.375rem] font-bold leading-[1.08] text-text-primary sm:text-4xl md:mt-4 md:text-[3.25rem] md:leading-[1.06] lg:text-[4rem] xl:text-[4.75rem] xl:leading-[1.02]"
              >
                <span className="md:hidden">
                  <HeadingWithAccent
                    title={heroMobile.headline}
                    accent={heroMobile.headlineAccent}
                  />
                </span>
                <span className="hidden md:inline">
                  <HeadingWithAccent title={hero.headline} accent={hero.headlineAccent} />
                </span>
              </h1>
              <p className="mt-4 max-w-[36rem] text-[15px] leading-[1.65] text-text-secondary md:mt-6 md:max-w-[34rem] md:text-xl md:leading-[1.65] lg:max-w-[38rem] lg:text-[1.35rem] lg:leading-[1.7]">
                <span className="md:hidden">{heroMobile.description}</span>
                <span className="hidden md:inline">{hero.description}</span>
              </p>
            </div>

            <div className="hidden flex-wrap gap-2 md:flex lg:hidden">
              {hero.supportingPoints.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-border bg-surface/50 px-3 py-1 text-xs text-text-secondary"
                >
                  {point}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-3.5 md:flex-row md:items-center md:gap-4">
              <LinkButton
                href={primaryHref}
                variant={isLive ? "live" : "primary"}
                size="lg"
                className="min-h-[50px] w-full md:min-h-[54px] md:px-8 md:text-lg lg:min-h-[56px] md:w-auto"
                external={primaryHref.startsWith("http")}
              >
                <span className="md:hidden">{primaryLabelMobile}</span>
                <span className="hidden md:inline">{primaryLabelDesktop}</span>
              </LinkButton>
              <Link
                href="/#podcast"
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 text-sm font-medium text-brand-bright underline-offset-4 hover:underline focus-ring md:hidden"
              >
                {heroMobile.secondaryCta}
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/#podcast"
                className="hidden min-h-[44px] items-center gap-1.5 text-base font-medium text-text-secondary underline-offset-4 transition-colors hover:text-brand-bright hover:underline focus-ring md:inline-flex"
              >
                {heroDesktop.secondaryCta}
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            <ul className="hidden space-y-2.5 lg:block">
              {hero.supportingPoints.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm text-text-secondary">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative lg:justify-self-end lg:w-full lg:max-w-[32rem] xl:max-w-[36rem]">
            <NextEventCard show={featuredShow} startDate={startDate} featured />
          </div>
        </div>
      </div>
    </section>
  );
}
