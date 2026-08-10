import type { Metadata } from "next";
import { AboutDYOR } from "@/components/about/AboutDYOR";
import { GameSection } from "@/components/game/GameSection";
import { HeroSection } from "@/components/hero/HeroSection";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { HostGrid } from "@/components/hosts/HostGrid";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { PodcastFeature } from "@/components/podcast/PodcastFeature";
import { WeeklySchedule } from "@/components/schedule/WeeklySchedule";
import { SpacesLibrarySection } from "@/components/library/SpacesLibrarySection";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { newsletter, siteTagline, siteTitle } from "@/content/site";
import { getResolvedEventStatus } from "@/lib/schedule/resolveShowSchedule";
import { getHeaderStateAsync } from "@/lib/schedule/getHeaderState";
import { fetchEffectiveShows } from "@/lib/schedule/scheduleStorage";
import { createPageMetadata } from "@/lib/seo/canonical";

export const metadata: Metadata = createPageMetadata({
  path: "/",
  title: siteTitle,
  description: siteTagline,
});

export default async function HomePage() {
  const [{ featuredShow, startDate, dateOverrides }, shows] = await Promise.all([
    getHeaderStateAsync(),
    fetchEffectiveShows(),
  ]);
  const isAnyLive = shows.some(
    (show) => getResolvedEventStatus(show, { dateOverrides }) === "live",
  );

  return (
    <>
      <HeroSection
        featuredShow={featuredShow}
        startDate={startDate}
        isAnyLive={isAnyLive}
        dateOverrides={dateOverrides}
      />

      <SectionContainer id="schedule" ariaLabelledby="schedule-heading">
        <h2 id="schedule-heading" className="sr-only">
          Weekly Schedule
        </h2>
        <WeeklySchedule />
      </SectionContainer>

      <SectionContainer id="podcast" ariaLabelledby="podcast-heading">
        <RevealOnScroll>
          <PodcastFeature />
        </RevealOnScroll>
      </SectionContainer>

      <SectionContainer id="library" ariaLabelledby="library-heading">
        <h2 id="library-heading" className="sr-only">
          Spaces Library
        </h2>
        <RevealOnScroll>
          <SpacesLibrarySection />
        </RevealOnScroll>
      </SectionContainer>

      <SectionContainer id="hosts" ariaLabelledby="hosts-heading">
        <h2 id="hosts-heading" className="sr-only">
          Hosts
        </h2>
        <RevealOnScroll>
          <HostGrid />
        </RevealOnScroll>
      </SectionContainer>

      <SectionContainer id="game" ariaLabelledby="game-heading">
        <RevealOnScroll>
          <h2 id="game-heading" className="sr-only">
            Mission Ascent
          </h2>
          <GameSection />
        </RevealOnScroll>
      </SectionContainer>

      <SectionContainer id="about" ariaLabelledby="about-heading">
        <h2 id="about-heading" className="sr-only">
          Mission Control
        </h2>
        <RevealOnScroll>
          <AboutDYOR />
        </RevealOnScroll>
      </SectionContainer>

      <SectionContainer id="newsletter" ariaLabelledby="newsletter-heading">
        <RevealOnScroll>
          <h2 id="newsletter-heading" className="sr-only">
            {newsletter.heading}
          </h2>
          <NewsletterSignup />
        </RevealOnScroll>
      </SectionContainer>
    </>
  );
}
