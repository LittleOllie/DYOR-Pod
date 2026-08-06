"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

type PauseMenuProps = {
  open: boolean;
  audioEnabled: boolean;
  reducedEffects: boolean;
  hasProgress: boolean;
  onResume: () => void;
  onRestart: () => void;
  onToggleAudio: () => void;
  onToggleReducedEffects: () => void;
  onAbandon: () => void;
  onClose: () => void;
  onOpenIntel?: () => void;
};

export function PauseMenu({
  open,
  audioEnabled,
  reducedEffects,
  hasProgress,
  onResume,
  onRestart,
  onToggleAudio,
  onToggleReducedEffects,
  onAbandon,
  onClose,
  onOpenIntel,
}: PauseMenuProps) {
  if (!open) return null;

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-bg-primary/90 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-menu-title"
    >
      <div className="mx-4 w-full max-w-sm rounded-[var(--radius-xl)] border border-brand/30 bg-bg-deep/95 p-6 shadow-[0_0_48px_rgba(19,169,166,0.12)]">
        <h2 id="pause-menu-title" className="font-heading text-xl font-bold text-text-primary">
          Mission paused
        </h2>
        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={onResume} className="w-full">
            Resume
          </Button>
          <Button
            variant="ghost"
            onClick={onRestart}
            className="w-full border border-border"
          >
            {hasProgress ? "Restart mission" : "Restart"}
          </Button>
          <button
            type="button"
            onClick={onToggleAudio}
            className="rounded-[var(--radius-medium)] border border-border px-4 py-2.5 text-sm text-text-secondary focus-ring hover:border-brand/30"
          >
            Audio: {audioEnabled ? "On" : "Off"}
          </button>
          <button
            type="button"
            onClick={onToggleReducedEffects}
            className="rounded-[var(--radius-medium)] border border-border px-4 py-2.5 text-sm text-text-secondary focus-ring hover:border-brand/30"
          >
            Reduced effects: {reducedEffects ? "On" : "Off"}
          </button>
          {onOpenIntel && (
            <button
              type="button"
              onClick={onOpenIntel}
              className="rounded-[var(--radius-medium)] border border-border px-4 py-2.5 text-sm text-text-secondary focus-ring hover:border-brand/30"
            >
              Mission Intel
            </button>
          )}
          <button
            type="button"
            onClick={onAbandon}
            className="rounded-[var(--radius-medium)] px-4 py-2.5 text-sm text-live focus-ring hover:underline"
          >
            Abandon mission
          </button>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 text-sm text-text-secondary/70 focus-ring hover:text-brand-bright"
          >
            Return to website
          </button>
        </div>
        <p className="mt-4 text-center text-[10px] text-text-secondary/50">
          Esc · Pause · R · Restart (when paused)
        </p>
      </div>
    </div>
  );
}
