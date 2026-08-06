"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { MissionIntelPanel } from "@/features/mission-ascent/components/MissionIntelPanel";
import { useMissionAscent } from "@/features/mission-ascent/context/MissionAscentContext";
import { useMissionStorage } from "@/features/mission-ascent/hooks/useMissionStorage";
import { useReducedMotion } from "@/features/mission-ascent/hooks/useReducedMotion";
import { formatScore } from "@/features/mission-ascent/utils/math";
import type { GameMode } from "@/features/mission-ascent/types/mission.types";
import { cn } from "@/lib/utils/cn";
import { RocketGameMark } from "@/components/brand/RocketGameMark";

type MissionLauncherProps = {
  className?: string;
  compact?: boolean;
};

export function MissionLauncher({ className, compact = false }: MissionLauncherProps) {
  const { openMission, launchButtonRef, setIsTransitioning } = useMissionAscent();
  const { records, preferences, setMode, resetDiscoveredEntities } = useMissionStorage();
  const reducedMotion = useReducedMotion();
  const [intelOpen, setIntelOpen] = useState(false);
  const personalBest = Math.max(records.timedBest, records.endlessBest);

  const handleLaunch = (mode: GameMode) => {
    setMode(mode);
    if (!reducedMotion) setIsTransitioning(true);
    openMission(mode, "homepage");
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-xl)] border border-brand/30 bg-[linear-gradient(165deg,#0e2f3a_0%,#061821_45%,#040f14_100%)] p-5 shadow-[0_0_40px_rgba(19,169,166,0.1),inset_0_1px_0_rgba(49,209,198,0.1)] lg:p-6",
        className,
      )}
      data-mission-launcher
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(49,209,198,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(49,209,198,0.5) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <div className={cn("relative flex gap-5", compact ? "flex-col" : "flex-col lg:flex-row lg:items-center lg:justify-between")}>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-bright">
            Mission Simulator
          </p>
          <h3 className="mt-2 font-heading text-xl font-bold text-text-primary lg:text-2xl">
            DYOR: Mission Ascent
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary lg:text-base">
            Pilot the DYOR rocket. Gather intelligence. Avoid mission hazards. Push the throttle
            and reach maximum altitude.
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary/70">
            <span className="rounded border border-border/60 px-2 py-1">Timed · 120s</span>
            <span className="rounded border border-border/60 px-2 py-1">Endless · Fuel limit</span>
          </div>

          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-text-secondary/60">
              Personal best
            </p>
            <p className="mt-1 font-mono text-lg font-bold tabular-nums text-brand-bright">
              {personalBest > 0 ? formatScore(personalBest) : "— — —"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-4 lg:items-end">
          {!compact && (
            <RocketGameMark size={56} className="opacity-90 motion-reduce:animate-none" />
          )}
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:flex-col">
            <Button
              ref={launchButtonRef}
              size="lg"
              className="min-h-[50px] w-full uppercase tracking-[0.12em] lg:min-w-[200px]"
              onClick={() => handleLaunch(preferences.lastMode)}
              aria-label="Launch Mission — DYOR Mission Ascent"
            >
              Launch Mission
            </Button>
            <div className="flex gap-2">
              <button
                type="button"
                className={cn(
                  "flex-1 rounded-[var(--radius-medium)] border px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors focus-ring",
                  preferences.lastMode === "timed"
                    ? "border-brand/40 bg-brand/10 text-brand-bright"
                    : "border-border text-text-secondary hover:border-brand/30",
                )}
                onClick={() => setMode("timed")}
              >
                Timed
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 rounded-[var(--radius-medium)] border px-3 py-2 text-xs font-medium uppercase tracking-wider transition-colors focus-ring",
                  preferences.lastMode === "endless"
                    ? "border-brand/40 bg-brand/10 text-brand-bright"
                    : "border-border text-text-secondary hover:border-brand/30",
                )}
                onClick={() => setMode("endless")}
              >
                Endless
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIntelOpen(true)}
              className="w-full rounded-[var(--radius-medium)] border border-border px-3 py-2 text-xs font-medium uppercase tracking-wider text-text-secondary focus-ring hover:border-brand/30 hover:text-brand-bright"
            >
              Mission Intel
            </button>
          </div>
        </div>
      </div>

      <MissionIntelPanel
        open={intelOpen}
        onClose={() => setIntelOpen(false)}
        onResetTips={resetDiscoveredEntities}
      />

      <p className="relative mt-4 font-mono text-[10px] uppercase tracking-widest text-brand/50" aria-hidden="true">
        Telemetry · Signal locked · Flight systems ready
      </p>
    </div>
  );
}
