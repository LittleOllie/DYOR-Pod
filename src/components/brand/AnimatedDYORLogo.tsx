"use client";

import Image from "next/image";
import {
  LOGO_CANVAS,
  logoFinalSrc,
  logoLayers,
  type LogoIntroPhase,
  type LogoLayerId,
} from "@/content/brandLogo";
import { cn } from "@/lib/utils/cn";

type AnimatedDYORLogoProps = {
  phase: LogoIntroPhase;
  reducedMotion?: boolean;
  className?: string;
};

function getLayerState(
  layerId: LogoLayerId,
  phase: LogoIntroPhase,
): "hidden" | "enter" | "settled" {
  if (phase === "idle") return "hidden";

  if (layerId === "flame") {
    if (phase === "flame") return "enter";
    return "settled";
  }

  if (layerId === "rocket") {
    if (phase === "flame") return "hidden";
    if (phase === "rocket") return "enter";
    return "settled";
  }

  if (phase === "letters") return "enter";
  if (phase === "complete") return "settled";
  return "hidden";
}

function getLayerClassName(layerId: LogoLayerId, phase: LogoIntroPhase): string {
  const state = getLayerState(layerId, phase);

  if (state === "hidden") return "logo-layer-hidden";

  if (layerId === "flame") {
    return state === "enter" ? "logo-animate-flame" : "logo-flame-settled";
  }

  if (layerId === "rocket") {
    return state === "enter" ? "logo-animate-rocket" : "logo-rocket-settled";
  }

  return state === "enter" ? "logo-animate-letter" : "logo-letter-settled";
}

export function AnimatedDYORLogo({
  phase,
  reducedMotion = false,
  className,
}: AnimatedDYORLogoProps) {
  if (reducedMotion) {
    return (
      <div
        className={cn("relative w-full max-w-3xl", className)}
        style={{ aspectRatio: `${LOGO_CANVAS.width} / ${LOGO_CANVAS.height}` }}
      >
        <Image
          src={logoFinalSrc}
          alt="DYOR"
          width={LOGO_CANVAS.width}
          height={LOGO_CANVAS.height}
          className="h-full w-full object-contain logo-layer-blend"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className={cn("dyor-logo relative w-full max-w-3xl", className)}
      style={{ aspectRatio: `${LOGO_CANVAS.width} / ${LOGO_CANVAS.height}` }}
      data-phase={phase}
      aria-hidden="true"
    >
      {logoLayers.map((layer) => {
        const isFlame = layer.id === "flame";
        const isRocket = layer.id === "rocket";
        const isLetter = !isFlame && !isRocket;

        return (
          <Image
            key={layer.id}
            src={layer.src}
            alt=""
            width={LOGO_CANVAS.width}
            height={LOGO_CANVAS.height}
            className={cn(
              "absolute inset-0 h-full w-full object-contain logo-layer-blend",
              isFlame && "logo-layer-flame z-10",
              isLetter && "logo-layer-letter z-20",
              isRocket && "logo-layer-rocket z-30",
              getLayerClassName(layer.id, phase),
            )}
            style={
              isLetter && layer.letterDelayMs !== undefined
                ? { animationDelay: `${layer.letterDelayMs}ms` }
                : undefined
            }
            priority={layer.id === "flame" || layer.id === "d"}
          />
        );
      })}
    </div>
  );
}
