"use client";

import type { HudSnapshot } from "@/features/mission-ascent/types/mission.types";
import { formatScore, formatTimer } from "@/features/mission-ascent/utils/math";

export function SectorIndicator({ hud }: { hud: HudSnapshot }) {
  const sectorLabel = String(hud.sectorNumber).padStart(2, "0");

  return (
    <div className="pointer-events-none flex flex-col items-center gap-0.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-brand/80">
        Sector {sectorLabel}
        {hud.isExtendedMission && (
          <span className="ml-2 text-brand-bright/80">· Extended {hud.sectorCycle + 1}</span>
        )}
      </p>
      <p className="font-heading text-sm font-bold uppercase tracking-wider text-text-primary sm:text-base">
        {hud.sectorName}
      </p>
      <p className="text-[10px] text-text-secondary/70">{hud.sectorSubtitle}</p>
      {hud.maxSectorsThisRun && (
        <p className="text-[9px] font-mono uppercase tracking-wider text-text-secondary/50">
          {hud.sectorsCompleted} / {hud.maxSectorsThisRun} mission sectors
        </p>
      )}
      {!hud.maxSectorsThisRun && hud.sectorNumber <= 8 && (
        <p className="text-[9px] font-mono uppercase tracking-wider text-text-secondary/50">
          {Math.min(hud.sectorsCompleted, 8)} / 8 core sectors
        </p>
      )}
      {hud.difficultyLabel && hud.sectorNumber > 2 && (
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-text-secondary/60">
          {hud.difficultyLabel}
        </p>
      )}
    </div>
  );
}

export function SectorTransitionOverlay({ hud }: { hud: HudSnapshot }) {
  if (
    hud.sectorState === "playing" ||
    !hud.sectorTransitionMessage
  ) {
    return null;
  }

  const summary = hud.sectorCompleteSummary;

  return (
    <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-bg-primary/25 backdrop-blur-[2px]">
      <div className="mx-4 max-w-md rounded-[var(--radius-xl)] border border-brand/35 bg-bg-deep/90 px-6 py-5 text-center shadow-[0_0_48px_rgba(49,209,198,0.15)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-brand-bright">
          {hud.sectorTransitionMessage}
        </p>
        {hud.sectorTransitionSubtext && (
          <p className="mt-2 font-heading text-xl font-bold uppercase tracking-wider text-text-primary sm:text-2xl">
            {hud.sectorTransitionSubtext}
          </p>
        )}
        {summary && hud.sectorState === "sector-transition" && (
          <dl className="mt-4 space-y-1 font-mono text-[11px] tabular-nums text-text-secondary">
            <div className="flex justify-between gap-4">
              <dt>Completion</dt>
              <dd>{formatTimer(Math.ceil(summary.completionTimeMs / 1000))}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Fuel</dt>
              <dd>{Math.round(summary.fuelRemainingPercent)}%</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Hull</dt>
              <dd>
                {summary.hullRemaining}/{summary.maxHull}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border/40 pt-2 text-brand-bright">
              <dt>Sector bonus</dt>
              <dd>+{formatScore(summary.sectorBonus)}</dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
}
