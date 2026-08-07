"use client";

import { format, parseISO } from "date-fns";
import { ChevronDown } from "lucide-react";
import { MobileSectionHeader } from "@/components/mobile/MobileSectionHeader";
import { LinkButton } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function EpisodeRow({
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
    <li className="flex items-center gap-3 border-b border-border/40 px-3 py-2 last:border-b-0 sm:px-3.5 sm:py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-text-primary">
          <span className="text-brand">Ep. {episode}</span>
          <span className="text-text-secondary/80"> · {airedLabel}</span>
          {duration ? (
            <span className="hidden text-text-secondary/70 sm:inline"> · {duration}</span>
          ) : null}
        </p>
        <p className="truncate text-xs text-text-secondary">{title}</p>
      </div>
      <LinkButton
        href={xUrl}
        variant="secondary"
        size="sm"
        external
        className="shrink-0 gap-1.5 px-3 py-2"
        aria-label={`Listen to episode ${episode} on X`}
      >
        <XIcon />
        Listen
      </LinkButton>
    </li>
  );
}

function ShowAccordion({
  showId,
  name,
  recordings,
}: {
  showId: string;
  name: string;
  recordings: LibraryCategory["recordings"];
}) {
  const count = recordings.length;
  const latestLabel =
    count > 0 ? format(parseISO(recordings[0].airedAt), "d MMM yyyy") : null;

  return (
    <details
      className={cn(
        "group/show overflow-hidden rounded-[var(--radius-medium)] border border-border/70 bg-surface/25 open:border-brand/35 open:bg-surface/40",
      )}
    >
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-3 px-3.5 py-3 sm:px-4",
          "[&::-webkit-details-marker]:hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        )}
        aria-controls={`library-recordings-${showId}`}
      >
        <div className="min-w-0">
          <p className="font-heading text-sm font-bold text-text-primary sm:text-base">{name}</p>
          <p className="mt-0.5 text-xs text-text-secondary">
            {count > 0 ? (
              <>
                {count} episode{count === 1 ? "" : "s"}
                {latestLabel ? ` · Latest ${latestLabel}` : ""}
              </>
            ) : (
              "Coming soon"
            )}
          </p>
        </div>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="shrink-0 text-brand-bright transition-transform duration-[var(--motion-base)] group-open/show:rotate-180"
        />
      </summary>

      <div id={`library-recordings-${showId}`} className="border-t border-border/60">
        {count > 0 ? (
          <ul>
            {recordings.map((recording) => (
              <EpisodeRow
                key={recording.id}
                episode={recording.episode}
                title={recording.title}
                airedAt={recording.airedAt}
                duration={recording.duration}
                xUrl={recording.xUrl}
              />
            ))}
          </ul>
        ) : (
          <p className="px-3.5 py-4 text-center text-xs text-text-secondary">
            Recordings for {name} will appear here as they&apos;re added.
          </p>
        )}
      </div>
    </details>
  );
}

export function SpacesLibrary({ categories }: SpacesLibraryProps) {
  const totalRecordings = categories.reduce((sum, category) => sum + category.recordings.length, 0);

  return (
    <div className="min-w-0 w-full">
      <MobileSectionHeader
        title={librarySection.heading}
        accent={librarySection.headingAccent}
        description={libraryMobile.description}
        className="md:hidden"
      />

      <SectionHeading
        title={librarySection.heading}
        accent={librarySection.headingAccent}
        description={libraryMobile.description}
        className="mb-4 hidden md:mb-5 md:block"
      />

      {totalRecordings > 0 ? (
        <p className="mb-3 text-xs text-text-secondary sm:text-sm">
          {totalRecordings} recording{totalRecordings === 1 ? "" : "s"} across {categories.length}{" "}
          show{categories.length === 1 ? "" : "s"}
        </p>
      ) : null}

      <div className="flex flex-col gap-2" aria-label="Space archive by show">
        {categories.map((category) => (
          <ShowAccordion
            key={category.showId}
            showId={category.showId}
            name={category.name}
            recordings={category.recordings}
          />
        ))}
      </div>
    </div>
  );
}
