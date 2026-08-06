"use client";

import { format, parseISO } from "date-fns";
import { useState, useTransition } from "react";
import { deleteRecordingAction } from "@/app/admin/actions";
import type { SpaceRecording } from "@/content/spacesLibrary";
import { getShowById } from "@/content/shows";
import { cn } from "@/lib/utils/cn";

type AdminRecordingListProps = {
  recordings: SpaceRecording[];
};

function RecordingListItem({
  recording,
  isPending,
  confirmId,
  onRequestRemove,
  onCancelRemove,
  onConfirmRemove,
}: {
  recording: SpaceRecording;
  isPending: boolean;
  confirmId: string | null;
  onRequestRemove: (id: string) => void;
  onCancelRemove: () => void;
  onConfirmRemove: (id: string) => void;
}) {
  const showName = getShowById(recording.showId)?.shortName ?? recording.showId;
  const airedLabel = format(parseISO(recording.airedAt), "MMM d, yyyy");
  const isConfirming = confirmId === recording.id;

  return (
    <li className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
          {showName} · Ep. {recording.episode}
        </p>
        <p className="mt-1 font-heading text-base font-bold text-text-primary">{recording.title}</p>
        <p className="mt-1 text-sm text-text-secondary">
          {airedLabel}
          {recording.duration ? ` · ${recording.duration}` : ""}
        </p>
        <a
          href={recording.xUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block truncate text-sm text-brand-bright hover:underline"
        >
          {recording.xUrl}
        </a>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {isConfirming ? (
          <>
            <span className="text-sm font-medium text-live">Delete?</span>
            <button
              type="button"
              disabled={isPending}
              onClick={() => onConfirmRemove(recording.id)}
              className="rounded-[var(--radius-medium)] border border-live bg-live/10 px-3 py-2 text-sm font-medium text-live transition-colors hover:bg-live/20 focus-ring disabled:opacity-50"
            >
              Yes, delete
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={onCancelRemove}
              className="rounded-[var(--radius-medium)] border border-border px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-brand hover:text-brand-bright focus-ring disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={() => onRequestRemove(recording.id)}
            className={cn(
              "rounded-[var(--radius-medium)] border border-border px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-live hover:text-live focus-ring disabled:opacity-50",
              isPending && confirmId !== null && "opacity-50",
            )}
          >
            Remove
          </button>
        )}
      </div>
    </li>
  );
}

export function AdminRecordingList({ recordings }: AdminRecordingListProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (recordings.length === 0) {
    return (
      <p className="rounded-[var(--radius-xl)] border border-border bg-surface/40 p-6 text-sm text-text-secondary">
        No recordings yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface/40">
      <div className="border-b border-border/70 px-5 py-4">
        <h2 className="font-heading text-lg font-bold text-text-primary">Library entries</h2>
      </div>
      <ul className="divide-y divide-border/70">
        {recordings.map((recording) => (
          <RecordingListItem
            key={recording.id}
            recording={recording}
            isPending={isPending}
            confirmId={confirmId}
            onRequestRemove={setConfirmId}
            onCancelRemove={() => setConfirmId(null)}
            onConfirmRemove={(id) => {
              startTransition(async () => {
                await deleteRecordingAction(id);
                setConfirmId(null);
              });
            }}
          />
        ))}
      </ul>
    </div>
  );
}
