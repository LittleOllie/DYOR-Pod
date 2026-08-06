"use client";

import { MissionAssemblyHUD } from "@/features/mission-ascent/components/MissionAssemblyHUD";
import {
  SectorIndicator,
  SectorTransitionOverlay,
} from "@/features/mission-ascent/components/SectorOverlay";
import type { HudSnapshot } from "@/features/mission-ascent/types/mission.types";
import { formatAltitude, formatScore, formatTimer } from "@/features/mission-ascent/utils/math";
import { cn } from "@/lib/utils/cn";

type MissionHUDProps = {
  hud: HudSnapshot;
  onPause: () => void;
  reducedEffects?: boolean;
};

function MeterBar({
  label,
  value,
  max = 100,
  displayText,
  warnAt,
  criticalAt,
  highIsBad = false,
  pulse = false,
  compact = false,
}: {
  label: string;
  value: number;
  max?: number;
  displayText?: string;
  warnAt?: number;
  criticalAt?: number;
  highIsBad?: boolean;
  pulse?: boolean;
  compact?: boolean;
}) {
  const pct = (value / max) * 100;
  const isWarn = warnAt !== undefined && (highIsBad ? value >= warnAt : value <= warnAt);
  const isCritical =
    criticalAt !== undefined && (highIsBad ? value >= criticalAt : value <= criticalAt);
  const shown = displayText ?? `${Math.round(value)}%`;
  return (
    <div className={cn(compact ? "min-w-[3.5rem]" : "min-w-[4.75rem] sm:min-w-[5.5rem]")}>
      <div
        className={cn(
          "flex items-center justify-between gap-1 uppercase tracking-wider text-text-secondary/80",
          compact ? "text-[8px]" : "text-[10px]",
        )}
      >
        <span>{label}</span>
        <span className="font-mono tabular-nums">{shown}</span>
      </div>
      <div
        className={cn(
          "overflow-hidden rounded-full bg-bg-primary/80 ring-1 ring-border/30",
          compact ? "mt-0.5 h-1.5" : "mt-1 h-2",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-150",
            isCritical && "bg-live",
            !isCritical && isWarn && "bg-[#e5cf59]",
            !isCritical && !isWarn && "bg-brand-bright",
            pulse && "animate-pulse",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function MissionHUD({ hud, onPause, reducedEffects }: MissionHUDProps) {
  const chainPct =
    hud.chainMaxMs > 0 ? (hud.chainTimerMs / hud.chainMaxMs) * 100 : 0;
  const fuelCritical = hud.noFuel || hud.fuel <= 15;
  const heatCritical = hud.heat >= 90;
  const sectorLabel = String(hud.sectorNumber).padStart(2, "0");

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col p-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-16 sm:p-4 sm:pb-safe sm:pt-[max(0.75rem,env(safe-area-inset-top))]">
      {/* Top survival row */}
      <div className="pointer-events-auto flex items-start justify-between gap-1.5 pr-11 sm:gap-2 sm:pr-0">
        <div
          className={cn(
            "flex flex-wrap gap-1.5 rounded-[var(--radius-medium)] border bg-bg-deep/85 backdrop-blur-md sm:gap-2 sm:px-3 sm:py-2",
            "px-2 py-1.5",
            fuelCritical || heatCritical ? "border-live/40" : "border-brand/25",
          )}
        >
          <MeterBar
            label="Fuel"
            value={hud.fuel}
            displayText={hud.fuelDisplay}
            warnAt={30}
            criticalAt={15}
            pulse={hud.noFuel || hud.fuel <= 15}
            compact
          />
          <MeterBar
            label="Heat"
            value={hud.heat}
            warnAt={70}
            criticalAt={90}
            highIsBad
            pulse={heatCritical}
            compact
          />
          <div className="hidden sm:block">
            <p className="text-[10px] uppercase tracking-wider text-text-secondary/80">Hull</p>
            <p className="font-mono text-sm font-bold text-text-primary">
              {hud.integrity}/{hud.maxIntegrity}
              {hud.shield && (
                <span className="ml-1 rounded border border-brand/40 bg-brand/15 px-1 text-[10px] text-brand-bright">
                  SHD
                </span>
              )}
            </p>
          </div>
          <div className="sm:hidden">
            <p className="text-[8px] uppercase tracking-wider text-text-secondary/80">Hull</p>
            <p className="font-mono text-[11px] font-bold text-text-primary">
              {hud.integrity}/{hud.maxIntegrity}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-1.5 sm:gap-2">
          {hud.timerSeconds !== null && hud.sectorState === "playing" && (
            <div
              className={cn(
                "rounded-[var(--radius-medium)] border bg-bg-deep/85 font-mono font-bold tabular-nums backdrop-blur-md",
                "px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm",
                hud.timerCritical
                  ? "border-live/50 text-live animate-pulse"
                  : hud.timerUrgent
                    ? "border-[#e5cf59]/50 text-[#e5cf59]"
                    : "border-brand/25 text-text-primary",
              )}
            >
              {formatTimer(hud.timerSeconds)}
            </div>
          )}
          <button
            type="button"
            onClick={onPause}
            className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-medium)] border border-border bg-surface/90 text-[10px] font-bold uppercase text-text-secondary backdrop-blur-md focus-ring hover:border-brand/40 hover:text-brand-bright sm:h-10 sm:w-10 sm:text-xs"
            aria-label="Pause mission"
          >
            II
          </button>
        </div>
      </div>

      {/* Mobile — compact sector + DYOR strip */}
      <div className="mt-1.5 flex flex-col gap-1 sm:hidden">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <p className="min-w-0 truncate text-[9px] font-bold uppercase tracking-[0.14em] text-brand/85">
            Sector {sectorLabel} · {hud.sectorName}
          </p>
          {hud.maxSectorsThisRun && (
            <p className="shrink-0 font-mono text-[8px] tabular-nums text-text-secondary/60">
              {hud.sectorsCompleted}/{hud.maxSectorsThisRun}
            </p>
          )}
        </div>
        <MissionAssemblyHUD hud={hud} reducedEffects={reducedEffects} compact />
      </div>

      {/* Desktop — sector + assembly */}
      <div className="mt-2 hidden flex-col sm:flex">
        <div className="flex justify-center">
          <SectorIndicator hud={hud} />
        </div>
        <div className="mt-2 flex justify-center">
          <MissionAssemblyHUD hud={hud} reducedEffects={reducedEffects} />
        </div>
      </div>

      <SectorTransitionOverlay hud={hud} />

      {/* Toasts — centered, minimal height on mobile */}
      <div className="mt-1 flex flex-col items-center gap-1 sm:mt-2">
        {hud.timerCritical && hud.sectorState === "playing" && (
          <p className="rounded border border-live/40 bg-live/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-live backdrop-blur-sm sm:px-3 sm:py-1 sm:text-[10px]">
            Signal window closing
          </p>
        )}
        {hud.zoneToast && !hud.timerCritical && (
          <p className="rounded border border-brand/30 bg-bg-deep/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-brand-bright backdrop-blur-sm sm:px-3 sm:py-1 sm:text-[10px]">
            {hud.zoneToast}
          </p>
        )}
        {hud.eventTitle && (
          <div className="text-center">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-bright sm:text-[10px]">
              {hud.eventTitle}
            </p>
            {hud.eventHint && (
              <p className="text-[9px] text-text-secondary/80 sm:text-[10px]">{hud.eventHint}</p>
            )}
          </div>
        )}
        {hud.chainLostMessage && (
          <p className="text-[9px] uppercase tracking-wider text-live/90 sm:text-[10px]">
            {hud.chainLostMessage}
          </p>
        )}
      </div>

      {/* Bottom stats */}
      <div className="mt-auto pointer-events-auto flex items-end justify-between gap-2 sm:gap-3">
        {hud.chain > 0 && (
          <div className="rounded-[var(--radius-medium)] border border-brand/30 bg-brand/10 px-2 py-1.5 backdrop-blur-md sm:px-3 sm:py-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-brand-bright sm:text-[10px]">
              Chain ×{hud.chain}
            </p>
            <div className="mt-0.5 h-1 w-16 overflow-hidden rounded-full bg-bg-primary/60 sm:mt-1 sm:w-20">
              <div
                className="h-full bg-brand-bright transition-[width] duration-100"
                style={{ width: `${chainPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="ml-auto rounded-[var(--radius-medium)] border border-brand/20 bg-bg-deep/80 px-2 py-1.5 text-right backdrop-blur-md sm:px-3 sm:py-2">
          <p className="text-[8px] uppercase tracking-widest text-text-secondary/60 sm:text-[10px]">
            Score
          </p>
          <p className="font-mono text-xs font-bold tabular-nums text-text-primary sm:text-base">
            {formatScore(hud.score)}
          </p>
          <p className="text-[8px] text-text-secondary/70 sm:text-[10px]">
            {formatAltitude(hud.altitudeKm)}
          </p>
        </div>

        {/* Desktop-only duplicate throttle readout (mobile uses ThrottleControl) */}
        <div className="hidden rounded-[var(--radius-medium)] border border-brand/20 bg-bg-deep/80 px-3 py-2 backdrop-blur-md sm:block">
          <p className="text-[10px] uppercase tracking-widest text-text-secondary/70">Throttle</p>
          <p className="font-mono text-lg font-bold tabular-nums text-brand-bright">
            {Math.round(hud.throttle * 100)}%
          </p>
          <p className="text-[10px] uppercase tracking-wider text-brand/70">{hud.throttleZone}</p>
          {hud.overheated && (
            <p className="mt-1 text-[10px] font-bold uppercase text-live">Cooling</p>
          )}
        </div>
      </div>
    </div>
  );
}
