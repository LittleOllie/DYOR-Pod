"use client";

import { useEffect, useState } from "react";
import { RocketGameMark } from "@/components/brand/RocketGameMark";
import { useReducedMotion } from "@/features/mission-ascent/hooks/useReducedMotion";
import { cn } from "@/lib/utils/cn";

type MissionLaunchTransitionProps = {
  active: boolean;
  onComplete: () => void;
};

function MissionLaunchTransitionInner({ onComplete }: { onComplete: () => void }) {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<"animating" | "done">("animating");
  const [shake, setShake] = useState(true);

  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }

    const shakeTimer = window.setTimeout(() => setShake(false), 400);
    const completeTimer = window.setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 1100);

    return () => {
      window.clearTimeout(shakeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [reducedMotion, onComplete]);

  if (phase === "done") return null;

  const logoAnchor =
    typeof document !== "undefined"
      ? document.querySelector("[data-dyor-logo-anchor]")
      : null;
  const rect = logoAnchor?.getBoundingClientRect();
  const anchorVisible =
    rect &&
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.top < window.innerHeight;
  const startX = anchorVisible ? rect.left + rect.width * 0.72 : window.innerWidth / 2;
  const startY = anchorVisible
    ? rect.top + rect.height * 0.45
    : window.innerHeight * 0.42;
  const useCenterIgnition = !anchorVisible;

  return (
    <div className="pointer-events-none fixed inset-0 z-[250]" aria-hidden="true">
      <div
        className={cn(
          "absolute inset-0 bg-bg-primary/70 transition-opacity duration-500",
          phase === "animating" && "opacity-100",
        )}
      />
      <div
        className={cn(
          "mission-launch-rocket absolute transition-none",
          shake && "mission-launch-shake",
          phase === "animating" &&
            (useCenterIgnition ? "mission-launch-ignite" : "mission-launch-fly"),
        )}
        style={{
          left: startX,
          top: startY,
          ["--launch-start-x" as string]: `${startX}px`,
          ["--launch-start-y" as string]: `${startY}px`,
        }}
      >
        <RocketGameMark className="h-10 w-10 text-brand-bright" />
      </div>
    </div>
  );
}

export function MissionLaunchTransition({
  active,
  onComplete,
}: MissionLaunchTransitionProps) {
  if (!active) return null;
  return <MissionLaunchTransitionInner onComplete={onComplete} />;
}
