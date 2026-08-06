"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { useMissionAscent } from "@/features/mission-ascent/context/MissionAscentContext";
import { MissionLaunchTransition } from "@/features/mission-ascent/components/MissionLaunchTransition";

const MissionGame = dynamic(
  () =>
    import("@/features/mission-ascent/components/MissionGame").then(
      (m) => m.MissionGame,
    ),
  { ssr: false, loading: () => <MissionLoadingShell /> },
);

function MissionLoadingShell() {
  return (
    <div className="flex h-full items-center justify-center bg-bg-deep">
      <p className="text-sm uppercase tracking-widest text-brand-bright">
        Initialising flight systems…
      </p>
    </div>
  );
}

type MissionOverlayContentProps = {
  skipTransition: boolean;
  onClose: () => void;
  mode: ReturnType<typeof useMissionAscent>["mode"];
  setIsTransitioning: ReturnType<typeof useMissionAscent>["setIsTransitioning"];
  source: ReturnType<typeof useMissionAscent>["source"];
};

function MissionOverlayContent({
  skipTransition,
  onClose,
  mode,
  setIsTransitioning,
  source,
}: MissionOverlayContentProps) {
  const [transitionDone, setTransitionDone] = useState(skipTransition);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (skipTransition || transitionDone) {
      return;
    }

    const fallback = window.setTimeout(() => {
      setTransitionDone(true);
      setIsTransitioning(false);
    }, 1200);

    return () => window.clearTimeout(fallback);
  }, [skipTransition, transitionDone, setIsTransitioning]);

  const handleTransitionComplete = useCallback(() => {
    setTransitionDone(true);
    setIsTransitioning(false);
  }, [setIsTransitioning]);

  useEffect(() => {
    if (source === "route") return;

    window.history.pushState({ missionAscent: true }, "");
    const onPopState = () => onClose();
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [source, onClose]);

  const showGame = skipTransition || transitionDone;

  return (
    <>
      <MissionLaunchTransition
        active={!skipTransition && !transitionDone}
        onComplete={handleTransitionComplete}
      />
      <div
        className="fixed inset-0 z-[240] bg-bg-deep"
        role="dialog"
        aria-modal="true"
        aria-label="DYOR Mission Ascent"
        style={{ height: "100dvh" }}
      >
        {showGame && <MissionGame mode={mode} onExit={onClose} />}
      </div>
    </>
  );
}

export function MissionOverlay() {
  const { isOpen, mode, closeMission, isTransitioning, setIsTransitioning, source } =
    useMissionAscent();

  if (!isOpen) return null;

  const skipTransition = source === "route" || !isTransitioning;

  return (
    <MissionOverlayContent
      key={`${source}-${isTransitioning ? "transition" : "direct"}`}
      skipTransition={skipTransition}
      onClose={closeMission}
      mode={mode}
      setIsTransitioning={setIsTransitioning}
      source={source}
    />
  );
}
