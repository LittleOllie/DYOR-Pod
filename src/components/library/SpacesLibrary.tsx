"use client";

import { format, parseISO } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { DesktopSpacesLibraryGrid } from "@/components/desktop/DesktopSpacesLibraryGrid";
import { MobileSectionHeader } from "@/components/mobile/MobileSectionHeader";
import { LinkButton } from "@/components/ui/Button";
import {
  librarySection,
  type LibraryCategory,
} from "@/content/spacesLibrary";
import { libraryMobile } from "@/content/site";
import { cn } from "@/lib/utils/cn";

type SpacesLibraryProps = {
  categories: LibraryCategory[];
};

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function RecordingDisclosure({
  episode,
  title,
  airedAt,
  duration,
  xUrl,
}: {
  episode: number;
  title: string;
  airedAt: string;
  duration?: string;
  xUrl: string;
}) {
  const airedLabel = format(parseISO(airedAt), "MMM d, yyyy");

  return (
    <details className="group/recording rounded-[var(--radius-medium)] border border-border/70 bg-surface/30 open:border-brand/30 open:bg-surface/50 md:border-border/80 md:bg-surface/50 md:open:bg-surface/70">
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3",
          "[&::-webkit-details-marker]:hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-sm font-bold text-text-primary md:text-base">
            <span className="text-brand">Ep. {episode}</span>
            <span className="text-text-secondary/80"> · {airedLabel}</span>
            {duration ? (
              <span className="hidden text-text-secondary/70 sm:inline"> · {duration}</span>
            ) : null}
          </p>
          <p className="mt-0.5 truncate text-xs text-text-secondary md:text-sm">{title}</p>
        </div>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="shrink-0 text-text-secondary transition-transform duration-[var(--motion-base)] group-open/recording:rotate-180"
        />
      </summary>

      <div className="border-t border-border/60 px-3.5 pb-3.5 pt-3">
        <p className="text-sm leading-snug text-text-secondary">{title}</p>
        {duration ? (
          <p className="mt-1 text-xs text-text-secondary/70">Runtime {duration}</p>
        ) : null}
        <LinkButton
          href={xUrl}
          variant="secondary"
          size="md"
          external
          className="mt-3 w-full sm:w-auto"
          aria-label={`Listen to episode ${episode} on X`}
        >
          <XIcon />
          Listen on X
        </LinkButton>
      </div>
    </details>
  );
}

function CategorySection({
  showId,
  name,
  recordings,
}: {
  showId: string;
  name: string;
  recordings: {
    id: string;
    episode: number;
    title: string;
    airedAt: string;
    duration?: string;
    xUrl: string;
  }[];
}) {
  const [showAllMobile, setShowAllMobile] = useState(false);
  const count = recordings.length;
  const latestLabel =
    count > 0
      ? format(parseISO(recordings[0].airedAt), "d MMM")
      : null;
  const mobilePreview = showAllMobile ? recordings : recordings.slice(0, 3);
  const hasMore = recordings.length > 3 && !showAllMobile;

  return (
    <details
      className={cn(
        "group/category overflow-hidden rounded-[var(--radius-large)] border border-border/80 bg-surface/25 open:border-brand/35 md:rounded-[var(--radius-xl)] md:border-2 md:border-brand/40 md:bg-surface/40 md:ring-2 md:ring-brand/10 md:open:border-brand/55 md:open:shadow-[var(--shadow-soft)]",
      )}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 md:px-5 md:py-4",
          "[&::-webkit-details-marker]:hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        )}
        aria-controls={`library-recordings-${showId}`}
      >
        <div className="min-w-0">
          <p className="font-heading text-base font-bold text-text-primary md:text-lg">
            {name}
          </p>
          <p className="mt-0.5 text-xs text-text-secondary md:text-sm">
            {count > 0 ? (
              <>
                <span className="md:hidden">
                  {count} recording{count === 1 ? "" : "s"}
                  {latestLabel ? ` · Latest ${latestLabel}` : ""}
                </span>
                <span className="hidden md:inline">
                  {count} recording{count === 1 ? "" : "s"}
                </span>
              </>
            ) : (
              <>
                <span className="md:hidden">Recordings coming soon</span>
                <span className="hidden md:inline">No recordings yet</span>
              </>
            )}
          </p>
        </div>
        <ChevronDown
          size={20}
          aria-hidden="true"
          className="shrink-0 text-brand-bright transition-transform duration-[var(--motion-base)] group-open/category:rotate-180"
        />
      </summary>

      <div
        id={`library-recordings-${showId}`}
        className="border-t border-border/70 px-3 pb-3 pt-2 md:px-4 md:pb-4"
      >
        {count > 0 ? (
          <>
            <ul className="flex flex-col gap-2 md:hidden">
              {mobilePreview.map((recording) => (
                <li key={recording.id}>
                  <RecordingDisclosure
                    episode={recording.episode}
                    title={recording.title}
                    airedAt={recording.airedAt}
                    duration={recording.duration}
                    xUrl={recording.xUrl}
                  />
                </li>
              ))}
            </ul>
            {hasMore ? (
              <button
                type="button"
                className="mt-2 text-sm font-medium text-brand-bright underline-offset-4 hover:underline focus-ring md:hidden"
                onClick={() => setShowAllMobile(true)}
              >
                View all recordings
              </button>
            ) : null}
            <ul className="hidden flex-col gap-2 md:flex">
              {recordings.map((recording) => (
                <li key={recording.id}>
                  <RecordingDisclosure
                    episode={recording.episode}
                    title={recording.title}
                    airedAt={recording.airedAt}
                    duration={recording.duration}
                    xUrl={recording.xUrl}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="py-6 text-center text-sm leading-relaxed text-text-secondary">
            <span className="md:hidden">No replays are available yet.</span>
            <span className="hidden md:inline">Recordings for {name} will appear here as they&apos;re added.</span>
          </p>
        )}
      </div>
    </details>
  );
}

export function SpacesLibrary({ categories }: SpacesLibraryProps) {
  return (
    <div>
      <MobileSectionHeader
        eyebrow={libraryMobile.eyebrow}
        title={librarySection.heading}
        accent={librarySection.headingAccent}
        description={libraryMobile.description}
        className="md:hidden"
      />

      <div className="md:hidden">
        <div className="flex flex-col gap-2" aria-label="Space categories">
          {categories.map((category) => (
            <CategorySection
              key={category.showId}
              showId={category.showId}
              name={category.name}
              recordings={category.recordings}
            />
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        <DesktopSpacesLibraryGrid categories={categories} />
      </div>
    </div>
  );
}
