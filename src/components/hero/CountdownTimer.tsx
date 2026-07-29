"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import {
  formatCountdownAccessible,
  getCountdownParts,
} from "@/lib/schedule/formatEventTime";
import type { CountdownParts } from "@/lib/schedule/types";
import { cn } from "@/lib/utils/cn";

type CountdownTimerProps = {
  targetDate: string;
  onComplete?: () => void;
};

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center px-1">
      <span className="font-heading text-2xl font-bold tabular-nums text-text-primary md:text-3xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-text-secondary md:text-xs">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ targetDate, onComplete }: CountdownTimerProps) {
  const target = new Date(targetDate).getTime();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [parts, setParts] = useState<CountdownParts>(() =>
    getCountdownParts(new Date(target)),
  );

  useEffect(() => {
    if (!mounted) return;

    const tick = () => {
      const now = new Date();
      const next = getCountdownParts(new Date(target), now);
      setParts(next);
      if (next.totalMs <= 0) onComplete?.();
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, mounted, onComplete]);

  const timerShell = cn(
    "grid grid-cols-4 divide-x divide-border rounded-[var(--radius-medium)] border border-border bg-bg-primary/40 py-3",
  );

  if (!mounted) {
    return (
      <div className={timerShell} aria-hidden="true">
        {["Days", "Hours", "Mins", "Secs"].map((l) => (
          <CountdownUnit key={l} value={0} label={l} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className={timerShell} aria-hidden="true">
        <CountdownUnit value={parts.days} label="Days" />
        <CountdownUnit value={parts.hours} label="Hours" />
        <CountdownUnit value={parts.minutes} label="Mins" />
        <CountdownUnit value={parts.seconds} label="Secs" />
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {formatCountdownAccessible(parts)}
      </p>
    </div>
  );
}
