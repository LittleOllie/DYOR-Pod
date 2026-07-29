"use client";

import { useEffect, useRef, useState } from "react";
import { LinkButton } from "@/components/ui/Button";
import { SpotifyListenButton } from "@/components/ui/SpotifyListenButton";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { podcast, podcastSection } from "@/content/podcast";
import { getShowById } from "@/content/shows";
import { site } from "@/content/site";

function BroadcastWave({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {[0, 20, 40, 60, 80, 100].map((x, i) => (
        <rect
          key={x}
          x={x}
          y={12 - (i % 3) * 3 - 2}
          width="3"
          height={(i % 3) * 3 + 4}
          rx="1.5"
          className="fill-brand/40"
        />
      ))}
    </svg>
  );
}

export function SpotifyEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (embedFailed) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-text-secondary">
          Spotify embed unavailable. Listen directly on Spotify instead.
        </p>
        <SpotifyListenButton href={podcast.spotifyShowUrl} size="md" className="mt-4" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-[232px] w-full overflow-hidden rounded-[var(--radius-large)] border border-border bg-surface sm:min-h-[352px]"
    >
      {shouldLoad ? (
        <iframe
          src={podcast.spotifyEmbedUrl}
          width="100%"
          height="352"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="The DYOR Podcast on Spotify"
          className="border-0"
          onError={() => setEmbedFailed(true)}
        />
      ) : (
        <div
          className="flex h-[232px] items-center justify-center text-text-secondary sm:h-[352px]"
          aria-hidden="true"
        >
          Loading player…
        </div>
      )}
    </div>
  );
}

export function PodcastFeature() {
  const podcastShow = getShowById("dyor-podcast");
  const imageWidth = podcastShow?.imageWidth ?? 1122;
  const imageHeight = podcastShow?.imageHeight ?? 1402;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start lg:gap-12">
      <div>
        <div
          className="relative mb-6 max-w-[280px] overflow-hidden rounded-[var(--radius-xl)] border border-border bg-bg-primary/40 shadow-[var(--shadow-soft)]"
          style={{ aspectRatio: `${imageWidth} / ${imageHeight}` }}
        >
          <ImageWithFallback
            src={podcastShow?.image ?? "/shows/DYORPodcast.png"}
            alt="The DYOR Podcast artwork"
            width={imageWidth}
            height={imageHeight}
            objectFit="contain"
            className="h-full w-full"
            sizes="280px"
          />
          <BroadcastWave className="absolute bottom-3 left-3 h-5 w-24" />
        </div>

        <p className="prose-width text-base leading-relaxed text-text-secondary md:text-lg">
          {podcastSection.description}
        </p>
        <p className="mt-2 text-sm font-medium text-gold">{podcastSection.releaseNote}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <SpotifyListenButton href={podcast.spotifyShowUrl} size="md" />
          {(podcast.applePodcastsUrl || site.social.applePodcasts) && (
            <LinkButton
              href={podcast.applePodcastsUrl ?? site.social.applePodcasts!}
              variant="secondary"
              size="md"
              external
            >
              Apple Podcasts
            </LinkButton>
          )}
        </div>
      </div>

      <SpotifyEmbed />
    </div>
  );
}
