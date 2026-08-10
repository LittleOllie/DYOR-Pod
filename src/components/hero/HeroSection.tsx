import Link from "next/link";
import { NextEventCard } from "@/components/hero/NextEventCard";
import { LinkButton } from "@/components/ui/Button";
import { HeadingWithAccent } from "@/components/ui/ColorfulAccent";
import { hero, heroDesktop, heroMobile } from "@/content/site";
import type { Show } from "@/types/content";
import type { DateScheduleOverride } from "@/lib/schedule/scheduleTypes";
import { getResolvedEventStatus } from "@/lib/schedule/resolveShowSchedule";

type HeroSectionProps = {
  featuredShow: Show;
  startDate?: string;
  isAnyLive: boolean;
  dateOverrides?: DateScheduleOverride[];
};

export function HeroSection({
  featuredShow,
  startDate,
  isAnyLive,
  dateOverrides = [],
}: HeroSectionProps) {
  const isLive =
    getResolvedEventStatus(featuredShow, { dateOverrides }) === "live" || isAnyLive;
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
              <h1
                id="hero-heading"
                className="font-heading text-[2.375rem] font-bold leading-[1.08] text-text-primary sm:text-4xl md:text-[3.25rem] md:leading-[1.06] lg:text-[4rem] xl:text-[4.75rem] xl:leading-[1.02]"
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
          </div>

          <div className="relative lg:justify-self-end lg:w-full lg:max-w-[32rem] xl:max-w-[36rem]">
            <NextEventCard
              show={featuredShow}
              startDate={startDate}
              dateOverrides={dateOverrides}
              featured
            />
          </div>
        </div>
      </div>
    </section>
  );
}
