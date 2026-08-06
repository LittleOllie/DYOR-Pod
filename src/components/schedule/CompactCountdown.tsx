"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import {
  formatCountdownAccessible,
  getCountdownParts,
} from "@/lib/schedule/formatEventTime";
import type { CountdownParts } from "@/lib/schedule/types";
import { cn } from "@/lib/utils/cn";

type CompactCountdownProps = {
  targetDate: string;
  className?: string;
};

const UNITS = [
  { key: "days", label: "Days", mobileLabel: "D" },
  { key: "hours", label: "Hrs", mobileLabel: "H" },
  { key: "minutes", label: "Min", mobileLabel: "M" },
  { key: "seconds", label: "Sec", mobileLabel: "S" },
] as const;

function CompactUnit({
  value,
  label,
  mobileLabel,
}: {
  value: number;
  label: string;
  mobileLabel: string;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      <span className="font-heading text-sm font-bold tabular-nums leading-none text-text-primary md:text-lg">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-0.5 text-[8px] font-medium uppercase tracking-wide text-text-secondary md:text-[9px] md:tracking-wider">
        <span className="md:hidden">{mobileLabel}</span>
        <span className="hidden md:inline">{label}</span>
      </span>
    </div>
  );
}

export function CompactCountdown({ targetDate, className }: CompactCountdownProps) {
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

    const tick = () => setParts(getCountdownParts(new Date(target)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, mounted]);

  const shell = cn(
    "grid w-full grid-cols-4 gap-0.5 rounded-[var(--radius-medium)] border border-border/80 bg-bg-primary/50 px-1 py-1.5 md:gap-0 md:px-2 md:py-2",
    className,
  );

  if (!mounted) {
    return (
      <div className={shell} aria-hidden="true">
        {UNITS.map((unit) => (
          <CompactUnit key={unit.key} value={0} label={unit.label} mobileLabel={unit.mobileLabel} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className={shell} aria-hidden="true">
        <CompactUnit value={parts.days} label="Days" mobileLabel="D" />
        <CompactUnit value={parts.hours} label="Hrs" mobileLabel="H" />
        <CompactUnit value={parts.minutes} label="Min" mobileLabel="M" />
        <CompactUnit value={parts.seconds} label="Sec" mobileLabel="S" />
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {formatCountdownAccessible(parts)}
      </p>
    </div>
  );
}
