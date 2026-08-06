import type { ShowIdentityCue } from "@/types/content";
import { cn } from "@/lib/utils/cn";

type ShowIdentityCueProps = {
  cue: ShowIdentityCue;
  className?: string;
};

/** Subtle per-show motif — stays within the shared DYOR mission-control palette. */
export function ShowIdentityCue({ cue, className }: ShowIdentityCueProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden opacity-[0.14] motion-reduce:opacity-[0.08]",
        className,
      )}
      aria-hidden="true"
    >
      {cue === "chart" && <ChartCue />}
      {cue === "briefing" && <BriefingCue />}
      {cue === "signal" && <SignalCue />}
      {cue === "audio" && <AudioCue />}
    </div>
  );
}

function ChartCue() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 200 160"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={`h-${i}`}
          x1="0"
          y1={24 + i * 28}
          x2="200"
          y2={24 + i * 28}
          stroke="currentColor"
          strokeOpacity="0.35"
          strokeWidth="0.5"
          className="text-brand-bright"
        />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line
          key={`v-${i}`}
          x1={20 + i * 32}
          y1="0"
          x2={20 + i * 32}
          y2="160"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth="0.5"
          className="text-brand-bright"
        />
      ))}
      <polyline
        points="16,112 48,88 72,96 96,52 120,64 144,36 176,48"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand-bright"
      />
      <rect x="52" y="72" width="8" height="24" fill="currentColor" className="text-brand" />
      <rect x="88" y="56" width="8" height="40" fill="currentColor" className="text-brand" />
      <rect x="124" y="44" width="8" height="52" fill="currentColor" className="text-brand" />
    </svg>
  );
}

function BriefingCue() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 200 160"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <circle
        cx="100"
        cy="80"
        r="56"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="0.75"
        className="text-brand-bright"
      />
      <circle
        cx="100"
        cy="80"
        r="36"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="0.75"
        className="text-brand-bright"
      />
      <path
        d="M100 80 L100 36 A44 44 0 0 1 144 80 Z"
        fill="currentColor"
        fillOpacity="0.12"
        className="text-brand"
      />
      <line
        x1="100"
        y1="80"
        x2="148"
        y2="80"
        stroke="currentColor"
        strokeWidth="1"
        className="text-brand-bright"
      />
      <rect
        x="18"
        y="18"
        width="28"
        height="18"
        rx="3"
        stroke="currentColor"
        strokeOpacity="0.4"
        className="text-brand-bright"
      />
    </svg>
  );
}

function SignalCue() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 200 160"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line
          key={i}
          x1="0"
          y1={20 + i * 24}
          x2="200"
          y2={20 + i * 24}
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="0.5"
          className="text-brand-bright"
        />
      ))}
      <path
        d="M24 88 L48 72 L72 92 L96 56 L120 68 L144 44 L168 52"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        className="text-brand-bright"
      />
      <circle cx="144" cy="44" r="5" fill="currentColor" className="text-brand" />
      <path
        d="M156 28 L168 40 L192 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-brand-bright"
      />
    </svg>
  );
}

function AudioCue() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 200 160"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {[12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 144].map((x, i) => {
        const heights = [24, 40, 56, 32, 48, 64, 36, 52, 44, 60, 28, 40];
        const h = heights[i] ?? 32;
        return (
          <rect
            key={x}
            x={x}
            y={80 - h / 2}
            width="6"
            height={h}
            rx="2"
            fill="currentColor"
            fillOpacity={0.25 + (i % 3) * 0.12}
            className="text-gold"
          />
        );
      })}
      <ellipse
        cx="100"
        cy="128"
        rx="28"
        ry="8"
        fill="currentColor"
        fillOpacity="0.1"
        className="text-gold"
      />
    </svg>
  );
}
