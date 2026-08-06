import type { Metadata } from "next";
import { AboutDYOR } from "@/components/about/AboutDYOR";
import { HeroSection } from "@/components/hero/HeroSection";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { HostGrid } from "@/components/hosts/HostGrid";
import { NewsletterSignup } from "@/components/newsletter/NewsletterSignup";
import { PodcastFeature } from "@/components/podcast/PodcastFeature";
import { WeeklySchedule } from "@/components/schedule/WeeklySchedule";
import { ShowGrid } from "@/components/shows/ShowGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { newsletter } from "@/content/site";
import { podcastSection } from "@/content/podcast";
import { getEventStatus } from "@/lib/schedule/getEventStatus";
import { getHeaderStateAsync } from "@/lib/schedule/getHeaderState";
import { fetchEffectiveShows } from "@/lib/schedule/scheduleStorage";
import { createPageMetadata } from "@/lib/seo/canonical";

export const metadata: Metadata = createPageMetadata({
  path: "/",
  title: "DYOR Podcast | Live Crypto Spaces, News & Opinion",
  description:
    "Join DYOR for weekly live crypto conversations on X, market analysis, interviews and the DYOR Podcast on Spotify and Apple Podcasts.",
});

export default async function HomePage() {
  const [{ featuredShow, startDate }, shows] = await Promise.all([
    getHeaderStateAsync(),
    fetchEffectiveShows(),
  ]);
  const isAnyLive = shows.some((show) => getEventStatus(show) === "live");

  return (
    <>
      <HeroSection
        featuredShow={featuredShow}
        startDate={startDate}
        isAnyLive={isAnyLive}
      />

      <SectionContainer id="schedule" ariaLabelledby="schedule-heading">
        <h2 id="schedule-heading" className="sr-only">
          Weekly Schedule
        </h2>
        <WeeklySchedule />
      </SectionContainer>

      <SectionContainer id="shows" ariaLabelledby="shows-heading">
        <h2 id="shows-heading" className="sr-only">
          Programmes
        </h2>
        <RevealOnScroll>
          <ShowGrid />
        </RevealOnScroll>
      </SectionContainer>

      <SectionContainer id="podcast" ariaLabelledby="podcast-heading">
        <h2 id="podcast-heading" className="sr-only">
          Podcast
        </h2>
        <RevealOnScroll>
          <SectionHeading title={podcastSection.heading} />
          <PodcastFeature />
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

      <SectionContainer id="about" ariaLabelledby="about-heading">
        <h2 id="about-heading" className="sr-only">
          About DYOR
        </h2>
        <RevealOnScroll>
          <AboutDYOR />
        </RevealOnScroll>
      </SectionContainer>

      <SectionContainer id="newsletter" ariaLabelledby="newsletter-heading">
        <RevealOnScroll>
          <div className="text-center">
            <SectionHeading
              title={newsletter.heading}
              description={newsletter.description}
              align="center"
            />
            <NewsletterSignup />
          </div>
        </RevealOnScroll>
      </SectionContainer>
    </>
  );
}
