"use client";

import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { librarySection, type LibraryCategory } from "@/content/spacesLibrary";
import { cn } from "@/lib/utils/cn";
import { ChevronRight, Radio } from "lucide-react";

type DesktopLibraryDashboardProps = {
  categories: LibraryCategory[];
};

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ArchiveShowCard({
  category,
  expanded,
  onToggle,
}: {
  category: LibraryCategory;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { showId, name, recordings } = category;
  const count = recordings.length;
  const latest = count > 0 ? recordings[0] : null;
  const latestLabel = latest ? format(parseISO(latest.airedAt), "d MMM yyyy") : null;
  const preview = recordings.slice(0, 4);

  return (
    <article
      className={cn(
        "desktop-hover-lift overflow-hidden rounded-[var(--radius-xl)] bg-surface/30 transition-[box-shadow,background-color] duration-[var(--motion-base)]",
        expanded && "bg-surface/45 ring-1 ring-brand/20",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`desktop-library-${showId}`}
        className="flex w-full items-start justify-between gap-4 p-5 text-left focus-ring lg:p-6"
      >
        <div className="min-w-0 flex-1">
          <p className="font-heading text-xl font-bold text-text-primary lg:text-2xl">{name}</p>
          <p className="mt-2 text-sm text-text-secondary">
            {count > 0 ? (
              <>
                {count} recording{count === 1 ? "" : "s"}
                {latestLabel ? ` · Latest ${latestLabel}` : ""}
              </>
            ) : (
              "Recordings coming soon"
            )}
          </p>
          {latest && !expanded ? (
            <p className="mt-2 line-clamp-1 text-sm text-text-secondary/80">
              Ep. {latest.episode} · {latest.title}
            </p>
          ) : null}
        </div>
        <ChevronRight
          size={20}
          aria-hidden="true"
          className={cn(
            "mt-1 shrink-0 text-brand-bright transition-transform duration-[var(--motion-base)]",
            expanded && "rotate-90",
          )}
        />
      </button>

      <div
        id={`desktop-library-${showId}`}
        hidden={!expanded}
        className="border-t border-border/40 px-5 pb-5 pt-4 lg:px-6 lg:pb-6"
      >
        {count > 0 ? (
          <ul className="space-y-2">
            {preview.map((recording) => (
              <li
                key={recording.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-medium)] px-3 py-2.5 transition-colors hover:bg-surface/40"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">
                    <span className="text-brand">Ep. {recording.episode}</span>
                    <span className="text-text-secondary/80">
                      {" "}
                      · {format(parseISO(recording.airedAt), "MMM d, yyyy")}
                    </span>
                  </p>
                  <p className="truncate text-xs text-text-secondary">{recording.title}</p>
                </div>
                <Link
                  href={recording.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-brand-bright underline-offset-4 hover:underline focus-ring"
                  aria-label={`Listen to episode ${recording.episode} on X`}
                >
                  <XIcon />
                  Open
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-text-secondary">No replays are available yet.</p>
        )}
      </div>
    </article>
  );
}

export function DesktopLibraryDashboard({ categories }: DesktopLibraryDashboardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const totalRecordings = categories.reduce((sum, c) => sum + c.recordings.length, 0);
  const showCount = categories.length;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:items-start lg:gap-14 xl:gap-16">
      <div className="lg:sticky lg:top-28">
        <SectionHeading
          eyebrow={librarySection.eyebrow}
          title={librarySection.heading}
          accent={librarySection.headingAccent}
          description={librarySection.description}
          className="mb-0 md:mb-8"
        />

        <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-border/50 pt-8 lg:grid-cols-1 lg:gap-5">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary/70">
              Shows
            </dt>
            <dd className="mt-1 font-heading text-3xl font-bold text-text-primary">{showCount}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary/70">
              Recordings
            </dt>
            <dd className="mt-1 font-heading text-3xl font-bold text-brand-bright">
              {totalRecordings}
            </dd>
          </div>
        </dl>

        <p className="mt-6 flex items-center gap-2 text-sm text-text-secondary">
          <Radio size={14} className="shrink-0 text-brand" aria-hidden="true" />
          Replay past X Spaces from the DYOR lineup.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {categories.map((category) => (
          <ArchiveShowCard
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
