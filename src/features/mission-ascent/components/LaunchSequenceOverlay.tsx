"use client";

import { cn } from "@/lib/utils/cn";

type LaunchSequenceOverlayProps = {
  visible: boolean;
  step: number;
  onSkip?: () => void;
  skippable?: boolean;
};

const STEPS = [
  "Initialising flight systems",
  "Flight control ........ ONLINE",
  "Research uplink ....... CONNECTED",
  "Telemetry ............. ACTIVE",
  "Navigation ............ LOCKED",
  "T–3",
  "T–2",
  "T–1",
  "IGNITION",
];

export function LaunchSequenceOverlay({
  visible,
  step,
  onSkip,
  skippable,
}: LaunchSequenceOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-bg-primary/85 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-[var(--radius-xl)] border border-brand/30 bg-bg-deep/90 p-6 text-center shadow-[0_0_40px_rgba(19,169,166,0.15)]">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-bright">
          Launch sequence
        </p>
        <div className="mt-6 space-y-2 font-mono text-sm text-text-secondary">
          {STEPS.slice(0, Math.min(step + 1, STEPS.length)).map((line, i) => (
            <p
              key={line}
              className={cn(
                i === step && "text-brand-bright",
                i === STEPS.length - 1 && step >= STEPS.length - 1 && "text-lg font-bold text-text-primary",
              )}
            >
              {line}
            </p>
          ))}
        </div>
        {step >= 8 && (
          <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-brand-bright animate-pulse">
            Pilot control granted
          </p>
        )}
        {skippable && onSkip && step < 8 && (
          <button
            type="button"
            onClick={onSkip}
            className="mt-6 text-xs text-text-secondary/70 underline-offset-4 hover:text-brand-bright hover:underline focus-ring"
          >
            Skip sequence
          </button>
        )}
      </div>
    </div>
  );
}
