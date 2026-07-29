import { cn } from "@/lib/utils/cn";
import type { EventStatus } from "@/lib/schedule/types";

type StatusPillProps = {
  status: EventStatus | "live-now" | "next-space";
  className?: string;
};

const labels: Record<StatusPillProps["status"], string> = {
  upcoming: "Upcoming",
  live: "Live Now",
  "live-now": "Live Now",
  "recently-ended": "Recently Ended",
  "schedule-pending": "Schedule Pending",
  "new-episode": "New Episode",
  "listen-now": "Listen Now",
  "next-space": "Next Live Space",
};

const styles: Record<StatusPillProps["status"], string> = {
  upcoming: "bg-brand/15 text-brand-bright border-brand/30",
  live: "bg-live/20 text-live border-live/40",
  "live-now": "bg-live/20 text-live border-live/40",
  "recently-ended": "bg-surface-raised text-text-secondary border-border",
  "schedule-pending": "bg-gold/10 text-gold border-gold/30",
  "new-episode": "bg-brand/15 text-brand-bright border-brand/30",
  "listen-now": "bg-success/15 text-success border-success/30",
  "next-space": "bg-brand/15 text-brand-bright border-brand/30",
};

export function StatusPill({ status, className }: StatusPillProps) {
  const isLive = status === "live" || status === "live-now";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        styles[status],
        isLive && "animate-pulse-live",
        className,
      )}
    >
      {isLive && (
        <span className="h-1.5 w-1.5 rounded-full bg-live" aria-hidden="true" />
      )}
      {labels[status]}
    </span>
  );
}
