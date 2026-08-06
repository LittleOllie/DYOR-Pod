"use client";

import { useEffect, useState, useTransition } from "react";
import { addRecordingAction, lookupXRecordingAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { libraryShowIds } from "@/content/spacesLibrary";
import { getShowById } from "@/content/shows";

function isXUrl(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.includes("x.com/") || trimmed.includes("twitter.com/");
}

export function AdminAddRecordingForm() {
  const [showId, setShowId] = useState<(typeof libraryShowIds)[number]>("dyor-sunday");
  const [xUrl, setXUrl] = useState("");
  const [title, setTitle] = useState("");
  const [airedAt, setAiredAt] = useState("");
  const [duration, setDuration] = useState("");
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [lookupStatus, setLookupStatus] = useState<
    "idle" | "loading" | "done" | "error"
  >("idle");
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const trimmed = xUrl.trim();
    if (!isXUrl(trimmed)) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setLookupStatus("loading");
      setLookupMessage("Looking up details from X…");

      startTransition(async () => {
        const result = await lookupXRecordingAction(trimmed);

        if (result.airedAt) {
          setAiredAt(result.airedAt);
        }
        if (result.duration) {
          setDuration(result.duration);
        }
        if (result.title) {
          setTitle(result.title);
        }

        setLookupStatus(result.ok ? "done" : "error");
        setLookupMessage(result.message);
      });
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [xUrl]);

  const showLookupFeedback = isXUrl(xUrl);
  const visibleLookupMessage = showLookupFeedback ? lookupMessage : null;
  const visibleLookupStatus = showLookupFeedback ? lookupStatus : "idle";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await addRecordingAction({
        showId,
        xUrl,
        title: title.trim() || undefined,
        airedAt: airedAt || undefined,
        duration: duration.trim() || undefined,
      });

      setFeedback(result);
      if (result.ok) {
        setXUrl("");
        setTitle("");
        setAiredAt("");
        setDuration("");
        setLookupMessage(null);
        setLookupStatus("idle");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-[var(--radius-xl)] border border-border/80 bg-surface/40 p-5 md:p-6"
    >
      <div>
        <label
          htmlFor="recording-show"
          className="block text-sm font-medium text-text-primary"
        >
          Show
        </label>
        <select
          id="recording-show"
          value={showId}
          onChange={(event) =>
            setShowId(event.target.value as (typeof libraryShowIds)[number])
          }
          className="mt-1 w-full rounded-[var(--radius-medium)] border border-border bg-bg-primary px-3 py-2 text-text-primary"
        >
          {libraryShowIds.map((id) => (
            <option key={id} value={id}>
              {getShowById(id)?.name ?? id}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="recording-x-url"
          className="block text-sm font-medium text-text-primary"
        >
          X Space recording URL
        </label>
        <input
          id="recording-x-url"
          type="url"
          value={xUrl}
          onChange={(event) => setXUrl(event.target.value)}
          placeholder="https://x.com/i/spaces/…"
          required
          className="mt-1 w-full rounded-[var(--radius-medium)] border border-border bg-bg-primary px-3 py-2 text-text-primary"
        />
        {visibleLookupMessage && (
          <p
            className={`mt-2 text-sm ${visibleLookupStatus === "error" ? "text-live" : "text-text-secondary"}`}
            aria-live="polite"
          >
            {visibleLookupMessage}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="recording-title"
          className="block text-sm font-medium text-text-primary"
        >
          Title (optional)
        </label>
        <input
          id="recording-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-1 w-full rounded-[var(--radius-medium)] border border-border bg-bg-primary px-3 py-2 text-text-primary"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="recording-aired"
            className="block text-sm font-medium text-text-primary"
          >
            Air date
          </label>
          <input
            id="recording-aired"
            type="date"
            value={airedAt}
            onChange={(event) => setAiredAt(event.target.value)}
            className="mt-1 w-full rounded-[var(--radius-medium)] border border-border bg-bg-primary px-3 py-2 text-text-primary"
          />
        </div>
        <div>
          <label
            htmlFor="recording-duration"
            className="block text-sm font-medium text-text-primary"
          >
            Duration (optional)
          </label>
          <input
            id="recording-duration"
            type="text"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            placeholder="1h 12m"
            className="mt-1 w-full rounded-[var(--radius-medium)] border border-border bg-bg-primary px-3 py-2 text-text-primary"
          />
        </div>
      </div>

      {feedback && (
        <p
          className={`text-sm ${feedback.ok ? "text-brand-bright" : "text-live"}`}
          role="status"
        >
          {feedback.message}
        </p>
      )}

      <Button type="submit" disabled={isPending || visibleLookupStatus === "loading"}>
        {isPending ? "Saving…" : "Add recording"}
      </Button>
    </form>
  );
}
