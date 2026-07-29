import { StatusPill } from "@/components/ui/StatusPill";
import type { EventStatus } from "@/lib/schedule/types";

type LiveBadgeProps = {
  status: EventStatus;
};

export function LiveBadge({ status }: LiveBadgeProps) {
  if (status === "live") {
    return <StatusPill status="live-now" />;
  }
  if (status === "schedule-pending") {
    return null;
  }
  if (status === "upcoming") {
    return <StatusPill status="next-space" />;
  }
  return <StatusPill status={status} />;
}
