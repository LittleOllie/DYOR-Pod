"use client";

import { format, parseISO } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getShowById } from "@/content/shows";
import {
  librarySection,
  type LibraryCategory,
} from "@/content/spacesLibrary";
import { libraryMobile } from "@/content/site";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

type DesktopSpacesLibraryGridProps = {
  categories: LibraryCategory[];
};

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function SpaceShowCard({
  category,
  expanded,
  onToggle,
}: {
  category: LibraryCategory;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { showId, name, recordings } = category;
  const show = getShowById(showId);
  const count = recordings.length;
  const latest = count > 0 ? recordings[0] : null;
  const preview = recordings.slice(0, 3);
  const description = show?.description ?? show?.tagline ?? "";

  return (
    <article className="space-show-card desktop-hover-lift flex min-w-0 flex-col rounded-[20px] border border-border bg-surface/70 p-6 transition-[box-shadow,border-color] duration-[var(--motion-base)] hover:border-brand/25">
      {show?.image ? (
        <div className="relative mx-auto mb-4 h-20 w-20 shrink-0 overflow-hidden rounded-[var(--radius-medium)] shadow-[0_0_24px_rgba(19,169,166,0.12)]">
          <Image
            src={show.image}
            alt=""
            fill
            className="object-cover"
            sizes="80px"
          />
        </div>
      ) : null}

      <div className="space-show-card__content flex min-w-0 flex-1 flex-col">
        <h3 className="font-heading text-xl font-bold text-text-primary">{name}</h3>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
        ) : null}

        <p className="mt-4 text-sm font-medium text-text-primary">
          {count > 0 ? (
            <>
              {count} recording{count === 1 ? "" : "s"}
            </>
          ) : (
            <span className="text-text-secondary">Recordings coming soon</span>
          )}
        </p>

        {latest ? (
          <>
            <p className="mt-2 text-sm text-text-secondary">
              Latest: {format(parseISO(latest.airedAt), "d MMMM yyyy")}
            </p>
            <p className="mt-2 line-clamp-2 text-sm text-text-secondary">
              Latest replay: {latest.title}
            </p>
          </>
        ) : null}
      </div>

      <div className="mt-5 pt-1">
        {count > 0 ? (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={`desktop-library-${showId}`}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[var(--radius-medium)] border border-border bg-bg-primary/40 px-4 py-2.5 text-sm font-medium text-brand-bright transition-colors hover:border-brand/40 hover:bg-brand/10 focus-ring"
          >
            {expanded ? "Hide recordings" : "View recordings"}
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={cn(
                "transition-transform duration-[var(--motion-base)]",
                expanded && "rotate-180",
              )}
            />
          </button>
        ) : (
          <span className="inline-flex min-h-[44px] w-full items-center justify-center rounded-[var(--radius-medium)] border border-border/60 bg-bg-primary/20 px-4 py-2.5 text-sm text-text-secondary/70">
            Coming soon
          </span>
        )}
      </div>

      {expanded && count > 0 ? (
        <div
          id={`desktop-library-${showId}`}
          className="mt-4 border-t border-border/50 pt-4"
        >
          <ul className="space-y-2">
            {preview.map((recording) => (
              <li
                key={recording.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-medium)] px-2 py-2 transition-colors hover:bg-surface/50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {format(parseISO(recording.airedAt), "MMM d, yyyy")}
                  </p>
                  <p className="truncate text-xs text-text-secondary">
                    Ep. {recording.episode} · {recording.title}
                  </p>
                </div>
                <Link
                  href={recording.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-bright underline-offset-4 hover:underline focus-ring"
                  aria-label={`Listen to episode ${recording.episode} on X`}
                >
                  <XIcon />
                  Open
                </Link>
              </li>
            ))}
          </ul>
          {count > 3 ? (
            <p className="mt-3 text-xs text-text-secondary">
              Showing 3 of {count} recordings
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function DesktopSpacesLibraryGrid({ categories }: DesktopSpacesLibraryGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const totalRecordings = categories.reduce((sum, c) => sum + c.recordings.length, 0);
  const showCount = categories.length;

  return (
    <div className="min-w-0">
      <SectionHeading
        eyebrow={libraryMobile.eyebrow}
        title={librarySection.heading}
        accent={librarySection.headingAccent}
        description={libraryMobile.description}
        className="mb-6 md:mb-8"
      />

      {totalRecordings > 0 ? (
        <p className="mb-8 text-sm text-text-secondary">
          {totalRecordings} recording{totalRecordings === 1 ? "" : "s"} across {showCount}{" "}
          show{showCount === 1 ? "" : "s"}
        </p>
      ) : null}

      <div
        className="spaces-library-grid grid grid-cols-2 gap-5 min-[1200px]:grid-cols-3"
        aria-label="Space archive by show"
      >
        {categories.map((category) => (
          <SpaceShowCard
            key={category.showId}
            category={category}
            expanded={expandedId === category.showId}
            onToggle={() =>
              setExpandedId((current) =>
                current === category.showId ? null : category.showId,
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
