"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";

type ThrottleControlProps = {
  value: number;
  onChange: (value: number) => void;
  overheated?: boolean;
  disabled?: boolean;
  noFuel?: boolean;
  className?: string;
};

const ZONE_LABELS = [
  { at: 0, label: "IDLE" },
  { at: 0.25, label: "CRUISE" },
  { at: 0.6, label: "HIGH" },
  { at: 0.85, label: "BOOST" },
];

function getZoneLabel(value: number): string {
  let label = ZONE_LABELS[0].label;
  for (const zone of ZONE_LABELS) {
    if (value >= zone.at) label = zone.label;
  }
  return label;
}

export function ThrottleControl({
  value,
  onChange,
  overheated,
  disabled,
  noFuel,
  className,
}: ThrottleControlProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [horizontal, setHorizontal] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setHorizontal(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const ratio = horizontal
        ? (clientX - rect.left) / rect.width
        : 1 - (clientY - rect.top) / rect.height;
      onChange(Math.max(0, Math.min(1, ratio)));
    },
    [horizontal, onChange],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    dragging.current = true;
    trackRef.current?.setPointerCapture(e.pointerId);
    updateFromPointer(e.clientX, e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromPointer(e.clientX, e.clientY);
  };

  const onPointerUp = () => {
    dragging.current = false;
  };

  const pct = Math.round(value * 100);
  const zoneLabel = getZoneLabel(value);
  const fillClass = cn(
    overheated ? "bg-live/60" : "bg-brand-bright/70",
    !horizontal && value > 0.85 && "shadow-[0_0_16px_rgba(49,209,198,0.5)]",
  );

  return (
    <div
      className={cn(
        "pointer-events-auto flex rounded-[var(--radius-medium)] border border-brand/25 bg-bg-deep/80 backdrop-blur-sm select-none",
        horizontal
          ? "flex-col items-stretch gap-1.5 px-3 py-2 sm:flex-row sm:items-center sm:gap-2 sm:px-2.5 sm:py-1.5"
          : "flex-col items-center gap-2 p-3",
        className,
      )}
      style={{ WebkitUserSelect: "none", WebkitTouchCallout: "none" } as CSSProperties}
      role="slider"
      aria-label="Throttle control"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={`${pct} percent, ${zoneLabel}`}
    >
      <p
        className={cn(
          "shrink-0 font-semibold uppercase text-brand/80",
          horizontal ? "text-[9px] tracking-[0.18em]" : "text-[10px] tracking-[0.2em]",
        )}
      >
        Throttle
      </p>

      {horizontal ? (
        <>
          <p className="text-center text-[9px] font-semibold uppercase tracking-[0.16em] text-text-secondary/75 sm:hidden">
            Slide bar to set throttle · steer on the playfield
          </p>
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              aria-label="Reduce throttle"
              disabled={disabled}
              onClick={() => onChange(Math.max(0, value - 0.12))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-bg-primary/80 text-sm font-bold text-brand-bright focus-ring disabled:opacity-40 sm:hidden"
            >
              −
            </button>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div
                ref={trackRef}
                className="relative flex h-11 min-w-0 flex-1 cursor-ew-resize touch-none items-center rounded-full bg-bg-primary/80 px-1 sm:h-2.5 sm:px-0"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <div className="relative h-3 w-full rounded-full bg-bg-deep/50 sm:h-full sm:bg-transparent">
                  <div
                    className={cn("absolute inset-y-0 left-0 rounded-full transition-[width] duration-75", fillClass)}
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-center font-mono text-[10px] font-bold tabular-nums text-brand-bright sm:hidden">
                {pct}% · {zoneLabel}
              </p>
            </div>
            <button
              type="button"
              aria-label="Increase throttle"
              disabled={disabled}
              onClick={() => onChange(Math.min(1, value + 0.12))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-bg-primary/80 text-sm font-bold text-brand-bright focus-ring disabled:opacity-40 sm:hidden"
            >
              +
            </button>
            <p className="hidden w-8 shrink-0 font-mono text-[11px] font-bold tabular-nums text-brand-bright sm:block">
              {pct}%
            </p>
          </div>
        </>
      ) : (
        <>
          <div
            ref={trackRef}
            className="relative h-44 w-10 cursor-ns-resize touch-none"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="absolute inset-x-2 inset-y-0 rounded-full bg-bg-primary/80" />
            <div
              className={cn(
                "absolute inset-x-2 bottom-0 rounded-full transition-[height] duration-75",
                fillClass,
              )}
              style={{ height: `${value * 100}%` }}
            />
            <div
              className="absolute left-1/2 h-4 w-8 -translate-x-1/2 rounded border-2 border-brand-bright bg-surface shadow-[0_0_12px_rgba(49,209,198,0.4)]"
              style={{ bottom: `calc(${value * 100}% - 8px)` }}
            />
            <div className="absolute -right-8 top-0 text-[9px] uppercase text-text-secondary/50">Boost</div>
            <div className="absolute -right-8 bottom-0 text-[9px] uppercase text-text-secondary/50">Idle</div>
          </div>
          <p className="font-mono text-sm font-bold tabular-nums text-brand-bright">{pct}%</p>
          <p className="text-[10px] uppercase tracking-wider text-brand/70">{zoneLabel}</p>
        </>
      )}

      {noFuel && (
        <p className="text-[9px] font-bold uppercase tracking-wider text-live sm:text-[10px]">No fuel</p>
      )}
    </div>
  );
}
