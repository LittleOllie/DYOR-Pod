"use client";

import type { CSSProperties } from "react";
import {
  LOGO_COMPONENT_ASSETS,
  LOGO_COMPONENT_ORDER,
  LOGO_COMPONENT_SHORT,
  LOGO_LETTER_FILLED_GLOW,
  LOGO_LETTER_GHOST_FILTER,
  LOGO_LETTER_GHOST_OPACITY,
  LOGO_LETTER_SLOT_HEIGHT_PX,
  LOGO_LETTER_SLOTS,
  type LetterAnchor,
} from "@/features/mission-ascent/config/missionAssembly";
import type { HudSnapshot, LogoComponentType } from "@/features/mission-ascent/types/mission.types";
import { cn } from "@/lib/utils/cn";

type MissionAssemblyHUDProps = {
  hud: HudSnapshot;
  reducedEffects?: boolean;
  compact?: boolean;
};

function anchorStyle(anchor: LetterAnchor): CSSProperties {
  if (anchor === "right") return { right: 0, left: "auto" };
  if (anchor === "center") return { left: "50%", transform: "translateX(-50%)" };
  return { left: 0 };
}

function AssemblyLetter({
  component,
  collected,
  isNext,
  reducedEffects,
  compact,
}: {
  component: LogoComponentType;
  collected: boolean;
  isNext: boolean;
  reducedEffects?: boolean;
  compact?: boolean;
}) {
  const asset = LOGO_COMPONENT_ASSETS[component];
  const slot = LOGO_LETTER_SLOTS[component];
  const pos = anchorStyle(slot.anchor);
  const slotHeight = compact ? 36 : LOGO_LETTER_SLOT_HEIGHT_PX;
  const slotWidth = compact ? Math.round(slot.width * 0.62) : slot.width;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden",
        isNext && !collected && !reducedEffects && "animate-pulse",
      )}
      style={{ width: slotWidth, height: slotHeight }}
      title={
        collected
          ? `${LOGO_COMPONENT_SHORT[component]} recovered`
          : `${LOGO_COMPONENT_SHORT[component]} — pending`
      }
    >
      <img
        src={asset}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute top-0 h-full w-auto max-w-none select-none"
        style={{
          ...pos,
          filter: LOGO_LETTER_GHOST_FILTER,
          opacity: collected ? 0 : LOGO_LETTER_GHOST_OPACITY,
          transition: "opacity 0.35s ease",
        }}
      />
      <img
        src={asset}
        alt=""
        aria-hidden
        draggable={false}
        className={cn(
          "pointer-events-none absolute top-0 h-full w-auto max-w-none select-none transition-all duration-500 ease-out",
          collected ? "opacity-100" : "opacity-0",
        )}
        style={{
          ...pos,
          transformOrigin: slot.anchor === "right" ? "bottom right" : "bottom center",
          transform: collected
            ? `${slot.anchor === "center" ? "translateX(-50%) " : ""}scale(1)`
            : `${slot.anchor === "center" ? "translateX(-50%) " : ""}scale(0.88)`,
          filter: collected && !reducedEffects ? LOGO_LETTER_FILLED_GLOW : undefined,
        }}
      />
      {isNext && !collected && (
        <span className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-bright" />
      )}
    </div>
  );
}

export function MissionAssemblyHUD({ hud, reducedEffects, compact }: MissionAssemblyHUDProps) {
  const collectedSet = new Set(hud.assemblyCollected);
  const allLocked = hud.assemblyComplete;
  const isCompact = compact ?? false;

  return (
    <div
      className={cn(
        "pointer-events-none flex w-full flex-col items-center",
        isCompact ? "gap-0.5 px-1" : "gap-1.5 px-2",
      )}
    >
      {!isCompact && (
        <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-brand/80 sm:text-[10px]">
          Mission Assembly
        </p>
      )}

      <div
        className={cn(
          "relative rounded-[var(--radius-medium)] border",
          isCompact ? "px-2 py-1" : "px-3 py-2 sm:px-4",
          allLocked
            ? "border-brand-bright/50 bg-brand/10"
            : "border-brand/25 bg-bg-deep/70",
          allLocked && !reducedEffects && !isCompact && "shadow-[0_0_24px_rgba(49,209,198,0.2)]",
        )}
      >
        {!isCompact && (
          <div
            className="pointer-events-none absolute bottom-[9px] left-2 right-2 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
            aria-hidden
          />
        )}

        <div className="flex items-end justify-center -space-x-1 sm:space-x-0">
          {LOGO_COMPONENT_ORDER.map((component) => (
            <AssemblyLetter
              key={component}
              component={component}
              collected={collectedSet.has(component)}
              isNext={hud.nextComponent === component && !hud.assemblyComplete}
              reducedEffects={reducedEffects}
              compact={isCompact}
            />
          ))}
        </div>
      </div>

      {!isCompact && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-center">
          <p className="font-mono text-[10px] tabular-nums text-text-secondary/90 sm:text-xs">
            {hud.componentsCollected} / {hud.totalComponents} signal components recovered
          </p>
          {hud.nextComponent && !hud.assemblyComplete && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-bright">
              Next: {LOGO_COMPONENT_SHORT[hud.nextComponent]}
            </p>
          )}
        </div>
      )}

      {isCompact && hud.nextComponent && !hud.assemblyComplete && (
        <p className="text-[8px] font-semibold uppercase tracking-wider text-brand-bright/90">
          Next · {LOGO_COMPONENT_SHORT[hud.nextComponent]}
        </p>
      )}

      {hud.componentToast && !isCompact && (
        <p className="rounded border border-brand/35 bg-bg-deep/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-bright backdrop-blur-sm">
          {hud.componentToast}
        </p>
      )}

      {hud.assemblyComplete && !hud.signalBoostActive && !isCompact && (
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-bright">
          DYOR Signal Complete
        </p>
      )}
    </div>
  );
}
