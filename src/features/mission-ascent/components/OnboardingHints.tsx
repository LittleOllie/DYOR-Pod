"use client";

import { cn } from "@/lib/utils/cn";

const HINTS: Record<string, string> = {
  assembly: "Recover all four DYOR letters",
  steer: "Drag to steer",
  throttle: "Move the throttle lever",
  component: "Move to intercept signal modules",
  survive: "Avoid hazards — manage fuel",
};

type OnboardingHintsProps = {
  activeHint: string | null;
  className?: string;
};

export function OnboardingHints({ activeHint, className }: OnboardingHintsProps) {
  if (!activeHint || !HINTS[activeHint]) return null;
  return (
    <div
      className={cn(
        "pointer-events-none absolute left-1/2 top-1/3 z-30 -translate-x-1/2 rounded-[var(--radius-medium)] border border-brand/35 bg-bg-deep/90 px-4 py-2 text-center backdrop-blur-md",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-bright">
        {HINTS[activeHint]}
      </p>
    </div>
  );
}

export { HINTS };
