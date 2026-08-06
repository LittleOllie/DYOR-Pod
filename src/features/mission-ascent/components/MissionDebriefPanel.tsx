"use client";

import { Button } from "@/components/ui/Button";
import { getSectorForNumber } from "@/features/mission-ascent/progression/sectorDefinitions";
import type { MissionDebrief } from "@/features/mission-ascent/types/mission.types";
import { formatAltitude, formatScore, formatTimer } from "@/features/mission-ascent/utils/math";
import { cn } from "@/lib/utils/cn";

const END_CAUSE_LABELS: Record<MissionDebrief["endCause"], string> = {
  "timed-complete": "Mission run complete",
  "fuel-depleted": "Fuel depleted",
  "hull-lost": "Hull integrity lost",
  abandoned: "Mission abandoned",
  "signal-window-lost": "Signal window lost",
  "mission-run-complete": "All 5 sectors cleared",
};

function getDebriefTitle(endCause: MissionDebrief["endCause"]): string {
  if (endCause === "mission-run-complete" || endCause === "timed-complete") {
    return "Mission complete";
  }
  if (endCause === "abandoned") return "Mission ended";
  return "Mission terminated";
}

type MissionDebriefPanelProps = {
  debrief: MissionDebrief;
  onPlayAgain: () => void;
  onSwitchMode: () => void;
  onReturn: () => void;
};

export function MissionDebriefPanel({
  debrief,
  onPlayAgain,
  onSwitchMode,
  onReturn,
}: MissionDebriefPanelProps) {
  const { breakdown: b } = debrief;
  const highestSector = getSectorForNumber(debrief.highestSectorReached);
  const fastestSectorSec =
    debrief.fastestSectorCompletionMs !== null
      ? formatTimer(Math.ceil(debrief.fastestSectorCompletionMs / 1000))
      : "—";

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-bg-primary/92 p-4 backdrop-blur-md">
      <div
        className={cn(
          "my-auto w-full max-w-lg rounded-[var(--radius-xl)] border border-brand/30 bg-bg-deep/95 p-6 shadow-[0_0_48px_rgba(19,169,166,0.15)]",
          debrief.isPersonalBest && "mission-record-pulse",
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="debrief-title"
      >
        {debrief.isPersonalBest && (
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-brand-bright">
            New flight record
          </p>
        )}
        <h2 id="debrief-title" className="mt-2 text-center font-heading text-2xl font-bold text-text-primary">
          {getDebriefTitle(debrief.endCause)}
        </h2>
        <p className="mt-1 text-center text-xs uppercase tracking-widest text-text-secondary/60">
          {debrief.mode === "timed" ? "Timed run" : "Endless run"} ·{" "}
          {END_CAUSE_LABELS[debrief.endCause]}
        </p>
        {(debrief.endCause === "mission-run-complete" ||
          debrief.endCause === "timed-complete") && (
          <p className="mt-2 text-center text-sm text-brand-bright/90">
            You cleared every sector in this run. Switch to Endless mode to keep flying.
          </p>
        )}

        <p className="mt-4 text-center text-sm leading-relaxed text-text-secondary">{debrief.assessment}</p>
        <p className="mt-1 text-center text-[10px] uppercase tracking-wider text-brand/70">
          Highlight · {debrief.assessmentHighlight}
        </p>

        <dl className="mt-5 space-y-2 font-mono text-sm">
          <DebriefRow label="Sectors cleared" value={String(debrief.sectorsCompleted)} />
          <DebriefRow label="Highest sector" value={highestSector.name} />
          <DebriefRow label="Signals restored" value={String(debrief.logosCompleted)} />
          <DebriefRow label="Fastest restore" value={fastestSectorSec} />
          <DebriefRow label="Altitude" value={formatAltitude(debrief.altitudeKm)} />
          <DebriefRow label="Research collected" value={String(debrief.researchCollected)} />
          <DebriefRow label="Best chain" value={`×${debrief.bestChain}`} />
          <DebriefRow label="Fuel efficiency" value={`${debrief.fuelEfficiencyPercent}%`} />
          <DebriefRow label="Hazards avoided" value={String(debrief.hazardsAvoided)} />
          <DebriefRow
            label="Hull remaining"
            value={`${debrief.integrityRemaining}/${debrief.maxIntegrity}`}
          />
          {debrief.highestCycleReached > 0 && (
            <DebriefRow
              label="Extended cycle"
              value={String(debrief.highestCycleReached + 1)}
            />
          )}
        </dl>

        <div className="mt-6 border-t border-border/50 pt-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-text-secondary/60">Final score</p>
          <p className="font-mono text-3xl font-bold tabular-nums text-brand-bright">
            {formatScore(b.finalScore)}
          </p>
          {debrief.scoreDelta !== null && (
            <p
              className={cn(
                "mt-1 text-sm font-medium tabular-nums",
                debrief.scoreDelta >= 0 ? "text-brand-bright" : "text-live",
              )}
            >
              {debrief.scoreDelta >= 0 ? "+" : ""}
              {formatScore(debrief.scoreDelta)} vs best ({formatScore(debrief.previousBest)})
            </p>
          )}
          <p className="mt-2 text-sm font-bold uppercase tracking-wider text-text-primary">
            Rank · {debrief.rank}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button onClick={onPlayAgain} className="flex-1">
            Play again
          </Button>
          <Button variant="ghost" onClick={onSwitchMode} className="flex-1 border border-border">
            Switch mode
          </Button>
        </div>
        <button
          type="button"
          onClick={onReturn}
          className="mt-3 w-full text-sm text-text-secondary focus-ring hover:text-brand-bright"
        >
          Return to website
        </button>
      </div>
    </div>
  );
}

function DebriefRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/30 pb-2">
      <dt className="text-text-secondary/70">{label}</dt>
      <dd className="font-bold tabular-nums text-text-primary">{value}</dd>
    </div>
  );
}
