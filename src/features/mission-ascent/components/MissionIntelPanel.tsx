"use client";

import { Button } from "@/components/ui/Button";
import type { CSSProperties } from "react";
import {
  LOGO_COMPONENT_ASSETS,
  LOGO_COMPONENT_ORDER,
  LOGO_LETTER_GHOST_FILTER,
  LOGO_LETTER_GHOST_OPACITY,
  LOGO_LETTER_SLOT_HEIGHT_PX,
  LOGO_LETTER_SLOTS,
} from "@/features/mission-ascent/config/missionAssembly";
import {
  collectibleDefinitions,
  hazardDefinitions,
} from "@/features/mission-ascent/config/entityDefinitions";
import { EntityPreviewCanvas } from "@/features/mission-ascent/rendering/EntityPreviewCanvas";
import { cn } from "@/lib/utils/cn";

type MissionIntelPanelProps = {
  open: boolean;
  onClose: () => void;
  onResetTips?: () => void;
};

const COLLECTIBLE_HINTS: Record<string, string> = {
  research: "Increases research score and chains",
  "data-cube": "High-value data cluster",
  fuel: "Restores fuel reserves",
  shield: "Absorbs one collision",
  cooling: "Reduces engine heat",
  "signal-beacon": "Temporary research bonus",
};

const HAZARD_HINTS: Record<string, string> = {
  asteroid: "Damages hull on impact",
  debris: "Broken satellite machinery",
  radiation: "Energised barrier — damages hull",
  drone: "Active scanning threat",
  "fud-cloud": "Corrupted signal interference",
  "rug-signal": "Deceptive false signal",
};

export function MissionIntelPanel({ open, onClose, onResetTips }: MissionIntelPanelProps) {
  if (!open) return null;

  const collectibles = Object.values(collectibleDefinitions);
  const hazards = Object.values(hazardDefinitions).filter((h) => h.damage > 0 || h.type === "fud-cloud");

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center overflow-y-auto bg-bg-primary/92 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-intel-title"
    >
      <div className="my-auto w-full max-w-3xl rounded-[var(--radius-xl)] border border-brand/30 bg-bg-deep/95 p-5 shadow-[0_0_48px_rgba(19,169,166,0.15)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-bright">
              Mission Intel
            </p>
            <h2 id="mission-intel-title" className="mt-1 font-heading text-xl font-bold text-text-primary">
              Recover the DYOR Signal
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-text-secondary focus-ring hover:text-brand-bright"
            aria-label="Close mission intel"
          >
            ×
          </button>
        </div>

        <section className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-brand/80">Mission objective</h3>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Collect D, Y, O, and R. Complete the signal to activate Signal Boost.
            Avoid hazards and manage fuel to keep flying.
          </p>
          <div className="mt-3 flex items-end justify-center -space-x-0.5 rounded-[var(--radius-medium)] border border-brand/25 bg-bg-primary/50 px-3 py-3">
            {LOGO_COMPONENT_ORDER.map((component) => {
              const slot = LOGO_LETTER_SLOTS[component];
              const pos: CSSProperties =
                slot.anchor === "right"
                  ? { right: 0, left: "auto" }
                  : { left: 0 };
              return (
                <div
                  key={component}
                  className="relative shrink-0 overflow-hidden"
                  style={{ width: slot.width, height: LOGO_LETTER_SLOT_HEIGHT_PX }}
                >
                  <img
                    src={LOGO_COMPONENT_ASSETS[component]}
                    alt=""
                    className="absolute top-0 h-full w-auto max-w-none"
                    style={{
                      ...pos,
                      filter: LOGO_LETTER_GHOST_FILTER,
                      opacity: LOGO_LETTER_GHOST_OPACITY,
                    }}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand/80">Controls</h3>
            <dl className="mt-2 space-y-2 text-sm text-text-secondary">
              <div>
                <dt className="font-semibold text-text-primary">Desktop</dt>
                <dd className="mt-1 text-xs leading-relaxed">
                  A / D or Arrow Keys — steer
                  <br />
                  W / S or Arrow Keys — throttle
                  <br />
                  Escape — pause
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-text-primary">Mobile</dt>
                <dd className="mt-1 text-xs leading-relaxed">
                  Drag left and right — steer
                  <br />
                  Drag throttle lever — speed
                </dd>
              </div>
            </dl>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand/80">Throttle</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              More throttle increases altitude and score, but burns fuel faster, creates heat, and
              gives you less reaction time.
            </p>
          </section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand/80">Collectibles</h3>
            <ul className="mt-3 space-y-2">
              {collectibles.map((item) => (
                <li key={item.type} className="flex items-center gap-3 rounded border border-border/40 bg-bg-primary/40 px-3 py-2">
                  <EntityPreviewCanvas kind="collectible" type={item.type} size={44} />
                  <div>
                    <p className="text-xs font-bold text-text-primary">{item.label}</p>
                    <p className="text-[10px] text-text-secondary/80">
                      {COLLECTIBLE_HINTS[item.type]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand/80">Hazards</h3>
            <ul className="mt-3 space-y-2">
              {hazards.map((item) => (
                <li key={item.type} className="flex items-center gap-3 rounded border border-border/40 bg-bg-primary/40 px-3 py-2">
                  <EntityPreviewCanvas kind="hazard" type={item.type} size={44} />
                  <div>
                    <p className="text-xs font-bold text-text-primary">{item.label}</p>
                    <p className="text-[10px] text-text-secondary/80">
                      {HAZARD_HINTS[item.type]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-5 border-t border-border/40 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-brand/80">Mission end</h3>
          <p className="mt-2 text-sm text-text-secondary">
            The mission ends when fuel reaches zero, hull integrity reaches zero, or the timed mission
            expires.
          </p>
        </section>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button onClick={onClose} className="flex-1">
            Got it
          </Button>
          {onResetTips && (
            <Button variant="ghost" onClick={onResetTips} className="flex-1 border border-border">
              Reset item tips
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
