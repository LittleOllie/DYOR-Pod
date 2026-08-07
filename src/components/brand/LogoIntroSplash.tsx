"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatedDYORLogo } from "@/components/brand/AnimatedDYORLogo";
import { Button } from "@/components/ui/Button";
import {
  getLogoIntroCompleteMs,
  LOGO_INTRO_STORAGE_KEY,
  LOGO_INTRO_TIMING,
  logoFinalSrc,
  logoLayers,
  type LogoIntroPhase,
} from "@/content/brandLogo";
import { siteTagline } from "@/content/site";
import { cn } from "@/lib/utils/cn";

type LogoIntroSplashProps = {
  onContinue: () => void;
};

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

function preloadLogoAssets() {
  const sources = [...logoLayers.map((layer) => layer.src), logoFinalSrc];
  const idleCallback =
    window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
  idleCallback(() => {
    sources.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  });
}

export function LogoIntroSplash({ onContinue }: LogoIntroSplashProps) {
  const [phase, setPhase] = useState<LogoIntroPhase>("idle");
  const [showActions, setShowActions] = useState(false);
  const continueRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const effectivePhase: LogoIntroPhase = reducedMotion ? "complete" : phase;
  const effectiveShowActions = reducedMotion || showActions;

  const handleContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  useEffect(() => {
    preloadLogoAssets();
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const { flameStartMs, rocketStartMs, lettersStartMs, actionsStartMs } =
      LOGO_INTRO_TIMING;
    const completeMs = getLogoIntroCompleteMs();

    const timers = [
      window.setTimeout(() => setPhase("flame"), flameStartMs),
      window.setTimeout(() => setPhase("rocket"), rocketStartMs),
      window.setTimeout(() => setPhase("letters"), lettersStartMs),
      window.setTimeout(() => setPhase("complete"), completeMs),
      window.setTimeout(() => setShowActions(true), actionsStartMs),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [reducedMotion]);

  useEffect(() => {
    if (effectiveShowActions) {
      continueRef.current?.querySelector("button")?.focus();
    }
  }, [effectiveShowActions]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && effectiveShowActions) handleContinue();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [effectiveShowActions, handleContinue]);

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-bg-primary px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logo-intro-title"
      aria-describedby="logo-intro-desc"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_40%,rgba(19,169,166,0.18),transparent)]"
        aria-hidden="true"
      />

      <div className="relative flex w-full max-w-4xl flex-col items-center text-center">
        <p
          id="logo-intro-desc"
          className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-brand"
        >
          DYOR Mission Control
        </p>

        <AnimatedDYORLogo phase={effectivePhase} reducedMotion={reducedMotion} />

        <p id="logo-intro-title" className="sr-only">
          DYOR — Do Your Own Research
        </p>

        <p
          className={cn(
            "mt-8 max-w-md text-base text-text-secondary transition-opacity duration-500 md:text-lg",
            effectiveShowActions ? "opacity-100" : "opacity-0",
          )}
        >
          {siteTagline}
        </p>

        <div
          ref={continueRef}
          className={cn(
            "mt-8 transition-opacity duration-500",
            effectiveShowActions ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <Button
            size="lg"
            className="min-h-[52px] min-w-[12rem]"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

function getIntroSeenSnapshot() {
  try {
    return localStorage.getItem(LOGO_INTRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getIntroSeenServerSnapshot() {
  return false;
}

function subscribeIntroSeen(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

/** Shows the animated DYOR intro once per browser — first visit only. */
export function LogoIntroGate() {
  const [dismissed, setDismissed] = useState(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const introSeen = useSyncExternalStore(
    subscribeIntroSeen,
    getIntroSeenSnapshot,
    getIntroSeenServerSnapshot,
  );

  const handleContinue = useCallback(() => {
    try {
      localStorage.setItem(LOGO_INTRO_STORAGE_KEY, "true");
    } catch {
      // Private browsing or storage blocked — still dismiss for this session.
    }
    setDismissed(true);
  }, []);

  if (!mounted || dismissed || introSeen) return null;

  return <LogoIntroSplash onContinue={handleContinue} />;
}
